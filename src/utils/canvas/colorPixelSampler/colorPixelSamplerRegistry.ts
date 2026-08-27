// types
import { TColorPixelSampler } from './types';
import { TRgba } from 'types/color';

let activeSampler: TColorPixelSampler | null = null;

export const registerColorPixelSampler = (sampler: TColorPixelSampler): TFunc => {
  activeSampler = sampler;

  return (): void => {
    if (activeSampler === sampler) {
      activeSampler = null;
    }
  };
};

export const sampleColorPixels = async (clientX: number, clientY: number): Promise<TRgba[] | null> =>
  activeSampler ? activeSampler(clientX, clientY) : null;
