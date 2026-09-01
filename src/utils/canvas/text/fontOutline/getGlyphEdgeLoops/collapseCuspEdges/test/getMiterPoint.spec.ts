// utils
import { getMiterPoint } from '../getMiterPoint';

describe('getMiterPoint', () => {
  it('uses a curve edge’s tangentEnd (reversed) as its outgoing direction at edge.end', () => {
    // prevEdge arrives at (0,0) travelling in direction (1,0): tangentEnd = control2 - end, so a
    // control point behind the end point in -x gives that outgoing direction once negated
    const prevEdge = { start: { x: -1, y: 0 }, end: { x: 0, y: 0 }, tangentStart: null, tangentEnd: { x: -1, y: 0 } };
    // nextEdge leaves (2, -2) travelling in direction (0,1) — straight up
    const nextEdge = { start: { x: 2, y: -2 }, end: { x: 3, y: -2 }, tangentStart: { x: 0, y: 1 }, tangentEnd: null };

    expect(getMiterPoint(prevEdge, nextEdge)).toEqual({ x: 2, y: 0 });
  });

  it('falls back to the endpoint-to-endpoint direction for a straight edge', () => {
    const prevEdge = { start: { x: -1, y: 0 }, end: { x: 0, y: 0 }, tangentStart: null, tangentEnd: null };
    const nextEdge = { start: { x: 2, y: -2 }, end: { x: 2, y: -1 }, tangentStart: null, tangentEnd: null };

    expect(getMiterPoint(prevEdge, nextEdge)).toEqual({ x: 2, y: 0 });
  });

  it('returns null when the two directions are parallel', () => {
    const prevEdge = { start: { x: -1, y: 0 }, end: { x: 0, y: 0 }, tangentStart: null, tangentEnd: null };
    const nextEdge = { start: { x: 2, y: -2 }, end: { x: 3, y: -2 }, tangentStart: null, tangentEnd: null };

    expect(getMiterPoint(prevEdge, nextEdge)).toBeNull();
  });

  it('accepts a miter point that lands close to the bridge it replaces', () => {
    const prevEdge = { start: { x: -1, y: 0 }, end: { x: 0, y: 0 }, tangentStart: null, tangentEnd: null };
    // bridge gap is 2 units (0,0) -> (2,0); the miter point below (the X axis meeting the vertical
    // line x=2) lands 2 units from prevEdge.end, well within 4x the 2-unit gap
    const nextEdge = { start: { x: 2, y: 0 }, end: { x: 2, y: -1 }, tangentStart: null, tangentEnd: null };

    expect(getMiterPoint(prevEdge, nextEdge)).toEqual({ x: 2, y: 0 });
  });

  it('rejects a miter point that lands far beyond the bridge’s own gap — the real "(" glyph regression', () => {
    // mock — real edge data from Inter's "(": a short (~3.4 unit), near-flat straight bridge at its
    // bottom tip sits between these two long, shallow-angle curve flanks. Their tangent lines cross
    // ~34 units away — over 10x the bridge's own length — which used to fling the collapsed point
    // outside the glyph's own bounding box entirely (caught live: "(" rendering with a spike sticking
    // out past its own selection frame; verified this exact data reproduces (26.75, -20.74))
    const prevEdge = {
      start: { x: 6.6992, y: 13.5059 },
      end: { x: 9.2969, y: 7.8711 },
      tangentStart: null,
      tangentEnd: { x: -0.9766, y: 1.6016 },
    };
    const nextEdge = {
      start: { x: 12.7148, y: 7.8711 },
      end: { x: 10.1074, y: 14.2578 },
      tangentStart: { x: -1.0026, y: 2.0443 },
      tangentEnd: null,
    };

    expect(getMiterPoint(prevEdge, nextEdge)).toBeNull();
  });
});
