export enum EventTypes {
    TOKEN = "TOKEN",
    MESSAGE = "MESSAGE",
    WELCOME = "WELCOME",
    CONVERSATION_ID = "CONVERSATION_ID",
    PAUSE_SESSION = "PAUSE_SESSION",
    RESUME_SESSION = "RESUME_SESSION",
    END_SESSION = "END_SESSION",
    PLATFORM = "PLATFORM",
    STOP_SPEAKING = "STOP_SPEAKING",
}

export type IMessageType =
    | {
          type:
              | EventTypes.TOKEN
              | EventTypes.MESSAGE
              | EventTypes.WELCOME
              | EventTypes.CONVERSATION_ID
              | EventTypes.TOKEN;
          payload: string;
      }
    | {
          type:
              | EventTypes.PAUSE_SESSION
              | EventTypes.RESUME_SESSION
              | EventTypes.STOP_SPEAKING
              | EventTypes.END_SESSION;
      };

export type IEventTypes = keyof typeof EventTypes;
