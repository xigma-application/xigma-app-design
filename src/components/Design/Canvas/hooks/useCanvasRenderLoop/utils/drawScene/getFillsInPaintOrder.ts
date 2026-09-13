// types
import { TPaint } from 'types/design/paint/types';

export const getFillsInPaintOrder = (fills: TPaint[]): TPaint[] => [...fills].reverse();
