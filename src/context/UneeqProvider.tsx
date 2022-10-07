import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Uneeq } from 'uneeq-js';
import { EventTypes, IEventTypes } from '../types';
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

    function handleNativeMessage(event: any) {
        let data: MessageProps = {}

        if (typeof event === "string")
            data = JSON.parse(event)

        if (data.type === EventTypes.TOKEN) {
            setToken(data.payload)
        }
        if (data.type === EventTypes.CONVERSATION_ID) {
            setConversationId(data.payload)
        }
    }

    useEffect(() => {
        document.addEventListener("message", handleNativeMessage);

        return () => document.removeEventListener("message", handleNativeMessage)
    }, [])

    useEffect(() => {
        // if (window.ReactNativeWebView) {}
        if (!token)
            fetch("http://localhost:5001/happiai-eaf5d/us-central1/getUneeqToken")
                .then((response) => response.json())
                .then((response) => {
                    setToken(response.token)
                })
                .catch((error) => console.log(error.message))
    }, [])

    useEffect(() => {
        if (avatarVideoContainer && localVideoContainer) {
            if (typeof token === "string" && token.length > 0) {
                uneeq.current = uneeq.current ?? new Uneeq({
                    url: process.env.REACT_APP_UNEEQ_API_URL,
                    avatarVideoContainerElement: avatarVideoContainer as HTMLDivElement,
                    localVideoContainerElement: localVideoContainer as HTMLDivElement,
                    conversationId: conversationId ?? process.env.REACT_APP_UNEEQ_CONVERSATION_ID,
                    messageHandler(msg: any) {
                        if (msg.uneeqMessageType === "SessionLive") {
                            setReady(true)
                        }
                    },
                });
                uneeq.current.initWithToken(token)
                
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