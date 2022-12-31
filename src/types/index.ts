export enum EventTypes {
    TOKEN = "TOKEN",
    MESSAGE = "MESSAGE",
    WELCOME = "WELCOME",
    CONVERSATION_ID = "CONVERSATION_ID",
    PAUSE_SESSION = "PAUSE_SESSION",
    RESUME_SESSION = "RESUME_SESSION",
    END_SESSION = "END_SESSION",
    PLATFORM = "PLATFORM"
}

export type IEventTypes = keyof typeof EventTypes;