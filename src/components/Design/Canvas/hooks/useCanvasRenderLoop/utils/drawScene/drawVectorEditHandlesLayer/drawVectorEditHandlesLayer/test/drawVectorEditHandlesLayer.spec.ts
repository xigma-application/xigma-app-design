// types
import { RefObject } from 'react';
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';
import { TVectorMultiSelectBox } from 'types/design/canvas/types';

// utils
import { drawVectorEditHandlesLayer } from '../drawVectorEditHandlesLayer';

const drawVectorEditHandlesForNodeMock = vi.fn();
const drawRectMock = vi.fn();

vi.mock('../../drawVectorEditHandlesForNode/drawVectorEditHandlesForNode', () => ({
  drawVectorEditHandlesForNode: (...args: unknown[]): void => drawVectorEditHandlesForNodeMock(...args),
}));
vi.mock('utils/canvas/drawRect/drawRect', () => ({ drawRect: (...args: unknown[]): void => drawRectMock(...args) }));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;

const vectorNode: TVectorNode = {
  fillColor: null,
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
};

const nodes: Record<string, TSceneNode> = { [vectorNode.id]: vectorNode };

const createVectorMultiSelectBoxRef = (): RefObject<TVectorMultiSelectBox | null> => ({ current: null });

describe('drawVectorEditHandlesLayer', () => {
  beforeEach(() => {
    drawVectorEditHandlesForNodeMock.mockClear();
    drawRectMock.mockClear();
  });

  it('should call drawVectorEditHandlesForNode for no node when vectorEditingNodeIds is empty', () => {
    // before
    drawVectorEditHandlesLayer(
      gl,
      program,
      buffer,
      nodes,
      [],
      [],
      [],
      [],
      [],
      null,
      new Set(),
      null,
      null,
      null,
      null,
      [],
      null,
      null,
      null,
      null,
      false,
      createVectorMultiSelectBoxRef(),
      null,
      null,
      false,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawVectorEditHandlesForNodeMock).not.toHaveBeenCalled();
  });

  it('should skip a vectorEditingNodeId that no longer resolves to any vector node', () => {
    // mock
    const frameNodes: Record<string, TSceneNode> = {
      'frame-1': {
        fill: '#ff0000',
        height: 10,
        id: 'frame-1',
        name: 'Frame',
        parentId: null,
        rotation: 0,
        type: NodeType.frame,
        width: 10,
        x: 0,
        y: 0,
      },
    };

    // before
    drawVectorEditHandlesLayer(
      gl,
      program,
      buffer,
      frameNodes,
      ['frame-1'],
      [],
      [],
      [],
      [],
      null,
      new Set(),
      null,
      null,
      null,
      null,
      [],
      null,
      null,
      null,
      null,
      false,
      createVectorMultiSelectBoxRef(),
      null,
      null,
      false,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawVectorEditHandlesForNodeMock).not.toHaveBeenCalled();
  });

  it('should call drawVectorEditHandlesForNode once per open node, forwarding every param through unchanged', () => {
    // mock — a second, independent vector node also open for editing at the same time
    const secondNode: TVectorNode = { ...vectorNode, id: 'vector-2', segments: {} };
    const twoOpenNodes: Record<string, TSceneNode> = { [vectorNode.id]: vectorNode, [secondNode.id]: secondNode };
    const newVertexIds = new Set(['v1']);

    // before
    drawVectorEditHandlesLayer(
      gl,
      program,
      buffer,
      twoOpenNodes,
      [vectorNode.id, secondNode.id],
      ['v1'],
      ['pre-v'],
      ['s1'],
      ['pre-s'],
      'v1',
      newVertexIds,
      'hover-s',
      'hover-vs',
      { x: 1, y: 2 },
      { end: 'start', segmentId: 's1' },
      [{ end: 'end', segmentId: 's1' }],
      { end: 'start', segmentId: 's1' },
      'v1',
      'v1',
      { x: 3, y: 4 },
      true,
      createVectorMultiSelectBoxRef(),
      null,
      null,
      false,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result — one call per open node, with every argument forwarded through as-is
    expect(drawVectorEditHandlesForNodeMock).toHaveBeenCalledTimes(2);
    expect(drawVectorEditHandlesForNodeMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      vectorNode,
      ['v1'],
      ['pre-v'],
      ['s1'],
      ['pre-s'],
      'v1',
      newVertexIds,
      'hover-s',
      'hover-vs',
      { x: 1, y: 2 },
      { end: 'start', segmentId: 's1' },
      [{ end: 'end', segmentId: 's1' }],
      { end: 'start', segmentId: 's1' },
      'v1',
      'v1',
      { x: 3, y: 4 },
      true,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
    expect(drawVectorEditHandlesForNodeMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      secondNode,
      ['v1'],
      ['pre-v'],
      ['s1'],
      ['pre-s'],
      'v1',
      newVertexIds,
      'hover-s',
      'hover-vs',
      { x: 1, y: 2 },
      { end: 'start', segmentId: 's1' },
      [{ end: 'end', segmentId: 's1' }],
      { end: 'start', segmentId: 's1' },
      'v1',
      'v1',
      { x: 3, y: 4 },
      true,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should draw the multi-select box when 2+ vertices are selected together, with no corner handles', () => {
    // before
    drawVectorEditHandlesLayer(
      gl,
      program,
      buffer,
      nodes,
      [vectorNode.id],
      ['v1', 'v2'],
      [],
      [],
      [],
      null,
      new Set(),
      null,
      null,
      null,
      null,
      [],
      null,
      null,
      null,
      null,
      false,
      createVectorMultiSelectBoxRef(),
      null,
      null,
      false,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result — one plain stroke rect over the bounding box of v1(0,0)/v2(10,0)
    const boxRect = drawRectMock.mock.calls.find((args) => args[3].height === 0 && args[3].width === 10)?.[3];

    expect(boxRect).toMatchObject({ stroke: '#0d99ff', x: 0, y: 0 });
  });

  it('should not draw the multi-select box when only a single vertex is selected', () => {
    // before
    drawVectorEditHandlesLayer(
      gl,
      program,
      buffer,
      nodes,
      [vectorNode.id],
      ['v1'],
      [],
      [],
      [],
      null,
      new Set(),
      null,
      null,
      null,
      null,
      [],
      null,
      null,
      null,
      null,
      false,
      createVectorMultiSelectBoxRef(),
      null,
      null,
      false,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    const boxRect = drawRectMock.mock.calls.find((args) => args[3].height === 0 && args[3].width === 10);

    expect(boxRect).toBeUndefined();
  });
});
