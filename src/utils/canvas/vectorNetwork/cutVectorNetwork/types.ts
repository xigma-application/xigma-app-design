// types
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

export type TVectorNetworkComponent = Pick<TVectorNode, 'segments' | 'vertexHandleModes' | 'vertices'> & {
  fillColorOverrideByKey?: Record<string, string>;
  filledFaceKeys?: string[];
};

export type TLineNetworkCrossing = { lineT: number; point: TPoint; segmentId: string; t: number };
