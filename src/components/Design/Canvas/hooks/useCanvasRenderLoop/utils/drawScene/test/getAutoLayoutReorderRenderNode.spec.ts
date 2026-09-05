// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { getAutoLayoutReorderRenderNode } from '../getAutoLayoutReorderRenderNode';

// types
import { NodeType } from 'types/design/enums';
import { TLineNode, TRectangleNode, TVectorNode } from 'types/design/types';

describe('getAutoLayoutReorderRenderNode', () => {
  it('should return the node unchanged when no reorder preview position is active for it', () => {
    // mock
    const rect: TRectangleNode = { fill: '#fff', height: 20, id: 'r', name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width: 20, x: 5, y: 15 }; // prettier-ignore
    const refs = createCanvasRefs();

    // result
    expect(getAutoLayoutReorderRenderNode(refs, rect)).toBe(rect);
  });

  it('should shift a box node’s x/y to its overridden preview position', () => {
    // mock
    const rect: TRectangleNode = { fill: '#fff', height: 20, id: 'r', name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width: 20, x: 5, y: 15 }; // prettier-ignore
    const refs = createCanvasRefs({
      transform: { autoLayoutReorderPreviewRef: { current: { activeIndex: 0, frameId: 'f1', positions: { r: { x: 40, y: 60 } } } } },
    });

    // result
    expect(getAutoLayoutReorderRenderNode(refs, rect)).toMatchObject({ x: 40, y: 60 });
  });

  it('should translate a line node’s endpoints by the delta between its real and overridden position', () => {
    // mock — real bounds are x:10/y:0 (min of the two endpoints); overriding to x:20/y:10 is a +10/+10 shift
    const line: TLineNode = { id: 'l', name: 'Line', parentId: null, stroke: '#fff', type: NodeType.line, x1: 30, x2: 10, y1: 20, y2: 0 };
    const refs = createCanvasRefs({
      transform: { autoLayoutReorderPreviewRef: { current: { activeIndex: 0, frameId: 'f1', positions: { l: { x: 20, y: 10 } } } } },
    });

    // result
    expect(getAutoLayoutReorderRenderNode(refs, line)).toMatchObject({ x1: 40, x2: 20, y1: 30, y2: 10 });
  });

  it('should translate every vertex of a vector node by the delta between its real and overridden position', () => {
    // mock — real bounds are x:0/y:0; overriding to x:5/y:5 is a +5/+5 shift
    const vector: TVectorNode = {
      defaultFill: [{ color: '#fff', opacity: 100, type: 'solid' }],
      filledFaceKeys: [],
      id: 'v',
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {},
      strokeColor: '#000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 10, y: 10 } },
    };
    const refs = createCanvasRefs({
      transform: { autoLayoutReorderPreviewRef: { current: { activeIndex: 0, frameId: 'f1', positions: { v: { x: 5, y: 5 } } } } },
    });

    // result
    expect(getAutoLayoutReorderRenderNode(refs, vector)).toMatchObject({
      vertices: { a: { id: 'a', x: 5, y: 5 }, b: { id: 'b', x: 15, y: 15 } },
    });
  });

  it('should return the node unchanged when the preview covers a different node id', () => {
    // mock
    const rect: TRectangleNode = { fill: '#fff', height: 20, id: 'r', name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width: 20, x: 5, y: 15 }; // prettier-ignore
    const refs = createCanvasRefs({
      transform: { autoLayoutReorderPreviewRef: { current: { activeIndex: 0, frameId: 'f1', positions: { other: { x: 40, y: 60 } } } } },
    });

    // result
    expect(getAutoLayoutReorderRenderNode(refs, rect)).toBe(rect);
  });
});
