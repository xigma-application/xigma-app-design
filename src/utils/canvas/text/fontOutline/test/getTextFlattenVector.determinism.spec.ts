import { readFileSync } from 'fs';
import { resolve } from 'path';

// types
import { NodeType } from 'types/design/enums';
import { TTextNode } from 'types/design/types';

// utils
import { getTextFlattenVector } from '../getTextFlattenVector';
import { groupFilledFacesForRendering } from 'utils/canvas/drawVectorNode/groupFilledFacesForRendering';
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';

const buildNode = (): TTextNode => ({
  content: 'abcdefghijklmnopqrstuvwxyz',
  fill: '#123456',
  flipX: false,
  flipY: false,
  fontFamily: 'Inter',
  fontSize: 20,
  height: 40,
  id: 'text-1',
  name: 'Text',
  parentId: null,
  pathId: null,
  rotation: 0,
  type: NodeType.text,
  width: 600,
  x: 0,
  y: 0,
});

describe('getTextFlattenVector — determinism across repeated calls with the real Inter font', () => {
  beforeAll(() => {
    const buffer = readFileSync(resolve(__dirname, '../../../../../assets/fonts/inter/source/Inter-Regular.ttf'));
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

    vi.stubGlobal(
      'fetch',
      vi.fn(async (): Promise<{ arrayBuffer: () => Promise<ArrayBuffer> }> => ({ arrayBuffer: async (): Promise<ArrayBuffer> => arrayBuffer })),
    );
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  // Formerly a KNOWN BUG (kept as `it.fails` while unresolved): getVectorFillLoopPoints's
  // chainIntoSteps resolves a stored loop key's unordered, alphabetically-sorted piece set back into
  // an ordered walk. A self-touching glyph contour (e.g. Inter's "e") legitimately visits one
  // crossing vertex TWICE in its face boundary — that vertex has degree 4 within the loop's own
  // piece set (2 edges in, 2 out), not the usual degree 2 — so there are two candidate
  // continuations at that point, and a plain greedy walk (take the first twin-1 neighbour
  // recognized as one of this loop's own units) had no way to know which one was right. The wrong
  // guess silently closed early on a shorter, internally self-consistent loop missing the units it
  // skipped past — and *which* guess got tried first was itself random, since it depended on which
  // piece key's own (randomly nanoid-generated) id happened to sort first in the stored key.
  //
  // Fixed: chainIntoSteps now backtracks — try a branch, and if it can't be extended into a closed
  // loop using every one of the loop's units exactly once, undo it and try the branch's next
  // candidate (see getNextUnitHalfEdgeCandidates). This is correct by construction rather than by
  // luck of the id draw: verified via a 500x stress run on "men" (0/500 failures, was 155/500) and
  // a 300x run on "e" alone (0/300, was 43/300 — isolated single letters were never actually 100%
  // stable, just far less likely to hit the ambiguous branch than a longer multi-glyph string).
  it('should resolve the exact same set of visible faces every time for the same full-alphabet input', async () => {
    const node = buildNode();
    const summaries = [];

    for (let run = 0; run < 5; run += 1) {
      // sequential, not parallel — mirrors how the real "flatten selection" action calls this once per click
      // eslint-disable-next-line no-await-in-loop
      const result = await getTextFlattenVector(MSDF_ATLAS_JSON, node);

      if (!result) {
        summaries.push(null);
        continue;
      }

      const resolvedFaces = groupFilledFacesForRendering(result).find((group) => group.color === '#123456')?.polygons ?? [];

      summaries.push({
        filledFaceKeyCount: result.filledFaceKeys.length,
        resolvedFaceCount: resolvedFaces.length,
        totalPoints: resolvedFaces.reduce((sum, face) => sum + face.length, 0),
      });
    }

    expect(summaries[0]).not.toBeNull();
    summaries.forEach((summary) => expect(summary).toEqual(summaries[0]));
  });
});

describe('getTextFlattenVector — glyph outline integrity with the real Inter font', () => {
  beforeAll(() => {
    const buffer = readFileSync(resolve(__dirname, '../../../../../assets/fonts/inter/source/Inter-Regular.ttf'));
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

    vi.stubGlobal(
      'fetch',
      vi.fn(async (): Promise<{ arrayBuffer: () => Promise<ArrayBuffer> }> => ({ arrayBuffer: async (): Promise<ArrayBuffer> => arrayBuffer })),
    );
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  const buildSingleCharNode = (content: string): TTextNode => ({
    content,
    fill: '#123456',
    flipX: false,
    flipY: false,
    fontFamily: 'Inter',
    fontSize: 40,
    height: 40,
    id: 'text-1',
    name: 'Text',
    parentId: null,
    pathId: null,
    rotation: 0,
    type: NodeType.text,
    width: 600,
    x: 0,
    y: 0,
  });

  // Regression for a real bug: collapseCuspEdges' miter-point collapse (see getMiterPoint.ts) had no
  // limit on how far a computed miter point could land — a short, near-flat straight bridge flanked
  // by two long, shallow-angle curves (exactly the shape of "("'s and ")"'s own blunted tips) makes
  // the flanking tangent lines cross tens of units away, well outside the glyph's own bounding box.
  // Caught live: "(" and ")" rendered as a twisted, spiked shape instead of a smooth bracket curve.
  it('should render "(" and ")" as smooth, mirror-matching brackets instead of a spiked cusp collapse', async () => {
    const openResult = await getTextFlattenVector(MSDF_ATLAS_JSON, buildSingleCharNode('('));
    const closeResult = await getTextFlattenVector(MSDF_ATLAS_JSON, buildSingleCharNode(')'));

    const openPolygon = openResult && groupFilledFacesForRendering(openResult)[0]?.polygons[0];
    const closePolygon = closeResult && groupFilledFacesForRendering(closeResult)[0]?.polygons[0];

    expect(openPolygon).toBeTruthy();
    expect(closePolygon).toBeTruthy();

    const bboxOf = (points: { x: number; y: number }[]): { h: number; w: number } => {
      const xs = points.map((p) => p.x);
      const ys = points.map((p) => p.y);

      return { h: Math.max(...ys) - Math.min(...ys), w: Math.max(...xs) - Math.min(...xs) };
    };

    const openBox = bboxOf(openPolygon!);
    const closeBox = bboxOf(closePolygon!);

    // "(" and ")" are horizontal mirror images in Inter — their outlines must match almost exactly,
    // not differ by the 30-60% a spurious spike would introduce
    expect(openBox.w).toBeCloseTo(closeBox.w, 1);
    expect(openBox.h).toBeCloseTo(closeBox.h, 1);
    // sanity floor: a collapsed spike pushed the bbox to 3-4x the glyph's real ~8.5 x 36 size at this
    // fontSize — assert against real ground truth (opentype.js's own bounding box) instead of just
    // each other, so a bug that shifts both equally wouldn't slip through
    expect(openBox.w).toBeLessThan(15);
    expect(openBox.h).toBeLessThan(45);
  });
});
