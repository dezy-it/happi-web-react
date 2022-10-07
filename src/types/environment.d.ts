declare global {
    namespace NodeJS {
        interface ProcessEnv {
            REACT_APP_UNEEQ_API_URL: string;
            REACT_APP_UNEEQ_CONVERSATION_ID: string;
            REACT_APP_UNEEQ_JWT_SECRET: string;
        }
    }
}

export { }