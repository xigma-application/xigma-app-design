// constant
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';

// types
import { NodeType } from 'types/design/enums';
import { TGlyphAtlasJson } from 'types/msdf';
import { TVectorNode } from 'types/design/types';

// utils
import { createEllipseTextPathSampler } from '../../pathSampler/createEllipseTextPathSampler';
import { createVectorTextPathSampler } from '../../pathSampler/createVectorTextPathSampler/createVectorTextPathSampler';
import { getCurvedTunnelPath } from '../getCurvedTunnelPath';

const ATLAS: TGlyphAtlasJson = {
  chars: [{ height: 10, id: 65, width: 8, x: 0, xadvance: 12, xoffset: 1, y: 0, yoffset: 2 }],
  common: { base: 30, lineHeight: 40, scaleH: 100, scaleW: 100 },
  distanceField: { distanceRange: 4, fieldType: 'msdf' },
  info: { size: 20 },
  kernings: [],
  pages: ['atlas.png'],
};

describe('getCurvedTunnelPath', () => {
  it('should return empty top/bottom for a collapsed (start === end) range', () => {
    // mock
    const sampler = createEllipseTextPathSampler({ height: 200, rotation: 0, width: 200, x: 0, y: 0 });

    // result
    expect(getCurvedTunnelPath(ATLAS, 'AAA', 20, { x: 100, y: 100 }, 0, false, sampler, 40, 1, 1)).toEqual({ bottom: [], top: [] });
  });

  it('should return an index-aligned top/bottom pair along a smooth (cornerless) path', () => {
    // mock
    const sampler = createEllipseTextPathSampler({ height: 200, rotation: 0, width: 200, x: 0, y: 0 });

    // result
    const { bottom, top } = getCurvedTunnelPath(ATLAS, 'AAA', 20, { x: 100, y: 100 }, 0, false, sampler, 40, 0, 3);

    expect(top.length).toBeGreaterThan(0);
    expect(top).toHaveLength(bottom.length);
  });

  it('should build a sharp mitered corner around a 90° vector guide, matching the hand-derived miter point', () => {
    // mock — an "L"-shaped chain a(1225.5,770)->b(1287.5,770)->c(1287.5,701), the exact real-world
    // 90° corner this behavior was built and hand-verified against
    const node: TVectorNode = {
      fillColor: null,
      filledFaceKeys: [],
      id: 'v',
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {
        s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
        s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
      },
      strokeColor: '#000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: {
        a: { id: 'a', x: 1225.5, y: 770 },
        b: { id: 'b', x: 1287.5, y: 770 },
        c: { id: 'c', x: 1287.5, y: 701 },
      },
    };
    const box = { flipX: false, flipY: false, height: 69, pathFlip: false, width: 62, x: 1225.5, y: 701 };
    const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    const sampler = createVectorTextPathSampler(box, node);
    const content = 'dsadsaasdaddsdddddd';

    // before — the real MSDF atlas metrics this corner was hand-verified against, not the mock ATLAS
    const { bottom, top } = getCurvedTunnelPath(MSDF_ATLAS_JSON, content, 14, center, 0, false, sampler, 16.44, 0, content.length);

    // result — top (the concave/inner side of this turn) folds back to a single sharp miter point,
    // hand-derived from the two offset lines' true intersection
    expect(top).toHaveLength(bottom.length);
    expect(top.some((point) => Math.abs(point.x - 1274.263) < 0.01 && Math.abs(point.y - 756.763) < 0.01)).toBe(true);
  });

  it('should walk backwards along the path when flipped', () => {
    // mock
    const sampler = createEllipseTextPathSampler({ height: 200, rotation: 0, width: 200, x: 0, y: 0 });

    // before
    const normal = getCurvedTunnelPath(ATLAS, 'AAA', 20, { x: 100, y: 100 }, 0, false, sampler, 40, 0, 2);
    const flipped = getCurvedTunnelPath(ATLAS, 'AAA', 20, { x: 100, y: 100 }, 0, true, sampler, 40, 0, 2);

    // result
    expect(flipped.top).not.toEqual(normal.top);
  });

  it('should return empty top/bottom when the resolved centerline collapses to a single point', () => {
    // mock — a degenerate sampler that maps every arc-length to the exact same world point, so a
    // non-collapsed [start,end) selection still resolves to a one-point (unusable) centerline
    const sampler = createEllipseTextPathSampler({ height: 0, rotation: 0, width: 0, x: 0, y: 0 });

    // result
    expect(getCurvedTunnelPath(ATLAS, 'AA', 20, { x: 0, y: 0 }, 0, false, sampler, 40, 0, 2)).toEqual({ bottom: [], top: [] });
  });

  it('should clamp start/end to the content length', () => {
    // mock
    const sampler = createEllipseTextPathSampler({ height: 200, rotation: 0, width: 200, x: 0, y: 0 });

    // before
    const clamped = getCurvedTunnelPath(ATLAS, 'AAA', 20, { x: 100, y: 100 }, 0, false, sampler, 40, -5, 99);
    const full = getCurvedTunnelPath(ATLAS, 'AAA', 20, { x: 100, y: 100 }, 0, false, sampler, 40, 0, 3);

    // result
    expect(clamped).toEqual(full);
  });
});
