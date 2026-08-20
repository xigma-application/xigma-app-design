import { RefObject } from 'react';

// types
import { NodeType } from 'types/design/enums';
import { TVectorMultiSelectBox } from 'types/design/canvas/types';
import { TVectorNode } from 'types/design/types';

// utils
import { drawVectorMultiSelectBox } from '../drawVectorMultiSelectBox';

const drawVectorMultiSelectResizeDragBoxMock = vi.fn();
const drawVectorMultiSelectRotateDragBoxMock = vi.fn();
const drawVectorMultiSelectStaticBoxMock = vi.fn();

vi.mock('../drawVectorMultiSelectResizeDragBox', () => ({
  drawVectorMultiSelectResizeDragBox: (...args: unknown[]): void => drawVectorMultiSelectResizeDragBoxMock(...args),
}));
vi.mock('../drawVectorMultiSelectRotateDragBox', () => ({
  drawVectorMultiSelectRotateDragBox: (...args: unknown[]): void => drawVectorMultiSelectRotateDragBoxMock(...args),
}));
vi.mock('../drawVectorMultiSelectStaticBox', () => ({
  drawVectorMultiSelectStaticBox: (...args: unknown[]): void => drawVectorMultiSelectStaticBoxMock(...args),
}));

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
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 40 } },
};

const createVectorMultiSelectBoxRef = (box: TVectorMultiSelectBox | null = null): RefObject<TVectorMultiSelectBox | null> => ({
  current: box,
});

describe('drawVectorMultiSelectBox', () => {
  beforeEach(() => {
    drawVectorMultiSelectResizeDragBoxMock.mockClear();
    drawVectorMultiSelectRotateDragBoxMock.mockClear();
    drawVectorMultiSelectStaticBoxMock.mockClear();
  });

  it('should draw nothing when fewer than 2 points are selected', () => {
    // before
    drawVectorMultiSelectBox(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      ['v1'],
      [],
      createVectorMultiSelectBoxRef(),
      null,
      null,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawVectorMultiSelectResizeDragBoxMock).not.toHaveBeenCalled();
    expect(drawVectorMultiSelectRotateDragBoxMock).not.toHaveBeenCalled();
    expect(drawVectorMultiSelectStaticBoxMock).not.toHaveBeenCalled();
  });

  it('should clear the persisted canonical box when the selection drops below 2, so a later reselection of the same points starts fresh instead of matching a stale cached shape/rotation', () => {
    // mock — a leftover box from a previous, now-closed multi-selection
    const boxRef = createVectorMultiSelectBoxRef({ bounds: { height: 40, width: 100, x: 0, y: 0 }, rotation: 45, selectionKey: 'v1,v2' });

    // before
    drawVectorMultiSelectBox(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      ['v1'],
      [],
      boxRef,
      null,
      null,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(boxRef.current).toBeNull();
  });

  it('should dispatch to the resize-drag box while a resize drag is active', () => {
    // mock
    const vectorMultiSelectResizeDrag = {
      anchor: { x: 0, y: 0 },
      anchorWorld: { x: 0, y: 0 },
      bounds: { height: 40, width: 100, x: 0, y: 0 },
      handle: 'se' as const,
      handleOrigins: {},
      liveBounds: { height: 40, width: 100, x: 0, y: 0 },
      nodeId: 'vector-1',
      rotation: 0,
      vertexOrigins: {},
    };

    // before
    drawVectorMultiSelectBox(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      ['v1', 'v2'],
      [],
      createVectorMultiSelectBoxRef(),
      vectorMultiSelectResizeDrag,
      null,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawVectorMultiSelectResizeDragBoxMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      vectorMultiSelectResizeDrag,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
    expect(drawVectorMultiSelectRotateDragBoxMock).not.toHaveBeenCalled();
    expect(drawVectorMultiSelectStaticBoxMock).not.toHaveBeenCalled();
  });

  it('should dispatch to the rotate-drag box while a rotate drag is active and no resize drag is', () => {
    // mock
    const vectorMultiSelectRotateDrag = {
      bounds: { height: 40, width: 100, x: 0, y: 0 },
      cursorAngle: 0,
      deltaDegrees: 0,
      handleOrigins: {},
      nodeId: 'vector-1',
      pivot: { x: 50, y: 20 },
      rotation: 0,
      startAngle: 0,
      vertexOrigins: {},
    };

    // before
    drawVectorMultiSelectBox(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      ['v1', 'v2'],
      [],
      createVectorMultiSelectBoxRef(),
      null,
      vectorMultiSelectRotateDrag,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawVectorMultiSelectRotateDragBoxMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      vectorMultiSelectRotateDrag,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
    expect(drawVectorMultiSelectResizeDragBoxMock).not.toHaveBeenCalled();
    expect(drawVectorMultiSelectStaticBoxMock).not.toHaveBeenCalled();
  });

  it('should dispatch to the static box when no resize/rotate drag is active', () => {
    // before
    const boxRef = createVectorMultiSelectBoxRef();

    drawVectorMultiSelectBox(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      ['v1', 'v2'],
      [],
      boxRef,
      null,
      null,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawVectorMultiSelectStaticBoxMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      node,
      ['v1', 'v2'],
      [],
      boxRef,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
    expect(drawVectorMultiSelectResizeDragBoxMock).not.toHaveBeenCalled();
    expect(drawVectorMultiSelectRotateDragBoxMock).not.toHaveBeenCalled();
  });
});
