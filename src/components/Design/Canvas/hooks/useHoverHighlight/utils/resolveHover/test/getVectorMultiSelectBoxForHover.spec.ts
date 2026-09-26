// store
import { RootState } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs, TVectorHandleHover } from 'types/design/canvas/types';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { getVectorMultiSelectBoxForHover } from '../getVectorMultiSelectBoxForHover';

const node: TVectorNode = {
  defaultFill: null,
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeWidth: 1,
  strokes: [{ color: '#000000', opacity: 100, type: 'solid' }],
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 40 } },
};

const nodes: Record<string, TSceneNode> = { 'vector-1': node };

const createState = (vectorEditingNodeIds: string[]): RootState =>
  ({ design: { activePageId: 'page-1', pages: { 'page-1': { nodes } }, vectorEditingNodeIds } }) as unknown as RootState;

const createRefs = (selectedVertexIds: string[], selectedHandles: TVectorHandleHover[] = []): TCanvasRefs => {
  const refs = createCanvasRefs();

  refs.vectorEdit.selectedVectorVertexIdsRef.current = selectedVertexIds;
  refs.vectorEdit.selectedVectorHandlesRef.current = selectedHandles;

  return refs;
};

describe('getVectorMultiSelectBoxForHover', () => {
  it('should return null when there is no vector-editing node, regardless of selection', () => {
    // result
    expect(getVectorMultiSelectBoxForHover(createState([]), createRefs(['v1', 'v2']))).toBeNull();
  });

  it('should return null when the selection is not eligible for a multi-select box (e.g. a tangent handle is selected)', () => {
    // result
    expect(
      getVectorMultiSelectBoxForHover(createState(['vector-1']), createRefs(['v1', 'v2'], [{ end: 'start', segmentId: 's1' }])),
    ).toBeNull();
  });

  it('should compute and return the box when a node is being edited and the selection is eligible', () => {
    // result
    expect(getVectorMultiSelectBoxForHover(createState(['vector-1']), createRefs(['v1', 'v2']))).toEqual({
      bounds: { height: 40, width: 100, x: 0, y: 0 },
      rotation: 0,
      selectionKey: 'v1,v2',
    });
  });
});
