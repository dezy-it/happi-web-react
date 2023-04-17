import React from "react";
import { Uneeq } from "uneeq-js";
import { ICallModes } from "../types";

export type IRecognizerState = "SPEAKING" | "LISTENING" | "THINKING" | "NEUTRAL";

export interface IUneeqContextData {
    setAvatarVideoContainer: React.Dispatch<React.SetStateAction<HTMLDivElement | null>>;
    setLocalVideoContainer: React.Dispatch<React.SetStateAction<HTMLDivElement | null>>;
    sendTranscript: (message: string) => void;
    callMode: ICallModes;
    setCallMode: React.Dispatch<React.SetStateAction<ICallModes>>;
    recognizerState: IRecognizerState;
    setRecognizerState: React.Dispatch<React.SetStateAction<IRecognizerState>>;
}
