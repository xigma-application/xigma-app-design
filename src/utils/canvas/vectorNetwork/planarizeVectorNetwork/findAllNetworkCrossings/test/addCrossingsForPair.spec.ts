// types
import { TSegmentCrossing } from '../../types';
import { TVectorVertex } from 'types/design/types';

// utils
import { addCrossingsForPair } from '../addCrossingsForPair';
import { cacheSegments, crossSegments, crossVertices } from './crossingFixtures';

describe('addCrossingsForPair', () => {
  it('should record a virtual vertex at the crossing on both segments, keeping earlier crossings', () => {
    // mock
    const [h, v] = crossSegments;
    const cached = cacheSegments([h, v], crossVertices);
    const crossings = new Map<string, TSegmentCrossing[]>([
      ['h', [{ t: 0.1, vertexId: 'earlier' }]],
      ['v', [{ t: 0.2, vertexId: 'before' }]],
    ]);
    const virtualVertices: Record<string, TVectorVertex> = {};
    const segmentIdsByVertexId = new Map<string, [string, string]>();

    // before
    addCrossingsForPair(
      v,
      h,
      cached.get('v')!.points,
      cached.get('h')!.points,
      crossVertices,
      crossings,
      virtualVertices,
      segmentIdsByVertexId,
    );

    // find
    const [vertexId] = Object.keys(virtualVertices);

    // result
    expect(vertexId).toBe('x:h:v:0.500000');
    expect(virtualVertices[vertexId]).toMatchObject({ x: 5, y: 5 });
    expect(crossings.get('h')).toEqual([
      { t: 0.1, vertexId: 'earlier' },
      { t: 0.5, vertexId },
    ]);
    expect(crossings.get('v')).toEqual([
      { t: 0.2, vertexId: 'before' },
      { t: 0.5, vertexId },
    ]);
    expect(segmentIdsByVertexId.get(vertexId)).toEqual(['v', 'h']);
  });

  it('should record nothing for segments that do not cross', () => {
    // mock
    const [h, , far] = crossSegments;
    const cached = cacheSegments([h, far], crossVertices);
    const crossings = new Map<string, TSegmentCrossing[]>();

    // before
    addCrossingsForPair(h, far, cached.get('h')!.points, cached.get('far')!.points, crossVertices, crossings, {}, new Map());

    // result
    expect(crossings.size).toBe(0);
  });

  it('should start new crossing lists for segments without earlier crossings', () => {
    // mock
    const [h, v] = crossSegments;
    const cached = cacheSegments([h, v], crossVertices);
    const crossings = new Map<string, TSegmentCrossing[]>();

    // before
    addCrossingsForPair(h, v, cached.get('h')!.points, cached.get('v')!.points, crossVertices, crossings, {}, new Map());

    // result
    expect(crossings.get('h')).toHaveLength(1);
    expect(crossings.get('v')).toHaveLength(1);
  });
});
