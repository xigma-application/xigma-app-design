// types
import { NodeType } from 'types/design/enums';
import { PathCommand } from 'opentype.js';
import { TGlyphAtlasJson } from 'types/msdf';
import { TTextNode } from 'types/design/types';

const charPaths: Record<string, PathCommand[]> = {
  A: [{ type: 'M', x: 0, y: 0 }, { type: 'L', x: 10, y: 0 }, { type: 'L', x: 0, y: 10 }, { type: 'Z' }],
};

const getPath = vi.fn((x: number, y: number) => ({
  commands: charPaths.A.map((command) => ('x' in command ? { ...command, x: command.x + x, y: command.y + y } : command)),
}));

vi.mock('../loadInterFont', () => ({ loadInterFont: vi.fn(async () => ({ charToGlyph: vi.fn(() => ({ getPath })) })) }));

// utils
import { getTextGlyphContours } from '../getTextGlyphContours';

const ATLAS: TGlyphAtlasJson = {
  chars: [{ height: 10, id: 65, width: 8, x: 0, xadvance: 12, xoffset: 1, y: 0, yoffset: 2 }],
  common: { base: 30, lineHeight: 40, scaleH: 100, scaleW: 100 },
  distanceField: { distanceRange: 4, fieldType: 'msdf' },
  info: { size: 20 },
  kernings: [],
  pages: ['atlas.png'],
};

const buildNode = (overrides: Partial<TTextNode> = {}): TTextNode => ({
  content: 'A',
  fill: '#ffffff',
  flipX: false,
  flipY: false,
  fontFamily: 'Inter',
  fontSize: 20,
  height: 40,
  id: 'text-1',
  name: 'Text',
  parentId: null,
  rotation: 0,
  type: NodeType.text,
  width: 200,
  x: 0,
  y: 0,
  ...overrides,
});

describe('getTextGlyphContours', () => {
  afterEach(() => {
    getPath.mockClear();
  });

  it('should fetch each visible glyph’s path positioned at its own pen/baseline', async () => {
    // action
    const contours = await getTextGlyphContours(ATLAS, buildNode());

    // result — one glyph, one triangular contour with 3 edges, positioned at (penX=0, baselineY=30)
    expect(getPath).toHaveBeenCalledWith(0, 30, 20);
    expect(contours).toHaveLength(1);
    expect(contours[0]).toHaveLength(1);
    expect(contours[0][0]).toHaveLength(3);
  });

  it('should leave contours untouched when the node has no flip set', async () => {
    // action
    const [[edges]] = await getTextGlyphContours(ATLAS, buildNode());

    // result — the mock path is translated by (penX=0, baselineY=30)
    expect(edges[0].start).toEqual({ x: 0, y: 30 });
  });

  it('should mirror every point and negate the matching tangent axis when flipX is set', async () => {
    // mock — width/height define the mirror line; flip a curved contour to check tangent negation too
    getPath.mockReturnValueOnce({
      commands: [{ type: 'M', x: 0, y: 0 }, { type: 'C', x: 10, x1: 2, x2: 8, y: 0, y1: -4, y2: 4 }, { type: 'Z' }],
    });
    const node = buildNode({ flipX: true, width: 20 });

    // action
    const [[edges]] = await getTextGlyphContours(ATLAS, node);

    // result — flipTextPoint mirrors x around (2*node.x + node.width); tangent's x axis negates
    expect(edges[0].start).toEqual({ x: 20, y: 0 });
    expect(edges[0].end).toEqual({ x: 10, y: 0 });
    expect(edges[0].tangentStart).toEqual({ x: -2, y: -4 });
  });
});
