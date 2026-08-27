// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { buildClosedVectorLoop } from '../buildClosedVectorLoop';
import { getFillDataForClosedLoop } from '../getFillDataForClosedLoop';

const buildVectorNode = (segments: TVectorNode['segments'], vertices: TVectorNode['vertices']): TVectorNode => ({
  fillColor: '#ff0000',
  filledFaceKeys: [],
  id: 'node-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments,
  strokeColor: '#000000',
  strokeWidth: 0,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices,
});

describe('getFillDataForClosedLoop', () => {
  it('should return exactly one face key for a simple closed square loop', () => {
    // mock
    const square = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
    ];
    const { segments, vertices } = buildClosedVectorLoop(square, 0);
    const node = buildVectorNode(segments, vertices);

    // action
    const { filledFaceKeys } = getFillDataForClosedLoop(node, '#00ff00');

    // result
    expect(filledFaceKeys).toHaveLength(1);
    expect(typeof filledFaceKeys[0]).toBe('string');
  });

  it('should override the face color with the requested fill, since fillColor alone is not rendered', () => {
    // mock
    const square = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
    ];
    const { segments, vertices } = buildClosedVectorLoop(square, 0);
    const node = buildVectorNode(segments, vertices);

    // action
    const { fillColorOverrideByKey, filledFaceKeys } = getFillDataForClosedLoop(node, '#00ff00');

    // result
    expect(fillColorOverrideByKey[filledFaceKeys[0]]).toBe('#00ff00');
  });

  it('should return no face keys or overrides for an open, unclosed path', () => {
    // mock
    const node = buildVectorNode(
      { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 10 } },
    );

    // action
    const { fillColorOverrideByKey, filledFaceKeys } = getFillDataForClosedLoop(node, '#00ff00');

    // result
    expect(filledFaceKeys).toHaveLength(0);
    expect(fillColorOverrideByKey).toEqual({});
  });
});
