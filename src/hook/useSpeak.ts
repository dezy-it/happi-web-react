import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Uneeq } from 'uneeq-js';
import { getEncryptedSessionId } from '../utils/encrypt';

interface IUseSpeak {
    setSessionId: React.Dispatch<React.SetStateAction<string | null | undefined>>;
    sendTranscript: (text: string, sessionId: string, sessionIdJwt: string) => void;
    sessionId: string | undefined | null;
    sessionIdJwt: string | undefined | null;
}

function useSpeak(dependency: [any]): IUseSpeak {
    const [sessionId, setSessionId] = useState<string | undefined | null>(null)
    const [sessionIdJwt, setSessionIdJwt] = useState<string | undefined | null>(undefined);
    const [uneeq, setUneeq] = useState<Uneeq | null>(null)

    const sendTranscript = async (text: string, sessionId: string, sessionIdJwt: string) => {
        console.log("sessionIdJwt | ", { sessionIdJwt, sessionId })
        if (!sessionId || !sessionIdJwt) return;
        console.log("uneeq | ", { uneeq })
        await axios.post(`${process.env.REACT_APP_UNEEQ_API_URL}/api/v1/avatar/${sessionId}/speak`, {
            answer: text,
            answerAvatar: "{}",
            sessionIdJwt
        }).then((response) => {
            if (response.status === 204) return;

        })
    }

    useEffect(() => {
        if (typeof sessionId === "string") {
            const jwtId = getEncryptedSessionId(sessionId);
            setSessionIdJwt(jwtId)
        }
    }, [sessionId])

    useEffect(() => {
        if (typeof dependency[0] === "object") {
            setUneeq(dependency[0])
        }
    }, [...dependency])

    return { setSessionId, sendTranscript, sessionId, sessionIdJwt }
}

export { useSpeak }