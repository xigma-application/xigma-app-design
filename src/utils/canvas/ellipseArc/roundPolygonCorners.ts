// types
import { TPoint } from 'types/canvas';

// utils
import { getCornerFilletPoints } from './getCornerFilletPoints';
import { getPolylineDirectionAtLength } from './getPolylineDirectionAtLength';
import { getPolylineLength } from './getPolylineLength';
import { trimPolyline } from './trimPolyline';

const MIN_TURN = 1e-3;

const getRuns = (points: TPoint[], corners: number[]): TPoint[][] =>
  corners.map((corner, index) => {
    const next = corners[(index + 1) % corners.length];
    const steps = next > corner ? next - corner : points.length - corner + next;

    return Array.from({ length: steps + 1 }, (_, step) => points[(corner + step) % points.length]);
  });

const getTangentLength = (incoming: TPoint[], outgoing: TPoint[], radius: number): number => {
  const incomingLength = getPolylineLength(incoming);
  const inDirection = getPolylineDirectionAtLength(incoming, incomingLength);
  const outDirection = getPolylineDirectionAtLength(outgoing, 0);
  const turn = Math.acos(Math.min(Math.max(inDirection.x * outDirection.x + inDirection.y * outDirection.y, -1), 1));

  return turn > MIN_TURN ? Math.min(radius * Math.tan(turn / 2), incomingLength / 2, getPolylineLength(outgoing) / 2) : 0;
};

const getFillet = (incoming: TPoint[], outgoing: TPoint[], tangent: number, segments: number): TPoint[] => {
  const incomingLength = getPolylineLength(incoming);

  return getCornerFilletPoints(
    trimPolyline(incoming, 0, tangent).at(-1) as TPoint,
    getPolylineDirectionAtLength(incoming, incomingLength - tangent),
    trimPolyline(outgoing, tangent, 0)[0],
    getPolylineDirectionAtLength(outgoing, tangent),
    tangent,
    segments,
  );
};

export const roundPolygonCorners = (points: TPoint[], corners: number[], radius: number, segments: number): TPoint[] => {
  const runs = getRuns(points, corners);
  const tangents = runs.map((run, index) => getTangentLength(runs[(index - 1 + runs.length) % runs.length], run, radius));

  return runs.flatMap((run, index) => {
    const next = runs[(index + 1) % runs.length];
    const endTangent = tangents[(index + 1) % runs.length];
    const trimmed = trimPolyline(run, tangents[index], endTangent);

    return endTangent > 0 ? [...trimmed, ...getFillet(run, next, endTangent, segments)] : trimmed.slice(0, -1);
  });
};
