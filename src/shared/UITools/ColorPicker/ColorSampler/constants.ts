// others
import { translationNameSpace as parentNameSpace } from '../constants';
import { COLOR_SAMPLE_GRID_SIZE } from 'utils/canvas/colorPixelSampler/constants';

export const BOX_OFFSET = 15;
export const SAMPLE_GRID_MIDDLE_INDEX = Math.floor((COLOR_SAMPLE_GRID_SIZE * COLOR_SAMPLE_GRID_SIZE) / 2);

export const translationNameSpace = `${parentNameSpace}.sampler`;
