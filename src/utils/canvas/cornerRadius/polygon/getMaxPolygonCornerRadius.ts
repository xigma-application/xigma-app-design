// types
import { TDraftRect } from 'types/canvas';

// utils
import { getPolygonPoints } from 'utils/canvas/shapes/getPolygonPoints';
import { getPolygonVertexAngles } from './getPolygonVertexAngles';

// the max radius before two adjacent rounded corners start to overlap: at a vertex with interior
// angle theta, a tangent arc of radius r touches its edge at distance r / tan(theta/2) from the
// vertex — so for a shared edge between vertex i and vertex i+1, the two tangent points collide
// once r * (cot(theta_i/2) + cot(theta_i+1/2)) exceeds the edge length. The true max is the
// smallest such bound across every edge (for a regular polygon this collapses to the exact
// apothem, R * cos(pi/sides) — verified against Figma: 100x100 @ 3 sides -> 25, @ 6 sides -> 43.3)
export const getMaxPolygonCornerRadius = (bounds: TDraftRect, sides: number): number => {
  const vertices = getPolygonPoints(bounds, sides);
  const cotHalfAngles = getPolygonVertexAngles(vertices).map((angle) => 1 / Math.tan(angle / 2));

  return vertices.reduce((max, vertex, index) => {
    const nextIndex = (index + 1) % vertices.length;
    const next = vertices[nextIndex];
    const edgeLength = Math.hypot(next.x - vertex.x, next.y - vertex.y);
    const maxForEdge = edgeLength / (cotHalfAngles[index] + cotHalfAngles[nextIndex]);

    return Math.min(max, maxForEdge);
  }, Infinity);
};
