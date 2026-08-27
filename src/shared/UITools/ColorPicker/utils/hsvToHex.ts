// types
import { THsv } from '../types';

// utils
import { rgbToHex } from 'utils/color/rgbToHex';
import { hsvToRgb } from './hsvToRgb';

export const hsvToHex = (hsv: THsv): string => rgbToHex(hsvToRgb(hsv));
