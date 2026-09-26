// types
import { TPaint } from 'types/design/paint/types';

export const getVisibleStrokePaints = (strokes: TPaint[]): TPaint[] => strokes.filter((paint) => paint.visible !== false);
