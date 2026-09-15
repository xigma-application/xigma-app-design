// types
import { TPatternThumbnailSampler } from './types';

let activeSampler: TPatternThumbnailSampler | null = null;

export const registerPatternThumbnailSampler = (sampler: TPatternThumbnailSampler): TFunc => {
  activeSampler = sampler;

  return (): void => {
    if (activeSampler === sampler) {
      activeSampler = null;
    }
  };
};

export const samplePatternThumbnail = async (sourceNodeId: string, size: number): Promise<string | null> =>
  activeSampler ? activeSampler(sourceNodeId, size) : null;
