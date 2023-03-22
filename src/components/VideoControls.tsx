import React, { useEffect, useRef } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid, regular, brands, icon } from "@fortawesome/fontawesome-svg-core/import.macro";
import { faMicrophone, faPhoneSlash } from "@fortawesome/free-solid-svg-icons";
import { faComments } from "@fortawesome/free-regular-svg-icons";
import { useCallback } from "react";
import { motion } from "framer-motion";
import { useCall } from "../context/CallProvider";

const VideoControls = () => {
    const { transcript, listening, resetTranscript } = useSpeechRecognition();
    const { isVideoMode, changeCallMode } = useCall();

    const startListening = () =>
        SpeechRecognition.startListening({
            continuous: true,
            language: "en-US",
        });

    const handleListening = useCallback(() => {
        if (listening) {
            SpeechRecognition.stopListening();
        } else {
            startListening();
        }
    }, [listening]);

    const changeMode = useCallback(() => {
        changeCallMode(false);
        console.log("Chat mode activated");
    }, []);

    return (
        <motion.div
            style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                left: 0,
                backgroundColor: "white",
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
                height: "30vh",
            }}
        >
            <motion.div
                style={{
                    backgroundColor: "white",
                     borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
                }}
            >
                <motion.div
                    style={{
                        display: listening ? "flex" : "none",
                        justifyContent: "center",
                        height: "5vh",
                        marginTop:25,
                        borderTopLeftRadius: 12,
                        borderTopRightRadius: 12,
                        fontFamily: "Outfit",
                        backgroundColor: "white",
                    }}
                >
                    <p>Listening...</p>
                </motion.div>
                <div
                    style={{
                        justifyContent: "center",
                        display: "flex",
                        marginTop: 18,
                        backgroundColor: "white",
                        alignItems:"center"
                    }}
                >   
                    <FontAwesomeIcon
                        icon={faComments}
                        style={{
                            color: "000000",
                            backgroundColor: "#FFC857",
                            padding: 15,
                            borderRadius: "50%",
                            width: 24,
                            height: 24,
                        }}
                        onClick={changeMode}
                        cursor="pointer"
                    />
                    <FontAwesomeIcon
                        icon={faMicrophone}
                        style={{
                            color: "ffffff",
                            backgroundColor: "#866EE1",
                            padding: 15,
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            margin: "0 80",
                            border: listening ? "5px solid #c4b9eb" : "3px solid #866EE1",
                        }}
                        cursor="pointer"
                        onClick={handleListening}
                    />
                    <FontAwesomeIcon
                        icon={faPhoneSlash}
                        cursor="pointer"
                        style={{
                            color: "ffffff",
                            backgroundColor: "#DE3737",
                            padding: 15,
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                        }}
                    />
                </div>
                <motion.div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: 10,
                        fontFamily: "Outfit",
                        backgroundColor: "white",
                    }}
                >
                    {listening ? <p>Tap to get response</p> : <p>Tap to speak</p>}
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default VideoControls;
