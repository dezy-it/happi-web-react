import React, { useCallback, useState } from "react";
import validator from "validator";

type ChatTextField<> = {
    onSend: (data: { text: string; type: "AUDIO" | "TEXT" }) => void;
    onAudioMessage?: () => void;
};

const ChatTextField = ({ onSend, onAudioMessage }: ChatTextField) => {
    const [text, setText] = useState("");

    const handleSendMessage = useCallback(() => {
        if (validator.isEmpty(text)) return;
        onSend({ text, type: "TEXT" });
        setText("");
    }, [text]);

     return <div>
         
    </div>;
};
