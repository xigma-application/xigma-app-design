// types
import { NodeType } from 'types/design/enums';
import { TLineNode, TRectangleNode } from 'types/design/types';

// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { getGridDragRenderNode } from '../getGridDragRenderNode';

describe('getGridDragRenderNode', () => {
  it('should return the node unchanged when no grid drag ghost is active for it', () => {
    // mock
    const rect: TRectangleNode = { fill: '#fff', height: 20, id: 'r', name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width: 20, x: 5, y: 15 }; // prettier-ignore
    const refs = createCanvasRefs();

    // result
    expect(getGridDragRenderNode(refs, rect, { r: rect })).toBe(rect);
  });

  it('should shift a box node’s x/y by the ghost’s offset', () => {
    // mock
    const rect: TRectangleNode = { fill: '#fff', height: 20, id: 'r', name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width: 20, x: 5, y: 15 }; // prettier-ignore
    const refs = createCanvasRefs({ transform: { gridDragGhostRef: { current: { nodeIds: ['r'], offset: { x: 10, y: -5 } } } } });

    // result
    expect(getGridDragRenderNode(refs, rect, { r: rect })).toMatchObject({ x: 15, y: 10 });
  });

  it('should translate a line node’s endpoints by the ghost’s offset', () => {
    // mock
    const line: TLineNode = { id: 'l', name: 'Line', parentId: null, stroke: '#fff', type: NodeType.line, x1: 30, x2: 10, y1: 20, y2: 0 };
    const refs = createCanvasRefs({ transform: { gridDragGhostRef: { current: { nodeIds: ['l'], offset: { x: 5, y: 5 } } } } });

    // result
    expect(getGridDragRenderNode(refs, line, { l: line })).toMatchObject({ x1: 35, x2: 15, y1: 25, y2: 5 });
  });
});
