// types
import { TRgba } from 'types/color';

export const rgbToCssString = ({ a, b, g, r }: TRgba): string => `rgba(${r}, ${g}, ${b}, ${a / 100})`;
