import React, { useCallback, useContext, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { Session } from "../types/callContext";

const defaultContextValues: Session.CallContext<Socket> = {
	isVideoMode: true,
	changeCallMode() {},
	changeSessionMode() {},
	handleExitCall() {},
	isSpeaking: false,
	isEmotionActive: false,
	changeEmotionDetectionState() {},
}

const CallContext = React.createContext<Session.CallContext<Socket>>(defaultContextValues);

export function useCall() {
	return useContext(CallContext);
}

const CallProvider = ({ children }: React.PropsWithChildren) => {
     const [ready, setReady] = useState<undefined | boolean>(undefined);
	const [voice, setVoice] = useState<undefined | string>(undefined);
	const [isVideoMode, setIsVideoMode] = useState(true);
	const [startSession, setStartSession] = useState(false);
	const [isSpeaking, setIsSpeaking] = useState(false);
	const [isEmotionActive, setIsEmotionActive] = useState(false);
     const [socket, setSocket] = useState<Socket | undefined>(undefined);
     
     const changeCallMode = useCallback((mode: boolean) => {
			setIsVideoMode(mode);
     }, [isVideoMode]);

     const changeSessionMode = useCallback(() => {
          setStartSession(!startSession);
     }, [startSession]);
          
     const handleExitCall = useCallback(() => {
          socket?.disconnect();
          setSocket(undefined);
     }, [socket]);
     
     const changeEmotionDetectionState = useCallback(() => {
          setIsEmotionActive(!isEmotionActive);
     }, [isEmotionActive]);
     
     useEffect(() => {
          if (socket) {
               socket.on("ready", () => {
                    setReady(true);
               });
               socket.on("voice", (voice: string) => {
                    setVoice(voice);
               });
          }
     }
     , [socket]);
     
     const value = {
          isVideoMode,
          changeCallMode,
          changeSessionMode,
          handleExitCall,
          isSpeaking,
          isEmotionActive,
          changeEmotionDetectionState,
     }

     return (
          <CallContext.Provider value={value}>
               {children}
          </CallContext.Provider>
     )
}

export default CallProvider;