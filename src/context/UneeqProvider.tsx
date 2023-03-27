import axios from "axios";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Uneeq } from "uneeq-js";
import { sendResponseToApplication } from "../hook/helper";
import { IEventTypes } from "../types";
import { IUneeqContextData } from "./UneeqProvider.d";

const UneeqContext = React.createContext<IUneeqContextData>({
    setAvatarVideoContainer: () => {},
    setLocalVideoContainer: () => {},
    sendTranscript: () => {},
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

    const endSession = useCallback(() => {
        if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: "END_SESSION" }));
        }
        uneeq.current?.endSession();
    }, [uneeq]);

    const sendTranscript = useCallback(
        (message: string) => {
            uneeq.current?.sendTranscript(message);
        },
        [uneeq]
    );

    const handleNativeMessage = useCallback(
        (response: any) => {
            try {
                if (!("data" in response)) throw new Error();
                if (typeof response.data !== "string") throw new Error();

                let data: MessageProps = JSON.parse(response.data);

                if (data.type === "CONVERSATION_ID") setConversationId(data.payload);
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
        [uneeq, endSession]
    );

    useEffect(() => {
        document.addEventListener("message", handleNativeMessage);
        window.addEventListener("message", handleNativeMessage);

        return () => {
            document.removeEventListener("message", handleNativeMessage);
            window.removeEventListener("message", handleNativeMessage);
        };
        // eslint-disable-next-line
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
    }, [token]);

    // eslint-disable-next-line
    const handleUneeqMessage = (msg: any) => {
        if (typeof msg === "object" && "uneeqMessageType" in msg) {
            switch (msg.uneeqMessageType) {
                case "Ready":
                    uneeq.current?.enableMicrophoneAndCamera(false);
                    break;
                case "ServiceUnavailable":
                    sendResponseToApplication({
                        type: "ERROR",
                        message: msg?.error?.body?.message ?? "Avatar not available!",
                    });
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
                case "DevicePermissionAllowed":
                    uneeq.current?.enableMicrophoneAndCamera(false);
                    break;
                default:
                    break;
            }
        }
    };

    useEffect(() => {
        async function initialize() {
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
                            // sendLocalAudio:
                            //     window.location.search.split("=")[1] === "android" ? false : true,
                            enableTransparentBackground: true,
                            voiceInputMode: "PUSH_TO_TALK",
                        });
                    window.uneeq = uneeq.current;
                    await uneeq.current.initWithToken(token);
                }
            }
        }

        initialize();
    }, [token, localVideoContainer, avatarVideoContainer, conversationId]);

    const context = {
        setAvatarVideoContainer,
        setLocalVideoContainer,
        sendTranscript,
    };

    return <UneeqContext.Provider value={context}>{children}</UneeqContext.Provider>;
};

export default UneeqProvider;
