// types
import { THsv } from '../types';

// utils
import { hexToRgb } from 'utils/color/hexToRgb';
import { rgbToHsv } from './rgbToHsv';

export const hexToHsv = (hex: string): THsv => rgbToHsv(hexToRgb(hex));
