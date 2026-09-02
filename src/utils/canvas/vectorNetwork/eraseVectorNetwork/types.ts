// types
import { TPaint } from 'types/design/paint/types';
import { TSurvivingFace } from '../types';
import { TVectorSegment, TVectorVertex } from 'types/design/types';

export type TErasedNetwork = {
  fillByKey: Record<string, TPaint[]>;
  filledFaceKeys: string[];
  segments: Record<string, TVectorSegment>;
  survivingFaces: TSurvivingFace[];
  vertices: Record<string, TVectorVertex>;
};
