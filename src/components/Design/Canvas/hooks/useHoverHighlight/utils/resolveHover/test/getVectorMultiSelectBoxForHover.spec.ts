import { RefObject } from 'react';

// types
import { NodeType } from 'types/design/enums';
import { TVectorMultiSelectBox } from 'types/design/canvas/types';
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorMultiSelectBoxForHover } from '../getVectorMultiSelectBoxForHover';

const node: TVectorNode = {
  fillColor: null,
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 40 } },
};

const createVectorMultiSelectBoxRef = (box: TVectorMultiSelectBox | null = null): RefObject<TVectorMultiSelectBox | null> => ({
  current: box,
});

describe('getVectorMultiSelectBoxForHover', () => {
  it('should return null when there is no vector-editing node, regardless of selection', () => {
    // result
    expect(getVectorMultiSelectBoxForHover(null, ['v1', 'v2'], [], createVectorMultiSelectBoxRef())).toBeNull();
  });

  it('should return null when the selection is not eligible for a multi-select box (e.g. a tangent handle is selected)', () => {
    // result
    expect(
      getVectorMultiSelectBoxForHover(node, ['v1', 'v2'], [{ end: 'start', segmentId: 's1' }], createVectorMultiSelectBoxRef()),
    ).toBeNull();
  });

  it('should compute and return the box when a node is being edited and the selection is eligible', () => {
    // result
    expect(getVectorMultiSelectBoxForHover(node, ['v1', 'v2'], [], createVectorMultiSelectBoxRef())).toEqual({
      bounds: { height: 40, width: 100, x: 0, y: 0 },
      rotation: 0,
      selectionKey: 'v1,v2',
    });
  });
});
