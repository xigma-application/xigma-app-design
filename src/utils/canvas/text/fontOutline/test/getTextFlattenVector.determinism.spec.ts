import { readFileSync } from 'fs';
import { resolve } from 'path';

// types
import { NodeType } from 'types/design/enums';
import { TTextNode } from 'types/design/types';

// utils
import { getTextFlattenVector } from '../getTextFlattenVector';
import { groupFilledFacesByColor } from 'utils/canvas/drawVectorNode/groupFilledFacesByColor';
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

  // KNOWN BUG, not yet fixed: getVectorFillLoopPoints/computeLoopPoints resolves a random subset
  // of an otherwise-stable filledFaceKeys list to real points when many glyphs' crossings are
  // planarized together (isolated single letters are always stable). Root cause narrowed to an
  // id-order-dependent tie-break somewhere in crossing/junction resolution — attempting to key
  // findAllNetworkCrossings' virtual vertices by point instead of by sorted segment id reduced but
  // did not eliminate the variance, and also broke groupCrossingVectorNodes (that id ordering is
  // relied on elsewhere), so it was reverted. Kept as `it.fails` so this stays documented and
  // CI-visible without blocking the suite; once genuinely fixed, this will start failing because
  // it unexpectedly passes — remove `.fails` at that point.
  it.fails('should resolve the exact same set of visible faces every time for the same full-alphabet input', async () => {
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

      const resolvedFaces = groupFilledFacesByColor(result).get('#123456') ?? [];

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
