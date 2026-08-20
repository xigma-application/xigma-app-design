// types
import { TPoint } from 'types/canvas';
import { TVertexEndpoint } from './collectVectorPathVertexEndpoints';

// utils
import { getPolylineJoinVertices } from '../getPolylineJoinVertices';

const getAwayLeftOffset = (endpoint: TVertexEndpoint): TPoint =>
  endpoint.direction === 'outgoing' ? endpoint.offset : { x: -endpoint.offset.x, y: -endpoint.offset.y };

const getAngle = (offset: TPoint): number => Math.atan2(offset.y, offset.x);

const getBranchJoinVertices = (point: TPoint, endpoints: TVertexEndpoint[]): number[] => {
  const sorted = [...endpoints].sort((a, b) => getAngle(getAwayLeftOffset(a)) - getAngle(getAwayLeftOffset(b)));

  return sorted.flatMap((current, index) => {
    const next = sorted[(index + 1) % sorted.length];
    const currentLeft = getAwayLeftOffset(current);
    const nextLeft = getAwayLeftOffset(next);

    return [point.x, point.y, point.x + currentLeft.x, point.y + currentLeft.y, point.x - nextLeft.x, point.y - nextLeft.y];
  });
};

export const getVectorPathJoinVertices = (endpointsByVertexId: Map<string, TVertexEndpoint[]>, halfWidth: number): number[] =>
  Array.from(endpointsByVertexId.values()).flatMap((endpoints) => {
    if (endpoints.length < 2) {
      return [];
    }

    const incoming = endpoints.find((endpoint) => endpoint.direction === 'incoming');
    const outgoing = endpoints.find((endpoint) => endpoint.direction === 'outgoing');

    if (endpoints.length === 2 && incoming && outgoing) {
      return getPolylineJoinVertices(incoming.point, incoming.offset, outgoing.offset, halfWidth);
    }

    return getBranchJoinVertices(endpoints[0].point, endpoints);
  });
