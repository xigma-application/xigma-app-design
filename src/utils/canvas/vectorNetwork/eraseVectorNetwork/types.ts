// types
import { TSurvivingFace } from '../types';
import { TVectorSegment, TVectorVertex } from 'types/design/types';

export type TErasedNetwork = {
  fillColorOverrideByKey: Record<string, string>;
  filledFaceKeys: string[];
  segments: Record<string, TVectorSegment>;
  survivingFaces: TSurvivingFace[];
  vertices: Record<string, TVectorVertex>;
};
