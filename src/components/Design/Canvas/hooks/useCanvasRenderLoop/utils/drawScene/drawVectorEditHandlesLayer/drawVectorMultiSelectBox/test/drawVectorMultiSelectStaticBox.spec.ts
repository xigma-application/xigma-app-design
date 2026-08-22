import { RefObject } from 'react';

// types
import { NodeType } from 'types/design/enums';
import { TVectorMultiSelectBox } from 'types/design/canvas/types';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { drawVectorMultiSelectStaticBox } from '../drawVectorMultiSelectStaticBox';

const drawRectMock = vi.fn();

vi.mock('utils/canvas/drawRect/drawRect', () => ({ drawRect: (...args: unknown[]): void => drawRectMock(...args) }));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

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

const nodes: Record<string, TSceneNode> = { 'vector-1': node };
const vectorEditingNodeIds = ['vector-1'];

const createVectorMultiSelectBoxRef = (box: TVectorMultiSelectBox | null = null): RefObject<TVectorMultiSelectBox | null> => ({
  current: box,
});

describe('drawVectorMultiSelectStaticBox', () => {
  beforeEach(() => {
    drawRectMock.mockClear();
  });

  it('should draw nothing when 2+ ids are selected but none of them resolve to a real point on the node', () => {
    // before — both ids reference vertices that no longer exist on the node
    drawVectorMultiSelectStaticBox(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      nodes,
      vectorEditingNodeIds,
      ['missing-1', 'missing-2'],
      [],
      createVectorMultiSelectBoxRef(),
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawRectMock).not.toHaveBeenCalled();
  });

  it('should draw a stroke-only rectangle over the persisted canonical box, computing it fresh the first time, with no fill and no corner handles', () => {
    // before
    const boxRef = createVectorMultiSelectBoxRef();

    drawVectorMultiSelectStaticBox(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      nodes,
      vectorEditingNodeIds,
      ['v1', 'v2'],
      [],
      boxRef,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawRectMock).toHaveBeenCalledTimes(1);
    expect(drawRectMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      { height: 40, stroke: '#0d99ff', width: 100, x: 0, y: 0 },
      200,
      150,
      IDENTITY_VIEWPORT,
      0,
    );
  });

  it('should reuse the persisted canonical box (including any accumulated rotation) instead of recomputing it from the live point positions', () => {
    // mock — a tilted box whose bounds no longer match a fresh AABB of v1/v2, proving it's the cached
    // value being drawn, not a live recompute
    const boxRef = createVectorMultiSelectBoxRef({ bounds: { height: 10, width: 10, x: 5, y: 5 }, rotation: 45, selectionKey: 'v1,v2' });

    // before
    drawVectorMultiSelectStaticBox(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      nodes,
      vectorEditingNodeIds,
      ['v1', 'v2'],
      [],
      boxRef,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawRectMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      { height: 10, stroke: '#0d99ff', width: 10, x: 5, y: 5 },
      200,
      150,
      IDENTITY_VIEWPORT,
      45,
    );
  });
});
