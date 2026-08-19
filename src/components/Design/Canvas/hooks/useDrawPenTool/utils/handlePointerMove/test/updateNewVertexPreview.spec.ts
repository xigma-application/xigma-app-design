// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TVectorNode } from 'types/design/types';

// utils
import { updateNewVertexPreview } from '../updateNewVertexPreview';

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

const createPenNewVertexPreviewRef = (): TCanvasRefs['penNewVertexPreviewRef'] => ({ current: null });

describe('updateNewVertexPreview', () => {
  it('should preview the raw pointer position when there is no node to snap against', () => {
    // mock
    const penNewVertexPreviewRef = createPenNewVertexPreviewRef();

    // before
    const isSnapped = updateNewVertexPreview({ x: 900, y: 900 }, null, IDENTITY_VIEWPORT, penNewVertexPreviewRef);

    // result
    expect(penNewVertexPreviewRef.current).toEqual({ x: 900, y: 900 });
    expect(isSnapped).toBe(false);
  });

  it('should preview the raw pointer position when the node has no vertex nearby', () => {
    // mock
    const penNewVertexPreviewRef = createPenNewVertexPreviewRef();

    // before
    const isSnapped = updateNewVertexPreview({ x: 900, y: 900 }, node, IDENTITY_VIEWPORT, penNewVertexPreviewRef);

    // result
    expect(penNewVertexPreviewRef.current).toEqual({ x: 900, y: 900 });
    expect(isSnapped).toBe(false);
  });

  it('should snap the preview onto an existing vertex instead of the raw pointer position — the hover attraction that was missing after Escape stopped extending a connected point', () => {
    // mock
    const penNewVertexPreviewRef = createPenNewVertexPreviewRef();

    // before — pointer hovers a couple of px away from v1, well within the snap radius
    const isSnapped = updateNewVertexPreview({ x: 2, y: 1 }, node, IDENTITY_VIEWPORT, penNewVertexPreviewRef);

    // result
    expect(penNewVertexPreviewRef.current).toEqual({ id: 'v1', x: 0, y: 0 });
    expect(isSnapped).toBe(true);
  });
});
