// types
import { TSolidPaint } from 'types/design/paint/types';

export const makeSolidPaint = (color: string, opacity = 100): TSolidPaint => ({ color, opacity, type: 'solid' });
