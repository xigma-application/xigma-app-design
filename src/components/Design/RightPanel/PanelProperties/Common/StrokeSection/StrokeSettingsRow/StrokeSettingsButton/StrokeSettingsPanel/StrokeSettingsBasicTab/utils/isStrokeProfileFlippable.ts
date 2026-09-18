// others
import { STROKE_PROFILES_FLIPPABLE } from 'constant/strokeProfile';

// types
import { StrokeProfile } from 'types/design/enums';

export const isStrokeProfileFlippable = (profile: StrokeProfile): boolean => STROKE_PROFILES_FLIPPABLE.includes(profile);
