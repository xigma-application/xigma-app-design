import { RefObject } from 'react';

// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPendingOutgoingTangent } from '../../../types';
import { TVectorNode } from 'types/design/types';

// utils
import { updateVectorPenPreview } from '../updateVectorPenPreview';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const node: TVectorNode = {
  fillColor: null,
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { v1: { id: 'v1', x: 0, y: 0 } },
};

const createPenPreviewRef = (): TCanvasRefs['penPreviewRef'] => ({ current: null });
const createPendingOutgoingTangentRef = (value: TPendingOutgoingTangent | null = null): RefObject<TPendingOutgoingTangent | null> => ({
  current: value,
});

describe('updateVectorPenPreview', () => {
  it('should clear the rubber-band preview when there is no active vertex', () => {
    // mock
    const penPreviewRef = createPenPreviewRef();

    // before
    const isSnapped = updateVectorPenPreview(
      { x: 900, y: 900 },
      node,
      null,
      IDENTITY_VIEWPORT,
      penPreviewRef,
      createPendingOutgoingTangentRef(),
    );

    // result
    expect(penPreviewRef.current).toBeNull();
    expect(isSnapped).toBe(false);
  });

  it('should draw the rubber-band preview from the active vertex to the pointer when no vertex is hovered', () => {
    // mock
    const penPreviewRef = createPenPreviewRef();

    // before
    const isSnapped = updateVectorPenPreview(
      { x: 500, y: 500 },
      node,
      'v1',
      IDENTITY_VIEWPORT,
      penPreviewRef,
      createPendingOutgoingTangentRef(),
    );

    // result
    expect(penPreviewRef.current).toEqual({ from: { id: 'v1', x: 0, y: 0 }, tangentFromOffset: null, to: { x: 500, y: 500 } });
    expect(isSnapped).toBe(false);
  });

  it('should snap the rubber-band preview endpoint to the hovered vertex instead of the raw pointer position', () => {
    // mock
    const nodeWithTwoVertices: TVectorNode = { ...node, vertices: { ...node.vertices, v2: { id: 'v2', x: 100, y: 0 } } };
    const penPreviewRef = createPenPreviewRef();

    // before — active vertex is v1, pointer hovers right on v2
    const isSnapped = updateVectorPenPreview(
      { x: 100, y: 0 },
      nodeWithTwoVertices,
      'v1',
      IDENTITY_VIEWPORT,
      penPreviewRef,
      createPendingOutgoingTangentRef(),
    );

    // result
    expect(penPreviewRef.current).toMatchObject({ to: { id: 'v2', x: 100, y: 0 } });
    expect(isSnapped).toBe(true);
  });

  it('should carry the pending outgoing tangent into the preview when it matches the active vertex', () => {
    // mock
    const penPreviewRef = createPenPreviewRef();
    const pendingOutgoingTangentRef = createPendingOutgoingTangentRef({ tangent: { x: 5, y: 5 }, vertexId: 'v1' });

    // before
    updateVectorPenPreview({ x: 500, y: 500 }, node, 'v1', IDENTITY_VIEWPORT, penPreviewRef, pendingOutgoingTangentRef);

    // result
    expect(penPreviewRef.current).toMatchObject({ tangentFromOffset: { x: 5, y: 5 } });
  });
});
