// types
import { TLineStrokeShape } from 'utils/canvas/line/types';
import { TPoint } from 'types/canvas';

export type TVectorStrokePath = { closed: boolean; points: TPoint[] };

export type TVectorStrokeShape = TLineStrokeShape[];
