import React from "react";
import { Socket } from "socket.io-client";

namespace Session {
	interface CallContext<T extends Socket>{
		isVideoMode: boolean;
		changeCallMode: (mode: boolean) => void;
		changeSessionMode: (value: boolean) => void;
		handleExitCall: () => void;
		isSpeaking: boolean;
		isEmotionActive: boolean;
		changeEmotionDetectionState: (value?: boolean) => void;
		socket?: T;
	}
}
