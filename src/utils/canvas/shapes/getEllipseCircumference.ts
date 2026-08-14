// types
import { TEllipseArcLengthSample } from 'types/canvas';

export const getEllipseCircumference = (table: TEllipseArcLengthSample[]): number => table[table.length - 1]?.cumulativeLength ?? 0;
