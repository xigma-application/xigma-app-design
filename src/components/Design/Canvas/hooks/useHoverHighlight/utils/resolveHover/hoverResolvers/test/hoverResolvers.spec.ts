// types
import { NodeType, ToolName } from 'types/design/enums';
import {
  TEllipseNode,
  TFrameNode,
  TGroupNode,
  TLineNode,
  TPolygonNode,
  TRectangleNode,
  TSectionNode,
  TStarNode,
  TTextNode,
} from 'types/design/types';
import { THoverResolverContext } from '../../types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { resolveCornerRadiusHover } from '../resolveCornerRadiusHover';
import { resolveEditingTextHover } from '../resolveEditingTextHover';
import { resolveEllipseArcHover } from '../resolveEllipseArcHover';
import { resolveLineEndpointHover } from '../resolveLineEndpointHover';
import { resolvePathOffsetHover } from '../resolvePathOffsetHover';
import { resolvePlainNodeHover } from '../resolvePlainNodeHover';
import { resolvePolygonVertexHover } from '../resolvePolygonVertexHover';
import { resolveResizeHover } from '../resolveResizeHover';
import { resolveRotateHover } from '../resolveRotateHover';
import { resolveSmartSelectionGapHover } from '../resolveSmartSelectionGapHover';
import { resolveStarRatioHover } from '../resolveStarRatioHover';
import { resolveStarVertexHover } from '../resolveStarVertexHover';
import { resolveVectorMultiSelectResizeHover } from '../resolveVectorMultiSelectResizeHover';
import { resolveVectorMultiSelectRotateHover } from '../resolveVectorMultiSelectRotateHover';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const createContext = (overrides: Partial<THoverResolverContext>): THoverResolverContext => ({
  activeTool: ToolName.default,
  editingContent: '',
  editingNodeId: null,
  editingTextBox: null,
  isControlPressed: false,
  leafNodes: [],
  nodesById: {},
  point: { x: 0, y: 0 },
  refs: createCanvasRefs(),
  resizableSelectedNodes: [],
  resizeHandleHit: null,
  selectedNodes: [],
  smartSelectionNodes: [],
  vectorMultiSelectBox: null,
  vectorMultiSelectResizeHandle: null,
  viewport: IDENTITY_VIEWPORT,
  ...overrides,
});

const line: TLineNode = {
  id: 'line-1',
  name: 'Line',
  parentId: null,
  stroke: '#ffffff',
  type: NodeType.line,
  x1: 500,
  x2: 600,
  y1: 500,
  y2: 500,
};

const pathText: TTextNode = {
  content: 'Hi',
  fill: '#ffffff',
  flipX: false,
  flipY: false,
  fontFamily: 'Inter',
  fontSize: 14,
  height: 200,
  id: 'text-1',
  name: 'Text',
  parentId: null,
  pathId: 'ellipse-1',
  pathStartOffset: 0,
  rotation: 0,
  type: NodeType.text,
  width: 200,
  x: 4000,
  y: 4000,
};

const polygon: TPolygonNode = {
  cornerRadius: 15,
  fill: '#ff0000',
  flipX: false,
  flipY: false,
  height: 100,
  id: 'polygon-1',
  name: 'Polygon',
  parentId: null,
  rotation: 0,
  sides: 3,
  type: NodeType.polygon,
  width: 100,
  x: 0,
  y: 0,
};

const star: TStarNode = {
  cornerRadius: 0,
  fill: '#ff0000',
  flipX: false,
  flipY: false,
  height: 100,
  id: 'star-1',
  name: 'Star',
  parentId: null,
  points: 5,
  ratio: 0.5,
  rotation: 0,
  type: NodeType.star,
  width: 100,
  x: 0,
  y: 0,
};

const ellipse: TEllipseNode = {
  fill: '#ff0000',
  height: 100,
  id: 'ellipse-1',
  name: 'Ellipse',
  parentId: null,
  rotation: 0,
  type: NodeType.ellipse,
  width: 100,
  x: 0,
  y: 0,
};

const rectangle: TRectangleNode = {
  cornerRadius: 20,
  fill: '#ff0000',
  height: 100,
  id: 'rectangle-1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 100,
  x: 0,
  y: 0,
};

describe('resolveSmartSelectionGapHover', () => {
  const rowA: TRectangleNode = { ...rectangle, id: 'row-a', x: 0, y: 0 };
  const rowB: TRectangleNode = { ...rectangle, id: 'row-b', x: 150, y: 0 };

  it('should return a hover result with the move-x cursor class over a row gap handle', () => {
    // result
    expect(resolveSmartSelectionGapHover(createContext({ point: { x: 125, y: 50 }, smartSelectionNodes: [rowA, rowB] }))).toEqual({
      className: 'move-x',
      cursor: '',
      nodeId: null,
    });
  });

  it("should stash the hovered gap's axis, value and pointer position on the shared ref for the draw loop", () => {
    // mock
    const refs = createCanvasRefs();

    // before
    resolveSmartSelectionGapHover(createContext({ point: { x: 125, y: 50 }, refs, smartSelectionNodes: [rowA, rowB] }));

    // result
    expect(refs.hover.hoveredSmartSelectionGapRef.current).toEqual({ axis: 'x', gapValue: 50, point: { x: 125, y: 50 } });
    expect(refs.hover.isSmartSelectionBoxHoveredRef.current).toBe(true);
  });

  it('should clear the ref and return undefined when the point misses every gap handle', () => {
    // mock
    const refs = createCanvasRefs();

    refs.hover.hoveredSmartSelectionGapRef.current = { axis: 'x', gapValue: 50, point: { x: 125, y: 50 } };

    // before
    const result = resolveSmartSelectionGapHover(createContext({ point: { x: 900, y: 900 }, refs, smartSelectionNodes: [rowA, rowB] }));

    // result
    expect(result).toBeUndefined();
    expect(refs.hover.hoveredSmartSelectionGapRef.current).toBeNull();
  });

  it('should return undefined when the selection does not form a valid Smart Selection layout', () => {
    // result
    expect(resolveSmartSelectionGapHover(createContext({ point: { x: 50, y: 50 }, smartSelectionNodes: [rowA] }))).toBeUndefined();
  });

  it('should mark the selection box as hovered while inside its bounds, even off any handle', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    resolveSmartSelectionGapHover(createContext({ point: { x: 10, y: 10 }, refs, smartSelectionNodes: [rowA, rowB] }));

    // result
    expect(refs.hover.hoveredSmartSelectionGapRef.current).toBeNull();
    expect(refs.hover.isSmartSelectionBoxHoveredRef.current).toBe(true);
  });

  it('should clear the selection box hover flag once the pointer leaves its bounds', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    resolveSmartSelectionGapHover(createContext({ point: { x: 900, y: 900 }, refs, smartSelectionNodes: [rowA, rowB] }));

    // result
    expect(refs.hover.isSmartSelectionBoxHoveredRef.current).toBe(false);
  });

  it("should stash the hovered swap handle's centre on the shared ref while over a node centre", () => {
    // mock
    const refs = createCanvasRefs();

    // before
    resolveSmartSelectionGapHover(createContext({ point: { x: 50, y: 50 }, refs, smartSelectionNodes: [rowA, rowB] }));

    // result
    expect(refs.hover.hoveredSmartSelectionSwapRef.current).toEqual({ center: { x: 50, y: 50 } });
  });

  it('should clear the swap handle ref when the pointer is not over any node centre', () => {
    // mock
    const refs = createCanvasRefs();

    refs.hover.hoveredSmartSelectionSwapRef.current = { center: { x: 50, y: 50 } };

    // before
    resolveSmartSelectionGapHover(createContext({ point: { x: 125, y: 50 }, refs, smartSelectionNodes: [rowA, rowB] }));

    // result
    expect(refs.hover.hoveredSmartSelectionSwapRef.current).toBeNull();
  });

  it('should never mark the selection box as hovered when nothing is selected', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    resolveSmartSelectionGapHover(createContext({ point: { x: 0, y: 0 }, refs, smartSelectionNodes: [] }));

    // result
    expect(refs.hover.isSmartSelectionBoxHoveredRef.current).toBe(false);
  });
});

describe('resolveLineEndpointHover', () => {
  it('should return a hover result over a selected line endpoint', () => {
    // result
    expect(resolveLineEndpointHover(createContext({ point: { x: 500, y: 500 }, resizableSelectedNodes: [line] }))).toEqual({
      className: 'positioning',
      cursor: '',
      nodeId: 'line-1',
    });
  });

  it('should return undefined when the point misses the line endpoint', () => {
    // result
    expect(resolveLineEndpointHover(createContext({ point: { x: 900, y: 900 }, resizableSelectedNodes: [line] }))).toBeUndefined();
  });
});

describe('resolvePathOffsetHover', () => {
  it('should return a hover result over a selected path-text start-offset handle', () => {
    // result
    expect(resolvePathOffsetHover(createContext({ point: { x: 4200, y: 4100 }, selectedNodes: [pathText] }))).toEqual({
      className: 'hand',
      cursor: '',
      nodeId: 'text-1',
    });
  });

  it('should return undefined when the point misses the start-offset handle', () => {
    // result
    expect(resolvePathOffsetHover(createContext({ point: { x: 4000, y: 4000 }, selectedNodes: [pathText] }))).toBeUndefined();
  });
});

describe('resolveEditingTextHover', () => {
  const editingTextBox = { flipX: false, flipY: false, height: 20, rotation: 0, width: 200, x: 5000, y: 5000 };

  it('should return a hover result over text currently being edited', () => {
    // result
    expect(resolveEditingTextHover(createContext({ editingContent: 'Hello', editingTextBox, point: { x: 5005, y: 5010 } }))).toEqual({
      className: null,
      cursor: 'text',
      nodeId: null,
    });
  });

  it('should return undefined when the point misses the editing text', () => {
    // result
    expect(
      resolveEditingTextHover(createContext({ editingContent: 'Hello', editingTextBox, point: { x: 5005, y: 5200 } })),
    ).toBeUndefined();
  });
});

describe('resolvePolygonVertexHover', () => {
  it('should return a hover result over a selected polygon vertex-count handle', () => {
    // mock — vertex index 1 sits at (93.301270, 75); cornerRadius 15 pulls it toward center by
    // 15 * (setback 2 - 1) to (80.310889, 67.5)
    // result
    expect(resolvePolygonVertexHover(createContext({ point: { x: 80.310889, y: 67.5 }, resizableSelectedNodes: [polygon] }))).toEqual({
      className: 'vertices',
      cursor: '',
      nodeId: 'polygon-1',
    });
  });

  it('should return undefined when the point misses the polygon vertex-count handle', () => {
    // result
    expect(resolvePolygonVertexHover(createContext({ point: { x: 90, y: 90 }, resizableSelectedNodes: [polygon] }))).toBeUndefined();
  });
});

describe('resolveStarVertexHover', () => {
  it('should return a hover result over a selected star vertex-count handle', () => {
    // mock — vertex index 2 of a 100x100 5-point star sits at (97.552826, 34.549150)
    // result
    expect(resolveStarVertexHover(createContext({ point: { x: 97.552826, y: 34.54915 }, resizableSelectedNodes: [star] }))).toEqual({
      className: 'vertices',
      cursor: '',
      nodeId: 'star-1',
    });
  });

  it('should return undefined when the point misses the star vertex-count handle', () => {
    // result
    expect(resolveStarVertexHover(createContext({ point: { x: 90, y: 90 }, resizableSelectedNodes: [star] }))).toBeUndefined();
  });
});

describe('resolveStarRatioHover', () => {
  it('should return a hover result over a selected star ratio handle', () => {
    // mock — vertex index 1 of a 100x100 5-point star at ratio 0.5 sits at (64.694631, 29.774575)
    // result
    expect(resolveStarRatioHover(createContext({ point: { x: 64.694631, y: 29.774575 }, resizableSelectedNodes: [star] }))).toEqual({
      className: 'ratio',
      cursor: '',
      nodeId: 'star-1',
    });
  });

  it('should return undefined when the point misses the star ratio handle', () => {
    // result
    expect(resolveStarRatioHover(createContext({ point: { x: 90, y: 90 }, resizableSelectedNodes: [star] }))).toBeUndefined();
  });
});

describe('resolveEllipseArcHover', () => {
  it('should return a hover result over the Sweep handle', () => {
    // mock — default arcEndAngle (90deg) puts the Sweep handle at the east rim (100, 50)
    // result
    expect(resolveEllipseArcHover(createContext({ point: { x: 100, y: 50 }, resizableSelectedNodes: [ellipse] }))).toEqual({
      className: 'radius',
      cursor: '',
      nodeId: 'ellipse-1',
    });
  });

  it('should return a hover result over the Start (rotate) handle', () => {
    // mock — cut from arcStartAngle 90 to arcEndAngle 0; Start handle stays at the east rim (100, 50)
    const cutEllipse: TEllipseNode = { ...ellipse, arcEndAngle: 0, arcStartAngle: 90 };

    // result
    expect(resolveEllipseArcHover(createContext({ point: { x: 100, y: 50 }, resizableSelectedNodes: [cutEllipse] }))).toEqual({
      className: 'radius',
      cursor: '',
      nodeId: 'ellipse-1',
    });
  });

  it('should return a hover result over the Ratio handle', () => {
    // mock — the Ratio handle rests at dead center (50, 50) while arcRatio is 0
    // result
    expect(resolveEllipseArcHover(createContext({ point: { x: 50, y: 50 }, resizableSelectedNodes: [ellipse] }))).toEqual({
      className: 'radius',
      cursor: '',
      nodeId: 'ellipse-1',
    });
  });

  it('should return undefined when the point misses every ellipse arc handle', () => {
    // result
    expect(resolveEllipseArcHover(createContext({ point: { x: 900, y: 900 }, resizableSelectedNodes: [ellipse] }))).toBeUndefined();
  });
});

describe('resolveResizeHover', () => {
  const resizeHandleHit: THoverResolverContext['resizeHandleHit'] = {
    bounds: { height: 100, width: 100, x: 0, y: 0 },
    handle: 'nw',
    rotation: 0,
  };

  it('should return a hover result with the resize cursor for the default tool', () => {
    // result
    expect(resolveResizeHover(createContext({ activeTool: ToolName.default, resizeHandleHit }))).toMatchObject({
      className: null,
      nodeId: null,
    });
  });

  it('should return a hover result with the scale cursor when the Scale tool is active', () => {
    // result
    expect(resolveResizeHover(createContext({ activeTool: ToolName.scale, resizeHandleHit }))).toMatchObject({
      className: null,
      nodeId: null,
    });
  });

  it('should return undefined when no resize handle was hit', () => {
    // result
    expect(resolveResizeHover(createContext({ resizeHandleHit: null }))).toBeUndefined();
  });
});

describe('resolveCornerRadiusHover', () => {
  it('should return a hover result over a selected rectangle corner-radius handle', () => {
    // mock — a 100x100 rectangle with cornerRadius 20 has its ne handle at (100, 20)
    // result
    expect(resolveCornerRadiusHover(createContext({ point: { x: 80, y: 20 }, resizableSelectedNodes: [rectangle] }))).toEqual({
      className: 'radius',
      cursor: '',
      nodeId: 'rectangle-1',
    });
  });

  it('should return a hover result over a selected polygon corner-radius handle', () => {
    // mock — top vertex of a 100x100 triangle sits at (50, 0); radius 15 moves it toward center
    // result
    expect(resolveCornerRadiusHover(createContext({ point: { x: 50, y: 30 }, resizableSelectedNodes: [polygon] }))).toEqual({
      className: 'radius',
      cursor: '',
      nodeId: 'polygon-1',
    });
  });

  it('should return a hover result over a selected star corner-radius handle', () => {
    // mock — top vertex of a 100x100 5-point star; radius 15 moves it toward center
    const cornerRadiusStar: TStarNode = { ...star, cornerRadius: 15 };

    // result
    expect(resolveCornerRadiusHover(createContext({ point: { x: 50, y: 33.893272 }, resizableSelectedNodes: [cornerRadiusStar] }))).toEqual(
      {
        className: 'radius',
        cursor: '',
        nodeId: 'star-1',
      },
    );
  });

  it('should return undefined when a resize handle was already hit, without checking the polygon/star handles', () => {
    // mock
    const resizeHandleHit: THoverResolverContext['resizeHandleHit'] = {
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      handle: 'nw',
      rotation: 0,
    };

    // result
    expect(
      resolveCornerRadiusHover(createContext({ point: { x: 50, y: 30 }, resizableSelectedNodes: [polygon], resizeHandleHit })),
    ).toBeUndefined();
  });

  it('should return undefined when the point misses every corner-radius handle', () => {
    // result
    expect(resolveCornerRadiusHover(createContext({ point: { x: 900, y: 900 }, resizableSelectedNodes: [rectangle] }))).toBeUndefined();
  });
});

describe('resolveRotateHover', () => {
  const rotatingFrame: TRectangleNode = { ...rectangle, cornerRadius: undefined, height: 100, width: 100, x: 3000, y: 3000 };

  it('should return a hover result with the rotate cursor just outside the resize handle', () => {
    // result
    expect(resolveRotateHover(createContext({ point: { x: 3000, y: 2990 }, resizableSelectedNodes: [rotatingFrame] }))).toMatchObject({
      className: null,
      nodeId: null,
    });
  });

  it('should return undefined when the point misses the rotate ring', () => {
    // result
    expect(resolveRotateHover(createContext({ point: { x: 900, y: 900 }, resizableSelectedNodes: [rotatingFrame] }))).toBeUndefined();
  });
});

describe('resolveVectorMultiSelectResizeHover', () => {
  const box = { bounds: { height: 100, width: 100, x: 0, y: 0 }, rotation: 0, selectionKey: 'v1,v2' };

  it('should return a hover result with the rotated resize cursor when a resize handle was hit', () => {
    // result
    expect(
      resolveVectorMultiSelectResizeHover(createContext({ vectorMultiSelectBox: box, vectorMultiSelectResizeHandle: 'se' })),
    ).toMatchObject({ className: null, nodeId: null });
  });

  it('should return undefined when no resize handle was hit', () => {
    // result
    expect(
      resolveVectorMultiSelectResizeHover(createContext({ vectorMultiSelectBox: box, vectorMultiSelectResizeHandle: null })),
    ).toBeUndefined();
  });

  it('should return undefined when there is no multi-select box at all', () => {
    // result
    expect(
      resolveVectorMultiSelectResizeHover(createContext({ vectorMultiSelectBox: null, vectorMultiSelectResizeHandle: 'se' })),
    ).toBeUndefined();
  });
});

describe('resolveVectorMultiSelectRotateHover', () => {
  const box = { bounds: { height: 100, width: 100, x: 0, y: 0 }, rotation: 0, selectionKey: 'v1,v2' };

  it('should return a hover result with the rotate cursor just outside a corner of the multi-select bounds', () => {
    // result
    expect(resolveVectorMultiSelectRotateHover(createContext({ point: { x: 0, y: -10 }, vectorMultiSelectBox: box }))).toMatchObject({
      className: null,
      nodeId: null,
    });
  });

  it('should return undefined when the point misses the rotate ring', () => {
    // result
    expect(resolveVectorMultiSelectRotateHover(createContext({ point: { x: 50, y: 50 }, vectorMultiSelectBox: box }))).toBeUndefined();
  });

  it('should return undefined when there is no multi-select box at all', () => {
    // result
    expect(resolveVectorMultiSelectRotateHover(createContext({ point: { x: 0, y: -10 }, vectorMultiSelectBox: null }))).toBeUndefined();
  });
});

describe('resolvePlainNodeHover', () => {
  it("should return the hovered node's own id when the point lands on a node", () => {
    // result
    expect(resolvePlainNodeHover(createContext({ leafNodes: [rectangle], point: { x: 50, y: 50 } }))).toEqual({
      className: null,
      cursor: '',
      nodeId: 'rectangle-1',
    });
  });

  it('should return a null nodeId when the point misses every node', () => {
    // result
    expect(resolvePlainNodeHover(createContext({ leafNodes: [rectangle], point: { x: 900, y: 900 } }))).toEqual({
      className: null,
      cursor: '',
      nodeId: null,
    });
  });

  const group: TGroupNode = {
    childIds: ['group-child-a', 'group-child-b'],
    height: 100,
    id: 'group-1',
    name: 'Group',
    parentId: null,
    rotation: 0,
    type: NodeType.group,
    width: 220,
    x: 0,
    y: 0,
  };
  const child: TRectangleNode = { ...rectangle, id: 'group-child-a', parentId: 'group-1' };
  const otherChild: TEllipseNode = { ...ellipse, id: 'group-child-b', parentId: 'group-1', x: 120 };
  const unrelatedNode: TRectangleNode = { ...rectangle, id: 'unrelated-rect', x: 1000, y: 1000 };
  const nodesById = { 'group-1': group, 'group-child-a': child, 'group-child-b': otherChild };

  it('should resolve a hit on a child to its top-level group, not the child itself, when Ctrl is not held', () => {
    // result
    expect(
      resolvePlainNodeHover(createContext({ isControlPressed: false, leafNodes: [child, otherChild], nodesById, point: { x: 50, y: 50 } })),
    ).toEqual({ className: null, cursor: '', nodeId: 'group-1' });
  });

  it('should bypass the group and hit-test its individual child when Ctrl is held', () => {
    // result
    expect(
      resolvePlainNodeHover(createContext({ isControlPressed: true, leafNodes: [child, otherChild], nodesById, point: { x: 50, y: 50 } })),
    ).toEqual({ className: null, cursor: '', nodeId: 'group-child-a' });
  });

  it('should show nothing over empty space inside the group’s bounding box that no child actually covers, Ctrl or not', () => {
    // mock — x:105 sits in the group’s 0..220 bbox but between the two children (rectangle 0..100, ellipse 120..220)
    const ctx = createContext({ isControlPressed: false, leafNodes: [child, otherChild], nodesById, point: { x: 105, y: 50 } });

    // result
    expect(resolvePlainNodeHover(ctx)).toEqual({ className: null, cursor: '', nodeId: null });
    expect(resolvePlainNodeHover({ ...ctx, isControlPressed: true })).toEqual({ className: null, cursor: '', nodeId: null });
  });

  it('should bypass the group without Ctrl once one of its children is already selected', () => {
    // result
    expect(
      resolvePlainNodeHover(
        createContext({
          isControlPressed: false,
          leafNodes: [child, otherChild],
          nodesById,
          point: { x: 50, y: 50 },
          selectedNodes: [child],
        }),
      ),
    ).toEqual({ className: null, cursor: '', nodeId: 'group-child-a' });
  });

  it('should still resolve to the group when a different, unrelated node is selected', () => {
    // result
    expect(
      resolvePlainNodeHover(
        createContext({
          isControlPressed: false,
          leafNodes: [child, otherChild],
          nodesById,
          point: { x: 50, y: 50 },
          selectedNodes: [unrelatedNode],
        }),
      ),
    ).toEqual({ className: null, cursor: '', nodeId: 'group-1' });
  });

  it('should still resolve to the group when a group child is selected together with an unrelated node', () => {
    // mock — the group must only be treated as "entered" when the selection lies entirely inside
    // it; a group child dragged together with an unrelated sibling must not hide the group's box
    // for the rest of its own children
    expect(
      resolvePlainNodeHover(
        createContext({
          isControlPressed: false,
          leafNodes: [child, otherChild],
          nodesById,
          point: { x: 50, y: 50 },
          selectedNodes: [otherChild, unrelatedNode],
        }),
      ),
    ).toEqual({ className: null, cursor: '', nodeId: 'group-1' });
  });

  it('should hand the hover to an unselected sibling drawn on top of the selected node', () => {
    // mock — a big selected rect with a smaller sibling fully inside it; the small one paints last
    const bigRect: TRectangleNode = { ...rectangle, cornerRadius: 0, height: 200, id: 'big-rect', width: 200 };
    const smallRect: TRectangleNode = { ...rectangle, cornerRadius: 0, height: 40, id: 'small-rect', width: 40, x: 20, y: 20 };

    // result — the point sits where both overlap, so the top-most sibling wins the hover
    expect(
      resolvePlainNodeHover(
        createContext({
          leafNodes: [bigRect, smallRect],
          nodesById: { 'big-rect': bigRect, 'small-rect': smallRect },
          point: { x: 30, y: 30 },
          selectedNodes: [bigRect],
        }),
      ),
    ).toEqual({ className: null, cursor: '', nodeId: 'small-rect' });
  });

  it('should keep the hover on the selected node on a spot no sibling covers', () => {
    // mock — same layout, hovering the selected rect where the smaller sibling does not reach
    const bigRect: TRectangleNode = { ...rectangle, cornerRadius: 0, height: 200, id: 'big-rect', width: 200 };
    const smallRect: TRectangleNode = { ...rectangle, cornerRadius: 0, height: 40, id: 'small-rect', width: 40, x: 20, y: 20 };

    // result
    expect(
      resolvePlainNodeHover(
        createContext({
          leafNodes: [bigRect, smallRect],
          nodesById: { 'big-rect': bigRect, 'small-rect': smallRect },
          point: { x: 5, y: 5 },
          selectedNodes: [bigRect],
        }),
      ),
    ).toEqual({ className: null, cursor: '', nodeId: 'big-rect' });
  });

  it('should show a directly-hovered node’s own box when it is itself already selected, even alongside an unrelated node', () => {
    // mock — [group-child-a, group-child-b] grouped; select group-child-a together with an
    // unrelated node and drag them; hovering group-child-a itself afterward must keep showing
    // its own box, not jump to the whole group just because the selection isn’t "entered"
    expect(
      resolvePlainNodeHover(
        createContext({
          isControlPressed: false,
          leafNodes: [child, otherChild],
          nodesById,
          point: { x: 50, y: 50 },
          selectedNodes: [child, unrelatedNode],
        }),
      ),
    ).toEqual({ className: null, cursor: '', nodeId: 'group-child-a' });
  });

  const frameWithChild: TFrameNode = {
    childIds: ['frame-child'],
    clipContent: true,
    fill: '#ffffff',
    height: 300,
    id: 'frame-1',
    name: 'Frame',
    parentId: null,
    rotation: 0,
    type: NodeType.frame,
    width: 300,
    x: 0,
    y: 0,
  };
  const frameChild: TRectangleNode = { ...rectangle, cornerRadius: 0, id: 'frame-child', parentId: 'frame-1', x: 20, y: 20 };
  const emptyFrame: TFrameNode = { ...frameWithChild, childIds: [], id: 'empty-frame' };

  it('should highlight the child, not its parent frame, when hovering a child of a frame that has children', () => {
    // result — a click there selects the child directly, so the hover must match
    expect(
      resolvePlainNodeHover(
        createContext({
          leafNodes: [frameChild],
          nodesById: { 'frame-1': frameWithChild, 'frame-child': frameChild },
          point: { x: 40, y: 40 },
        }),
      ),
    ).toEqual({ className: null, cursor: '', nodeId: 'frame-child' });
  });

  it('should still highlight an empty frame itself when hovering its body', () => {
    // result — an empty frame has no click-through behaviour
    expect(
      resolvePlainNodeHover(
        createContext({ leafNodes: [emptyFrame], nodesById: { 'empty-frame': emptyFrame }, point: { x: 150, y: 150 } }),
      ),
    ).toEqual({ className: null, cursor: '', nodeId: 'empty-frame' });
  });

  it('should highlight the frame itself when hovering its name label, even though the body is click-through', () => {
    // the label sits ~17px above the frame's top-left corner at zoom 1
    expect(
      resolvePlainNodeHover(
        createContext({
          leafNodes: [frameChild],
          nodesById: { 'frame-1': frameWithChild, 'frame-child': frameChild },
          point: { x: 6, y: -12 },
        }),
      ),
    ).toEqual({ className: null, cursor: '', nodeId: 'frame-1' });
  });

  const outerFrame: TFrameNode = { ...frameWithChild, childIds: ['nested-frame'], id: 'outer-frame' };
  const nestedFrame: TFrameNode = {
    ...frameWithChild,
    childIds: ['nested-child'],
    height: 100,
    id: 'nested-frame',
    parentId: 'outer-frame',
    width: 100,
    x: 20,
    y: 20,
  };
  const nestedChild: TRectangleNode = { ...frameChild, id: 'nested-child', parentId: 'nested-frame', x: 40, y: 40 };
  const nestedNodesById = { 'nested-child': nestedChild, 'nested-frame': nestedFrame, 'outer-frame': outerFrame };

  it('should highlight a frame nested directly inside another frame, not the outer frame, when hovering its empty body', () => {
    // a nested frame is not click-through — its own body behaves like a normal node
    expect(resolvePlainNodeHover(createContext({ leafNodes: [nestedFrame], nodesById: nestedNodesById, point: { x: 90, y: 90 } }))).toEqual(
      { className: null, cursor: '', nodeId: 'nested-frame' },
    );
  });

  it('should highlight a frame nested directly inside another frame, not its own child, when hovering that child', () => {
    // the nested frame's own child is excluded from the click-through leaf set (opaque ancestor), so the
    // nested frame itself is what actually gets hit here
    expect(resolvePlainNodeHover(createContext({ leafNodes: [nestedFrame], nodesById: nestedNodesById, point: { x: 50, y: 50 } }))).toEqual(
      { className: null, cursor: '', nodeId: 'nested-frame' },
    );
  });

  it('should bypass a nested frame and hit-test its child directly when Ctrl is held', () => {
    expect(
      resolvePlainNodeHover(
        createContext({
          isControlPressed: true,
          leafNodes: [nestedChild],
          nodesById: nestedNodesById,
          point: { x: 50, y: 50 },
        }),
      ),
    ).toEqual({ className: null, cursor: '', nodeId: 'nested-child' });
  });

  const section: TSectionNode = {
    childIds: ['section-frame'],
    fill: '#444444',
    height: 300,
    id: 'section-1',
    name: 'Section',
    parentId: null,
    rotation: 0,
    type: NodeType.section,
    width: 300,
    x: 0,
    y: 0,
  };
  const sectionFrame: TFrameNode = { ...frameWithChild, childIds: [], id: 'section-frame', parentId: 'section-1' };
  const sectionRect: TRectangleNode = { ...rectangle, cornerRadius: 0, id: 'section-rect', parentId: 'section-1', x: 200, y: 20 };
  const sectionNodesById = { 'section-1': section, 'section-frame': sectionFrame, 'section-rect': sectionRect };

  it('should highlight a frame nested inside a section, not the section, when hovering its empty body', () => {
    // a frame is never opaque, regardless of what non-frame container it sits inside
    expect(
      resolvePlainNodeHover(createContext({ leafNodes: [sectionFrame], nodesById: sectionNodesById, point: { x: 50, y: 50 } })),
    ).toEqual({ className: null, cursor: '', nodeId: 'section-frame' });
  });

  it('should highlight the section itself, not its plain rectangle child, when hovering that child without Ctrl', () => {
    // unlike a frame, a section is always opaque — a click there matches this hover
    expect(
      resolvePlainNodeHover(createContext({ leafNodes: [sectionRect], nodesById: sectionNodesById, point: { x: 210, y: 30 } })),
    ).toEqual({ className: null, cursor: '', nodeId: 'section-1' });
  });

  it('should bypass the section and hit-test its rectangle child directly when Ctrl is held', () => {
    expect(
      resolvePlainNodeHover(
        createContext({ isControlPressed: true, leafNodes: [sectionRect], nodesById: sectionNodesById, point: { x: 210, y: 30 } }),
      ),
    ).toEqual({ className: null, cursor: '', nodeId: 'section-rect' });
  });
});
