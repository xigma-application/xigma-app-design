// types
import { TVectorFragment } from '../types';

let vectorClipboardFragment: TVectorFragment | null = null;

export const setVectorClipboardFragment = (fragment: TVectorFragment): void => {
  vectorClipboardFragment = structuredClone(fragment);
};

export const getVectorClipboardFragment = (): TVectorFragment | null => vectorClipboardFragment;
