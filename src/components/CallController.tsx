import { motion } from "framer-motion";
import React, { useCallback, useEffect, useState } from "react";
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
        finalTranscript,
        resetTranscript,
        isMicrophoneAvailable,
        browserSupportsSpeechRecognition,
        listening,
    } = useSpeechRecognition();

    const handleMicrophone = useCallback(async () => {
        try {
            if (!listening) {
                await voice.startListening({
                    continuous: true,
                    language: "en-US",
                });
            } else {
                await voice.stopListening();
            }
        } catch (error) {
            sendResponseToApplication({ type: "ERROR", message: "Unable to start microphone" });
            resetTranscript();
        }
    }, [listening]);

    useEffect(() => {
        sendResponseToApplication({ type: "LISTENING_STATE", payload: listening });
        if (!listening) resetTranscript();
    }, [listening]);

    useEffect(() => {
        async function sendAndReset() {
            if (listening) return;
            await sendResponseToApplication({ type: "RECOGNIZED_TEXT", payload: finalTranscript });
            sendResponseToApplication({ type: "RECOGNIZED_TEXT", payload: finalTranscript });
            await sendTranscript(finalTranscript);
            await resetTranscript();
        }
        if (finalTranscript.length > 0) sendAndReset();

        // eslint-disable-next-line
    }, [finalTranscript, listening]);

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
