import { isMacOs } from 'react-device-detect';

// hooks
import { TPrimaryKey } from 'hooks';

export const ALT = isMacOs ? '⌥' : 'Alt';
export const CONTROL = isMacOs ? '⌘' : 'Ctrl';
export const CONTROL_PRIMARY_KEY: TPrimaryKey = isMacOs ? 'meta' : 'control';
export const CTRL = isMacOs ? '⌃' : 'Ctrl';
export const GLOBE = '🌐';
export const SHIFT = isMacOs ? '⇧' : 'Shift';
