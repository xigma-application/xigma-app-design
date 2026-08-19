// hooks
import { TKeyMap } from 'hooks';

export type TShortcut = Omit<TKeyMap, 'action' | 'anyKey' | 'conditions'>;
