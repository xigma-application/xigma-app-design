// types
import { TPoint } from 'types/canvas';

export type TBounds = [number, number, number, number];

export type TNodeFace = { bounds: TBounds; key: string; points: TPoint[]; sign: number };
