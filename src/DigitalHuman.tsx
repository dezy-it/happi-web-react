import React, { useEffect } from 'react';
import { useUneeq } from './context/UneeqProvider';
import { Box } from 'rebass';
import axios from 'axios';
import { getEncryptedSessionId } from './utils/encrypt';

function DigitalHuman() {
    const { setAvatarVideoContainer, setLocalVideoContainer, uneeq } = useUneeq();

    async function sendMessage() {
        if (!uneeq?.sessionId) return;
        
        const signedSessionId = await getEncryptedSessionId(uneeq.sessionId);
        const data = {
            answer: "Hey, Welcome to Happi.ai. My name is Olivia and i am your virtual friend.",
            answerAvatar: "{}",
            sessionIdJwt: signedSessionId
        }
        await axios.post(`${process.env.REACT_APP_UNEEQ_API_URL}/api/v1/avatar/${uneeq.sessionId}/speak`, data, {
            headers: {
                "content-type": "application/json"
            }
        }).then((res) => console.log(res)).catch((err) => console.log(err))
    }

    useEffect(() => {
        if (uneeq) {
            sendMessage()
            // uneeq.sendTranscript("Hey, Welcome to Happi.ai. My name is Olivia and i am your virtual friend.y");
        }
    }, [uneeq])
    return (
        <>
            <Box style={{ height: "100vh", background: "transparent" }} ref={ref => setAvatarVideoContainer(ref)} />
            <Box style={{ display: "none" }} ref={ref => setLocalVideoContainer(ref)} />
        </>
    )
}

export default DigitalHuman