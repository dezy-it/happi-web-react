import axios from 'axios';
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import WebView from 'react-native-webview';
import { Socket } from "socket.io-client";
import validator from "validator";
import { useCall } from "../context/CallProvider";

export type IConversationType = {
	message: string;
	isAvatar: boolean;
	key: string;
	isExerciseStarted?: boolean;
};

export type IQuickChatResponse = {
	ord_number: number;
	conv_id: string;
	reply: string;
};

export type IUseQuickChatReturnType = {
	conversation: IConversationType[];
	sendMessage: (
		message: string,
		webViewRef: WebView | null,
		socket?: Socket
	) => Promise<{ message?: string; type?: "ERROR" | "EXERCISE" | "SUCCESS" }>;
	isTyping: boolean;
	shouldUpdateConversation: (value: boolean) => void;
	text: IConversationType | undefined;
};

const sample1 = ["exercise"];
const sample2 = ["exercises"];
function checkExerciseMessage(message: string) {
	if (
		sample1.map((item) => message.includes(item.toLowerCase())).every((item) => item) ||
		sample2.map((item) => message.includes(item)).every((item) => item)
	)
		return true;
	return false;
}

function useQucikChat(webViewRef: React.RefObject<WebView<{}>>): IUseQuickChatReturnType;

/**
 * It takes a message as a parameter, sends it to the QuickChat API, and returns the response
 * @returns An object with two properties:
 * 1. conversation: An array of objects that contains the conversation between the user and the bot.
 * 2. sendMessage: A function that takes a message as a parameter, sends it to the QuickChat API, and
 * returns the response.
 */
function useQucikChat(ref: React.RefObject<WebView<{}>>) {
	const [conversation, setConversation] = useState<IConversationType[]>([]);
	const [text, setText] = useState<IConversationType | undefined>(undefined);
	const [webView] = useState<React.RefObject<WebView<{}>>["current"]>(ref.current);
	const [convId, setConvId] = useState<string | undefined>(undefined);
	const [isTyping, setIsTyping] = useState(false);

	const { socket } = useCall();

	const body = useMemo(() => {
		return {
			api_key: "bODyWNLBYvEeXvvSytQHcQAP3b97x0bzyn86i3he",
			scenario_id: "diw8qz",
			conv_id: convId
		};
	}, [convId,]);

	/**
	 * It takes a message as a parameter, sends it to the QuickChat API, and returns the response
	 * @param {string} message - The message that the user has sent.
	 * @return Returns a promise boolean if the message was sent successfully or false if the message was not sent successfully.
	 */
	const sendMessage: IUseQuickChatReturnType["sendMessage"] = useCallback(
		async (message: string, webView: WebView | null, socket?: Socket) => {
			try {
				if (validator.isEmpty(message))
					return {
						message: "Empty Message!",
					};

				let length = conversation.length;
				/* Pushing user sent message in the conversation array */
				setConversation((oldConversation) => [
					...oldConversation,
					{ message, isAvatar: false, key: `${body.conv_id}-${length}` },
				]);

				setIsTyping(true);

				if (checkExerciseMessage(message)) {
					const message = "Yes, Ofcourse. Here are the exercises you can choose from: ";
					webView?.postMessage(JSON.stringify({ type: "MESSAGE", payload: message }));
					setText({
						message,
						isAvatar: true,
						key: `${convId}-${conversation.length + 1}`,
						isExerciseStarted: true,
					});
					return {
						message: "Started Exercises",
						type: "EXERCISE",
					};
				}

				console.log("sending to inferQ...");
				socket?.emit("INPUT_TXT", { type: "input", text: message });
				/* Calling QuickChat API to get the response of provided message */
				const response = await axios.post("https://dedicatedjz59kd.quickchat.ai/chat", {
					...body,
					text: message,
				});
				if (typeof response.data === "object") {
					const qucikChatResponse = response.data as IQuickChatResponse;

					if (webView) {
						webView.postMessage(
							JSON.stringify({ type: "MESSAGE", payload: qucikChatResponse.reply })
						);
					}

					if (typeof convId === "string")
						if (convId !== qucikChatResponse.conv_id) throw new Error("SESSION");

					if (typeof convId !== "string") setConvId(qucikChatResponse.conv_id);

					setText({
						message: qucikChatResponse.reply,
						isAvatar: true,
						key: `${qucikChatResponse.conv_id}-${length + 1}`,
					});

					return {
						message: "Request Successful",
						type: "SUCCESS",
					};
				}
				throw new Error("SERVER");
			} catch (error: any) {
				setIsTyping(false);
				return {
					message: "Something went wrong!",
					type: "ERROR",
				};
			}
		},
		[
			webView,
			conversation.length,
			conversation,
			body.conv_id,
		]
	);

	const shouldUpdateConversation = useCallback(
		(shouldUpdate: boolean) => {
			if (!text) return;
			if (shouldUpdate) {
				setIsTyping(false);
				setConversation((oldConversation) => [...oldConversation, text]);
				setText(undefined);
			}
		},
		[text, conversation]
	);

	return {
		conversation: [...conversation].reverse().slice(0, 4).reverse(),
		sendMessage,
		isTyping,
		shouldUpdateConversation,
		text,
	};
}

export { useQucikChat };

