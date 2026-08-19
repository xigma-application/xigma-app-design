import { TPoint } from 'types/canvas';

export type TPenDragOrigin = {
  nodeId: string;
  segmentId: string | null;
  vertexId: string;
};

export type TPendingOutgoingTangent = {
  tangent: TPoint;
  vertexId: string;
};
