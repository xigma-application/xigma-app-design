// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getTextPathBoundVectorIds } from '../getTextPathBoundVectorIds';

const VECTOR: TSceneNode = {
  fillColor: '#000',
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '#000',
  strokeWidth: 4,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
};

const buildText = (pathId: string | null): TSceneNode => ({
  content: 'Hi',
  fill: '#fff',
  flipX: false,
  flipY: false,
  fontFamily: 'Inter',
  fontSize: 14,
  height: 100,
  id: 'text-1',
  name: 'Text',
  parentId: null,
  pathId,
  rotation: 0,
  type: NodeType.text,
  width: 100,
  x: 0,
  y: 0,
});

describe('getTextPathBoundVectorIds', () => {
  it('should collect the pathId of every text node that has one', () => {
    // result
    expect(getTextPathBoundVectorIds([VECTOR, buildText('vector-1')])).toEqual(new Set(['vector-1']));
  });

  it('should ignore a text node with no pathId', () => {
    // result
    expect(getTextPathBoundVectorIds([VECTOR, buildText(null)])).toEqual(new Set());
  });

  it('should ignore non-text nodes entirely', () => {
    // result
    expect(getTextPathBoundVectorIds([VECTOR])).toEqual(new Set());
  });

  it('should return an empty set for an empty node list', () => {
    // result
    expect(getTextPathBoundVectorIds([])).toEqual(new Set());
  });

  it('should collect ids from multiple bound text nodes, deduplicated', () => {
    // mock — two text nodes both bound to the same vector
    const first = { ...buildText('vector-1'), id: 'text-1' };
    const second = { ...buildText('vector-1'), id: 'text-2' };

    // result
    expect(getTextPathBoundVectorIds([first, second])).toEqual(new Set(['vector-1']));
  });
});
