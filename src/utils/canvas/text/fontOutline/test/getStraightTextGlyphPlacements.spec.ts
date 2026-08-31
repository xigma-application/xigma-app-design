// types
import { NodeType } from 'types/design/enums';
import { TGlyphAtlasJson } from 'types/msdf';
import { TTextNode } from 'types/design/types';

// utils
import { getStraightTextGlyphPlacements } from '../getStraightTextGlyphPlacements';
import { getWrappedTextLines } from '../../getWrappedTextLines';

const ATLAS: TGlyphAtlasJson = {
  chars: [
    { height: 10, id: 65, width: 8, x: 0, xadvance: 12, xoffset: 1, y: 0, yoffset: 2 },
    { height: 10, id: 66, width: 8, x: 8, xadvance: 12, xoffset: 1, y: 0, yoffset: 2 },
  ],
  common: { base: 30, lineHeight: 40, scaleH: 100, scaleW: 100 },
  distanceField: { distanceRange: 4, fieldType: 'msdf' },
  info: { size: 20 },
  kernings: [],
  pages: ['atlas.png'],
};

const buildNode = (overrides: Partial<TTextNode> = {}): TTextNode => ({
  content: 'AB',
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

describe('getStraightTextGlyphPlacements', () => {
  it('should place each glyph at its pen position and the line baseline (top + atlas base, at scale 1)', () => {
    // action
    const placements = getStraightTextGlyphPlacements(ATLAS, buildNode());

    // result
    expect(placements).toEqual([
      { baselineY: 30, char: 'A', penX: 0 },
      { baselineY: 30, char: 'B', penX: 12 },
    ]);
  });

  it('should skip a character missing from the atlas, while still advancing the pen past it', () => {
    // mock — "A?B": '?' (63) has no atlas entry
    const node = buildNode({ content: 'A?B' });

    // action
    const placements = getStraightTextGlyphPlacements(ATLAS, node);

    // result — '?' contributes no placement, but 'B' still lands past its fallback advance
    expect(placements.map((placement) => placement.char)).toEqual(['A', 'B']);
    expect(placements[1].penX).toBeGreaterThan(12);
  });

  it('should offset each glyph’s baseline by a full line height per the line it wraps onto', () => {
    // mock — width forces "A" and "B" apart; wrapping itself is getWrappedTextLines' own concern,
    // so derive the expected line index for "B" from its actual output rather than assuming one
    const node = buildNode({ content: 'A B', width: 13 });
    const lines = getWrappedTextLines(ATLAS, node.content, node.width, node.fontSize);
    const bLineIndex = lines.findIndex((line) => line.includes('B'));

    // action
    const placements = getStraightTextGlyphPlacements(ATLAS, node);

    // result
    expect(bLineIndex).toBeGreaterThan(0);
    expect(placements).toEqual([
      { baselineY: 30, char: 'A', penX: 0 },
      { baselineY: 30 + bLineIndex * 40, char: 'B', penX: 0 },
    ]);
  });

  it('should offset the origin by the node position', () => {
    // mock
    const node = buildNode({ x: 5, y: 100 });

    // action
    const [placement] = getStraightTextGlyphPlacements(ATLAS, node);

    // result
    expect(placement).toEqual({ baselineY: 130, char: 'A', penX: 5 });
  });
});
