// utils
import { hsvToHex } from './hsvToHex';

export const getHueColor = (hue: number): string => hsvToHex({ h: hue, s: 100, v: 100 });
