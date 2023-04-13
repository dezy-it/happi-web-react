import { motion } from "framer-motion";
import React, { useCallback, useEffect } from "react";
import voice, { useSpeechRecognition } from "react-speech-recognition";
import { ReactComponent as ChatIcon } from "../assets/comments-regular.svg";
import { ReactComponent as MicIcon } from "../assets/microphone.svg";
import { ReactComponent as CallIcon } from "../assets/phone.svg";
import { colors } from "../constants/color";
import { useUneeq } from "../context/UneeqProvider";
import { sendResponseToApplication } from "../hook/helper";
import IconButton from "./IconButton";

export default function CallController() {
    const { callMode, setCallMode } = useUneeq();

    return (
        <motion.div
            initial={{ height: 140, bottom: 0 }}
            animate={{ bottom: callMode === "CHAT" ? -140 : 0 }}
            style={bottomSheetStyle}
        >
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    height: "100%",
                    placeContent: "center",
                    placeItems: "center",
                }}
            >
                <IconButton
                    icon={ChatIcon}
                    backgroundColor={colors.yellow}
                    color="black"
                    onPress={() => {
                        setCallMode("CHAT");
                    }}
                />
                <ListeningButton />
                <IconButton
                    icon={CallIcon}
                    iconStyle={{ rotate: "-225deg" }}
                    onPress={() => sendResponseToApplication({ type: "END_SESSION" })}
                />
            </div>
        </motion.div>
    );
}

const ListeningButton = React.memo(() => {
    const { sendTranscript } = useUneeq();
    const {
        transcript,
        finalTranscript,
        resetTranscript,
        isMicrophoneAvailable,
        browserSupportsSpeechRecognition,
        listening,
    } = useSpeechRecognition();

    const handleMicrophone = useCallback(async () => {
        try {
            if (!listening) {
                await resetTranscript();
                await voice.startListening({
                    language: "en-US",
                });
            } else {
                await voice.stopListening();
                await sendResponseToApplication({
                    type: "RECOGNIZED_TEXT",
                    payload: transcript,
                });
                await sendTranscript(transcript);
            }
        } catch (error) {
            sendResponseToApplication({ type: "ERROR", message: "Unable to access microphone" });
            resetTranscript();
        }
    }, [listening, transcript, finalTranscript]);

    useEffect(() => {
        sendResponseToApplication({ type: "LISTENING_STATE", payload: listening });
    }, [listening]);

    useEffect(() => {
        async function sendAndReset() {
            await sendResponseToApplication({ type: "RECOGNIZED_TEXT", payload: finalTranscript });
            sendResponseToApplication({ type: "RECOGNIZED_TEXT", payload: finalTranscript });
            await sendTranscript(finalTranscript);
        }
        if (finalTranscript.length > 0) sendAndReset();

        //     // eslint-disable-next-line
    }, [finalTranscript]);

    useEffect(() => {
        if (!isMicrophoneAvailable)
            sendResponseToApplication({
                type: "ERROR",
                message: "Speech Recognition is not available",
            });
        if (!browserSupportsSpeechRecognition)
            sendResponseToApplication({
                type: "ERROR",
                message: "Speech recognition not supported",
            });
    }, [isMicrophoneAvailable, browserSupportsSpeechRecognition]);

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
            }}
        >
            <motion.div
                animate={{ opacity: finalTranscript.length > 0 ? 1 : 0 }}
                style={toolTipContainer}
            >
                <div style={toolTip}>{finalTranscript}</div>
            </motion.div>
            <IconButton
                onPress={handleMicrophone}
                icon={MicIcon}
                size={64}
                backgroundColor={colors.purple}
                animate={listening}
            />
            <p style={{ fontSize: 14, fontWeight: 500 }}>
                {listening ? "Tap to get response" : "Tap to speak"}
            </p>
        </div>
    );
});

const bottomSheetStyle: React.CSSProperties = {
    position: "fixed",
    right: 0,
    left: 0,
    backgroundColor: "white",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 16,
};

const toolTipContainer: React.CSSProperties = {
    position: "fixed",
    bottom: 160,
    left: 0,
    right: 0,
    padding: 20,
    display: "flex",
    justifyContent: "center",
};

const toolTip: React.CSSProperties = {
    borderRadius: 16,
    background: colors.yellow,
    color: "black",
    padding: "10px 20px",
};
