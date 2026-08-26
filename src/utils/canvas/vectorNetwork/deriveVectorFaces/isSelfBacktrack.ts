// types
import { TVectorFaceStep } from '../walkVectorFace';

export const isSelfBacktrack = (steps: TVectorFaceStep[]): boolean => steps.length === 2 && steps[0].segmentId === steps[1].segmentId;
