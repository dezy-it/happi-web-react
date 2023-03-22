import axios from "axios";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Uneeq } from "uneeq-js";
import { EventTypes, IEventTypes, WebViewMessageEvents } from "../types";
import { getEncryptedSessionId } from "../utils/encrypt";
import {} from "./UneeqProvider";
import { IUneeqContextData } from "./UneeqProvider.d";

const UneeqContext = React.createContext<IUneeqContextData>({
    setAvatarVideoContainer: () => {},
    setLocalVideoContainer: () => {},
    uneeq: null,
});

export function useUneeq() {
    return useContext(UneeqContext);
}

interface UneeqContextProps extends React.PropsWithChildren<{}> {}
interface MessageProps {
    type?: IEventTypes;
    payload?: string;
}

const UneeqProvider: React.FC<UneeqContextProps> = ({ children }) => {
    const [token, setToken] = useState<string | undefined>(undefined);
    const uneeq = useRef<Uneeq | null>(null);
    const [avatarVideoContainer, setAvatarVideoContainer] = useState<HTMLDivElement | null>(null);
    const [localVideoContainer, setLocalVideoContainer] = useState<HTMLDivElement | null>(null);
    const [conversationId, setConversationId] = useState<undefined | string>(undefined);
    const [platform, setPlatform] = useState<string | undefined>(undefined);

    const endSession = useCallback(() => {
        if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: "END_SESSION" }));
        }
        uneeq.current?.endSession();
    }, [uneeq.current]);

    const handleNativeMessage = useCallback(
        (response: any) => {
            try {
                if (!("data" in response)) throw new Error();
                if (typeof response.data !== "string") throw new Error();

                let data: MessageProps = JSON.parse(response.data);

                if (data.type === "CONVERSATION_ID") setConversationId(data.payload);
                if (data.type === "PLATFORM") setPlatform(data.payload);
                if (data.type === "TOKEN") setToken(data.payload);
                if (data.type === "MESSAGE")
                    uneeq.current?.sendTranscript(data.payload ?? "Can you please repeat?");
                if (data.type === "WELCOME") uneeq.current?.playWelcomeMessage();
                if (data.type === "PAUSE_SESSION") uneeq.current?.pauseSession();
                if (data.type === "RESUME_SESSION") uneeq.current?.resumeSession();
                if (data.type === "END_SESSION") endSession();
            } catch (error) {
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(
                        JSON.stringify({ type: "ERROR", message: "invalid_data" })
                    );
                }
            }
        },
        [uneeq.current]
    );

    useEffect(() => {
        document.addEventListener("message", handleNativeMessage);
        window.addEventListener("message", handleNativeMessage);

        return () => {
            document.removeEventListener("message", handleNativeMessage);
            window.removeEventListener("message", handleNativeMessage);
        };
    }, []);

    useEffect(() => {
        if (!token)
            axios
                .post(`${process.env.REACT_APP_CLOUD_ENDPOINT}/getUneeqToken`, {
                    token: process.env.REACT_APP_UNEEQ_CONVERSATION_ID,
                })
                .then((res) => {
                    setToken(res.data.token);
                })
                .catch((err) => {
                    console.log(err.message);
                });
    }, []);

    useEffect(() => {
        if (!avatarVideoContainer) return;
        if (avatarVideoContainer.children.length < 1) return;
        const videoElement = avatarVideoContainer.children[0] as HTMLVideoElement;
        if (!platform || platform === "android") {
            videoElement.defaultMuted = false;
            videoElement.muted = false;
            videoElement.volume = 1;
        } else {
            videoElement.defaultMuted = true;
            videoElement.muted = true;
            videoElement.volume = 0;
        }
    }, [avatarVideoContainer?.children.length, platform]);

    useEffect(() => {
        setPlatform(window.location.search.split("=")[1]);
    }, []);

    const sendResponseToApplication = <
        T extends { type: WebViewMessageEvents; [key: string]: any }
    >(
        message: T
    ) => {
        if (window.ReactNativeWebView)
            window.ReactNativeWebView.postMessage(JSON.stringify(message));
    };

    const handleUneeqMessage = (msg: any) => {
        if (typeof msg === "object" && "uneeqMessageType" in msg) {
            switch (msg.uneeqMessageType) {
                case "ServiceUnavailable":
                    sendResponseToApplication({ type: "END_SESSION" });
                    break;
                case "SessionLive":
                    sendResponseToApplication({ type: "READY" });
                    break;
                case "AvatarAnswer":
                    sendResponseToApplication({ type: "UPDATE_CONVERSATION" });
                    break;
                case "StartedSpeaking":
                    sendResponseToApplication({ type: "START_SPEAKING" });
                    break;
                case "FinishedSpeaking":
                    sendResponseToApplication({ type: "FINISHED_SPEAKING" });
                    break;
                case "AvatarAvailable":
                    sendResponseToApplication({ type: "SHOW_CAMERA" });
                    break;
                default:
                    break;
            }
        }
    };

    useEffect(() => {
        if (uneeq.current) {
            uneeq.current.enableMicrophone(false);
            uneeq.current.enableMicrophoneAndCamera(false);
        }
    }, [uneeq.current]);

    useEffect(() => {
        if (avatarVideoContainer && localVideoContainer) {
            if (typeof token === "string" && token.length > 0) {
                uneeq.current =
                    uneeq.current ??
                    new Uneeq({
                        url: process.env.REACT_APP_UNEEQ_API_URL,
                        avatarVideoContainerElement: avatarVideoContainer as HTMLDivElement,
                        localVideoContainerElement: localVideoContainer as HTMLDivElement,
                        conversationId:
                            conversationId ?? process.env.REACT_APP_UNEEQ_CONVERSATION_ID,
                        messageHandler: handleUneeqMessage,
                        sendLocalVideo: false,
                        sendLocalAudio: false,
                        enableTransparentBackground: true,
                        enableClientPerformanceMessage: true,
                        voiceInputMode: "VOICE_ACTIVITY",
                    });
                window.uneeq = uneeq.current;

                uneeq.current.initWithToken(token);
            }
        }
    }, [token, localVideoContainer, avatarVideoContainer, conversationId]);

    const context = {
        setAvatarVideoContainer,
        setLocalVideoContainer,
        uneeq: uneeq.current,
    };

    return <UneeqContext.Provider value={context}>{children}</UneeqContext.Provider>;
};

export default UneeqProvider;
