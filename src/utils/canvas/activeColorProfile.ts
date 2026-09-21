// types
import { TColorProfile } from 'types/canvas';

let activeColorProfile: TColorProfile = 'srgb';

export const setActiveColorProfile = (colorProfile: TColorProfile): void => {
  activeColorProfile = colorProfile;
};

export const getActiveColorProfile = (): TColorProfile => activeColorProfile;
