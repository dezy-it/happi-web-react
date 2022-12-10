import axios from 'axios';
import React, { useContext, useEffect, useRef, useState } from 'react'
import { Uneeq } from 'uneeq-js';
import { EventTypes, IEventTypes } from '../types';
import { getEncryptedSessionId } from '../utils/encrypt';
import { } from './UneeqProvider'
import { IUneeqContextData } from './UneeqProvider.d';

const UneeqContext = React.createContext<IUneeqContextData>({
    setAvatarVideoContainer: () => { },
    setLocalVideoContainer: () => { },
    uneeq: null
});

export function useUneeq() {
    return useContext(UneeqContext);
}

interface UneeqContextProps extends React.PropsWithChildren { }
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
    const [ready, setReady] = useState(false);
    const [sessionIdJwt, setSessionIdJwt] = useState<string | undefined | null>(undefined);

    const sendTranscript = async (text: string, sessionId?: null | string, jwtToken?: string) => {
        let session_id = sessionId ?? uneeq.current?.sessionId;
        let session_id_jwt = sessionIdJwt ?? getEncryptedSessionId(jwtToken ?? session_id ?? "")
        if (!sessionIdJwt) {
            setSessionIdJwt(session_id_jwt);
        }
        await axios.post(`${process.env.REACT_APP_UNEEQ_API_URL}/api/v1/avatar/${session_id}/speak`, {
            answer: text,
            answerAvatar: "{}",
            sessionIdJwt: session_id_jwt
        }).then((response) => {
            if (response.status === 204) return;
            return uneeq.current?.sendTranscript("Error")
        }).catch((err) => {
            return uneeq.current?.sendTranscript("Error")
        })
    }

    function handleNativeMessage(response: any) {
        let data: MessageProps = {};

        if (typeof response.data === "string")
            data = JSON.parse(response.data);
        else
            data = response.data;

        if (!data.payload || !uneeq.current) return;

        if (data.type === EventTypes.TOKEN) {
            setToken(data.payload);
        }
        if (data.type === EventTypes.CONVERSATION_ID) {
            setConversationId(data.payload);
        }
        if (data.type === EventTypes.WELCOME) {
            if (!data.payload || data.payload === "")
                return uneeq.current.playWelcomeMessage();
            uneeq.current.sendTranscript(data.payload);
        }
        if (data.type === EventTypes.MESSAGE) {
            uneeq.current.sendTranscript(data.payload)
        }
        if (data.type === EventTypes.PAUSE_SESSION) {
            uneeq.current.pauseSession();
        }
        if (data.type === EventTypes.RESUME_SESSION) {
            uneeq.current.resumeSession();
        }
        if (data.type === EventTypes.END_SESSION) {
            uneeq.current.endSession();
        }
    }

    useEffect(() => {
        document.addEventListener("message", handleNativeMessage);
        window.addEventListener("message", handleNativeMessage);

        return () => {
            document.removeEventListener("message", handleNativeMessage);
            window.removeEventListener("message", handleNativeMessage);
        }
    }, [])

    useEffect(() => {
        if (!token)
            axios.post(`${process.env.REACT_APP_CLOUD_ENDPOINT}/getUneeqToken`, { token: process.env.REACT_APP_UNEEQ_CONVERSATION_ID }).then((res) => {
                setToken(res.data.token)
            }).catch((err) => {
                console.log(err.message)
            })
    }, [])

    const handleUneeqMessage = (msg: any) => {
        if (window.ReactNativeWebView)
            window.ReactNativeWebView.postMessage(JSON.stringify(msg))
        if (msg.uneeqMessageType === "SessionLive") {
            setReady(true)
        }
    }

    useEffect(() => {
        if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ ready }))
        }
    }, [ready])

    useEffect(() => {
        if (!ready) return;
        if (!uneeq.current) return;
        if (!uneeq.current.sessionId) return;

        const jwtToken = getEncryptedSessionId(uneeq.current.sessionId);
        setSessionIdJwt(jwtToken)
    }, [uneeq, token, ready])

    useEffect(() => {
        if (avatarVideoContainer && localVideoContainer) {
            if (typeof token === "string" && token.length > 0) {
                uneeq.current = uneeq.current ?? new Uneeq({
                    url: process.env.REACT_APP_UNEEQ_API_URL,
                    avatarVideoContainerElement: avatarVideoContainer as HTMLDivElement,
                    localVideoContainerElement: localVideoContainer as HTMLDivElement,
                    conversationId: conversationId ?? process.env.REACT_APP_UNEEQ_CONVERSATION_ID,
                    messageHandler: handleUneeqMessage,
                    sendLocalVideo: false,
                    sendLocalAudio: true
                });
                window.uneeq = uneeq.current

                uneeq.current.initWithToken(token);
            }
        }
    }, [token, localVideoContainer, avatarVideoContainer, conversationId])

    const context = {
        setAvatarVideoContainer,
        setLocalVideoContainer,
        uneeq: uneeq.current
    }

    return (
        <UneeqContext.Provider value={context}>
            {children}
        </UneeqContext.Provider>
    )
}

export default UneeqProvider