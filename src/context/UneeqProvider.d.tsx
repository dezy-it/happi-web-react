import React from 'react'
import { Uneeq } from 'uneeq-js';

export interface IUneeqContextData {
    setAvatarVideoContainer: React.Dispatch<React.SetStateAction<HTMLDivElement | null>>;
    setLocalVideoContainer: React.Dispatch<React.SetStateAction<HTMLDivElement | null>>;
    uneeq: Uneeq | null;
}