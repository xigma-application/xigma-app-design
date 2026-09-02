// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { isVectorBoundAsTextPath } from '../isVectorBoundAsTextPath';

const VECTOR: TSceneNode = {
  defaultFill: [{ color: '#000', opacity: 100, type: 'solid' }],
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

describe('isVectorBoundAsTextPath', () => {
  it('should return true when a text node references the vector as its pathId, given a record', () => {
    // result
    expect(isVectorBoundAsTextPath({ [VECTOR.id]: VECTOR, 'text-1': buildText('vector-1') }, 'vector-1')).toBe(true);
  });

  it('should return true when a text node references the vector as its pathId, given an array', () => {
    // result
    expect(isVectorBoundAsTextPath([VECTOR, buildText('vector-1')], 'vector-1')).toBe(true);
  });

  it('should return false when no text node references the vector', () => {
    // result
    expect(isVectorBoundAsTextPath([VECTOR, buildText(null)], 'vector-1')).toBe(false);
  });

  it('should return false when a text node references a different path id', () => {
    // result
    expect(isVectorBoundAsTextPath([VECTOR, buildText('some-other-id')], 'vector-1')).toBe(false);
  });

  it('should return false for an empty node set', () => {
    // result
    expect(isVectorBoundAsTextPath({}, 'vector-1')).toBe(false);
  });
});
