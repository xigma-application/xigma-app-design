// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { getAutoLayoutReorderRenderNode } from '../getAutoLayoutReorderRenderNode';

// types
import { NodeType } from 'types/design/enums';
import { TGroupNode, TLineNode, TMaskNode, TRectangleNode, TVectorNode } from 'types/design/types';

describe('getAutoLayoutReorderRenderNode', () => {
  it('should return the node unchanged when no reorder preview position is active for it', () => {
    // mock
    const rect: TRectangleNode = { fill: '#fff', height: 20, id: 'r', name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width: 20, x: 5, y: 15 }; // prettier-ignore
    const refs = createCanvasRefs();

    // result
    expect(getAutoLayoutReorderRenderNode(refs, rect, { r: rect })).toBe(rect);
  });

  it('should shift a box node’s x/y to its overridden preview position', () => {
    // mock
    const rect: TRectangleNode = { fill: '#fff', height: 20, id: 'r', name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width: 20, x: 5, y: 15 }; // prettier-ignore
    const refs = createCanvasRefs({
      transform: { autoLayoutReorderPreviewRef: { current: { activeIndex: 0, frameId: 'f1', positions: { r: { x: 40, y: 60 } } } } },
    });

    // result
    expect(getAutoLayoutReorderRenderNode(refs, rect, { r: rect })).toMatchObject({ x: 40, y: 60 });
  });

  it('should translate a line node’s endpoints by the delta between its real and overridden position', () => {
    // mock — real bounds are x:10/y:0 (min of the two endpoints); overriding to x:20/y:10 is a +10/+10 shift
    const line: TLineNode = { id: 'l', name: 'Line', parentId: null, stroke: '#fff', type: NodeType.line, x1: 30, x2: 10, y1: 20, y2: 0 };
    const refs = createCanvasRefs({
      transform: { autoLayoutReorderPreviewRef: { current: { activeIndex: 0, frameId: 'f1', positions: { l: { x: 20, y: 10 } } } } },
    });

    // result
    expect(getAutoLayoutReorderRenderNode(refs, line, { l: line })).toMatchObject({ x1: 40, x2: 20, y1: 30, y2: 10 });
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
    expect(getAutoLayoutReorderRenderNode(refs, vector, { v: vector })).toMatchObject({
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
    expect(getAutoLayoutReorderRenderNode(refs, rect, { r: rect })).toBe(rect);
  });

  it('should shift a leaf whose parent group has the override — regression for the group/mask ghost staying in place', () => {
    // mock — the group itself is the dragged auto-layout member (only its id is in `positions`); its
    // leaf child has no entry of its own, so it must inherit the group's delta instead of sitting still
    const rect: TRectangleNode = { fill: '#fff', height: 10, id: 'r', name: 'Rectangle', parentId: 'g', rotation: 0, type: NodeType.rectangle, width: 10, x: 5, y: 5 }; // prettier-ignore
    const group: TGroupNode = { childIds: ['r'], height: 10, id: 'g', name: 'Group', parentId: null, rotation: 0, type: NodeType.group, width: 10, x: 5, y: 5 }; // prettier-ignore
    const refs = createCanvasRefs({
      transform: { autoLayoutReorderPreviewRef: { current: { activeIndex: 0, frameId: 'f1', positions: { g: { x: 25, y: 45 } } } } },
    });

    // result — group moved +20/+40, so the leaf (no override of its own) follows by the same delta
    expect(getAutoLayoutReorderRenderNode(refs, rect, { g: group, r: rect })).toMatchObject({ x: 25, y: 45 });
  });

  it('should shift a leaf two levels deep whose grandparent mask container has the override', () => {
    // mock — nested group inside a mask container; only the mask's id has an override
    const rect: TRectangleNode = { fill: '#fff', height: 10, id: 'r', name: 'Rectangle', parentId: 'inner', rotation: 0, type: NodeType.rectangle, width: 10, x: 0, y: 0 }; // prettier-ignore
    const inner: TGroupNode = { childIds: ['r'], height: 10, id: 'inner', name: 'Group', parentId: 'mask-1', rotation: 0, type: NodeType.group, width: 10, x: 0, y: 0 }; // prettier-ignore
    const mask: TMaskNode = { childIds: ['inner'], height: 10, id: 'mask-1', name: 'Mask group', parentId: null, rotation: 0, type: NodeType.mask, width: 10, x: 0, y: 0 }; // prettier-ignore
    const refs = createCanvasRefs({
      transform: {
        autoLayoutReorderPreviewRef: { current: { activeIndex: 0, frameId: 'f1', positions: { 'mask-1': { x: 100, y: 100 } } } },
      },
    });

    // result — mask moved +100/+100 from its own 0,0; the great-grandchild leaf inherits that same delta
    expect(getAutoLayoutReorderRenderNode(refs, rect, { inner, 'mask-1': mask, r: rect })).toMatchObject({ x: 100, y: 100 });
  });
});
