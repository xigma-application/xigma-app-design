// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { mergeVectorNodeGeometries } from '../mergeVectorNodeGeometries';

const BASE = { id: 'merged-1', name: 'Text outline', parentId: 'page-1', rotation: 5 };

const buildGlyphVector = (id: string): TVectorNode => ({
  fillColor: '#ff0000',
  fillColorOverrideByKey: { [`face-${id}`]: '#ff0000' },
  filledFaceKeys: [`face-${id}`],
  id,
  name: id,
  parentId: null,
  rotation: 0,
  segments: { [`${id}-s1`]: { endId: `${id}-v2`, id: `${id}-s1`, startId: `${id}-v1`, tangentEnd: null, tangentStart: null } },
  strokeColor: '#ff0000',
  strokeWidth: 0,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { [`${id}-v1`]: { id: `${id}-v1`, x: 0, y: 0 }, [`${id}-v2`]: { id: `${id}-v2`, x: 10, y: 0 } },
});

describe('mergeVectorNodeGeometries', () => {
  it('should return null when given no nodes', () => {
    // result
    expect(mergeVectorNodeGeometries([], BASE, '#ff0000')).toBeNull();
  });

  it('should combine every node’s vertices, segments, faces and color overrides without bridging them', () => {
    // mock
    const glyphA = buildGlyphVector('a');
    const glyphB = buildGlyphVector('b');

    // action
    const result = mergeVectorNodeGeometries([glyphA, glyphB], BASE, '#ff0000');

    // result — uses the supplied base metadata, and keeps each glyph's own face as independent
    expect(result?.id).toBe('merged-1');
    expect(result?.name).toBe('Text outline');
    expect(result?.parentId).toBe('page-1');
    expect(result?.rotation).toBe(5);
    expect(Object.keys(result?.vertices ?? {})).toHaveLength(4);
    expect(Object.keys(result?.segments ?? {})).toHaveLength(2);
    expect(result?.filledFaceKeys).toEqual(['face-a', 'face-b']);
    expect(result?.fillColorOverrideByKey).toEqual({ 'face-a': '#ff0000', 'face-b': '#ff0000' });
  });
});
