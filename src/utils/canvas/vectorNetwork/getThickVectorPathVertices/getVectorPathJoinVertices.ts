// types
import { TPoint } from 'types/canvas';
import { TVertexEndpoint } from './collectVectorPathVertexEndpoints';

// utils
import { getBevelVertices, getPolylineJoinVertices } from '../getPolylineJoinVertices';

const FULL_TURN = Math.PI * 2;

const getAwayLeftOffset = (endpoint: TVertexEndpoint): TPoint =>
  endpoint.direction === 'outgoing' ? endpoint.offset : { x: -endpoint.offset.x, y: -endpoint.offset.y };

const getAngle = (offset: TPoint): number => Math.atan2(offset.y, offset.x);

const getWedgeGaps = (angles: number[]): number[] =>
  angles.map((angle, index) => {
    const nextAngle = angles[(index + 1) % angles.length];
    const rawGap = nextAngle - angle;

    return rawGap > 0 ? rawGap : rawGap + FULL_TURN;
  });

const getBranchJoinVertices = (point: TPoint, endpoints: TVertexEndpoint[], halfWidth: number): number[] => {
  const sorted = [...endpoints].sort((a, b) => getAngle(getAwayLeftOffset(a)) - getAngle(getAwayLeftOffset(b)));
  const gaps = getWedgeGaps(sorted.map((endpoint) => getAngle(getAwayLeftOffset(endpoint))));
  const widestGapIndex = gaps.indexOf(Math.max(...gaps));

  return sorted.flatMap((current, index) => {
    const next = sorted[(index + 1) % sorted.length];
    const currentLeft = getAwayLeftOffset(current);
    const nextLeft = getAwayLeftOffset(next);
    const previousOffset = { x: -currentLeft.x, y: -currentLeft.y };

    if (index === widestGapIndex && gaps[index] > Math.PI) {
      return getPolylineJoinVertices(point, previousOffset, nextLeft, halfWidth);
    }

    return getBevelVertices(point, previousOffset, nextLeft);
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

    return getBranchJoinVertices(endpoints[0].point, endpoints, halfWidth);
  });
