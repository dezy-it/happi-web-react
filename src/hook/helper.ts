import { IResponseType } from "../types";

export const sendResponseToApplication = <T extends IResponseType>(message: T) => {
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(message));
    else console.log(message);
};
