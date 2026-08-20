// types
import { TPoint } from 'types/canvas';
import { TVectorNode, TViewport } from 'types/design/types';

export type TPenPointHoverKind = 'active-vertex' | 'edge' | 'edge-snap' | 'vertex';

export type TPenPointHoverContext = {
  excludeVertexId?: string | null;
  node: TVectorNode;
  point: TPoint;
  viewport: TViewport;
};

export type TPenPointHoverResult = {
  hoverKind: TPenPointHoverKind;
  point: TPoint;
  segmentId: string | null;
};
