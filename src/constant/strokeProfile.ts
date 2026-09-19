// @xigma
import eyeImage from '@xigma/assets/images/stroke-profiles/eye.png';
import mirroredTaperImage from '@xigma/assets/images/stroke-profiles/mirrored-taper.png';
import quarterTaperImage from '@xigma/assets/images/stroke-profiles/quarter-taper.png';
import taperImage from '@xigma/assets/images/stroke-profiles/taper.png';
import wedgeImage from '@xigma/assets/images/stroke-profiles/wedge.png';

// types
import { StrokeProfile } from 'types/design/enums';

export const STROKE_PROFILE_DEFAULT = StrokeProfile.uniform;

export const STROKE_PROFILE_ORDER: StrokeProfile[] = [
  StrokeProfile.uniform,
  StrokeProfile.wedge,
  StrokeProfile.taper,
  StrokeProfile.quarterTaper,
  StrokeProfile.eye,
  StrokeProfile.mirroredTaper,
];

export const STROKE_PROFILES_FLIPPABLE: StrokeProfile[] = [StrokeProfile.wedge, StrokeProfile.taper, StrokeProfile.quarterTaper];

export const STROKE_PROFILE_IMAGES: Record<Exclude<StrokeProfile, StrokeProfile.uniform>, string> = {
  [StrokeProfile.eye]: eyeImage,
  [StrokeProfile.mirroredTaper]: mirroredTaperImage,
  [StrokeProfile.quarterTaper]: quarterTaperImage,
  [StrokeProfile.taper]: taperImage,
  [StrokeProfile.wedge]: wedgeImage,
};

export const STROKE_PROFILE_PREVIEW_WIDTH_PX = 80;

export const STROKE_PROFILE_UNIFORM_PREVIEW_HEIGHT_PX = 4;
