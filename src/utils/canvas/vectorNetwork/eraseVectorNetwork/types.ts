// types
import { TSurvivingFace } from './subtractCapsuleFromVectorNetwork/deriveFilledFaceKeys';
import { TVectorSegment, TVectorVertex } from 'types/design/types';

export type TErasedNetwork = {
  filledFaceKeys: string[];
  segments: Record<string, TVectorSegment>;
  survivingFaces: TSurvivingFace[];
  vertices: Record<string, TVectorVertex>;
};
