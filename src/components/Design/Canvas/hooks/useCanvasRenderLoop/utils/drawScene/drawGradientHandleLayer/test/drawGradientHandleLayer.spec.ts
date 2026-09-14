// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { drawGradientHandleLayer } from '../drawGradientHandleLayer';

const drawGradientLineMock = vi.fn();
const drawGradientEndpointHandlesMock = vi.fn();
const drawGradientStopHandlesMock = vi.fn();
const drawGradientStopValueLabelMock = vi.fn();

vi.mock('../drawGradientLine', () => ({
  drawGradientLine: (...args: unknown[]): void => drawGradientLineMock(...args),
}));
vi.mock('../drawGradientEndpointHandles', () => ({
  drawGradientEndpointHandles: (...args: unknown[]): void => drawGradientEndpointHandlesMock(...args),
}));
vi.mock('../drawGradientStopHandles', () => ({
  drawGradientStopHandles: (...args: unknown[]): void => drawGradientStopHandlesMock(...args),
}));
vi.mock('../drawGradientStopValueLabel', () => ({
  drawGradientStopValueLabel: (...args: unknown[]): void => drawGradientStopValueLabelMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const CONTEXT = {
  buffer: {} as WebGLBuffer,
  canvasHeight: 100,
  canvasWidth: 100,
  gl: {} as WebGL2RenderingContext,
  imageContext: {} as never,
  program: {} as WebGLProgram,
  viewport: IDENTITY_VIEWPORT,
};

const rectangle = (overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fills: [
    {
      end: { x: 1, y: 0.5 },
      opacity: 100,
      start: { x: 0, y: 0.5 },
      stops: [
        { color: '#ffffff', opacity: 100, position: 0 },
        { color: '#000000', opacity: 100, position: 1 },
      ],
      type: 'gradient-linear',
    },
  ],
  height: 100,
  id: 'rect-1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 100,
  x: 0,
  y: 0,
  ...overrides,
});

describe('drawGradientHandleLayer', () => {
  beforeEach(() => {
    drawGradientLineMock.mockClear();
    drawGradientEndpointHandlesMock.mockClear();
    drawGradientStopHandlesMock.mockClear();
    drawGradientStopValueLabelMock.mockClear();
  });

  it('should draw nothing when no gradient editor is active', () => {
    // before
    drawGradientHandleLayer(CONTEXT, [rectangle()], null, createCanvasRefs());

    // result
    expect(drawGradientLineMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when the active gradient editor targets a different node', () => {
    // before
    drawGradientHandleLayer(CONTEXT, [rectangle()], { nodeId: 'other', paintIndex: 0, selectedStopIndex: null }, createCanvasRefs());

    // result
    expect(drawGradientLineMock).not.toHaveBeenCalled();
  });

  it('should draw nothing for a multi-node selection', () => {
    // before
    drawGradientHandleLayer(
      CONTEXT,
      [rectangle(), rectangle({ id: 'rect-2' })],
      { nodeId: 'rect-1', paintIndex: 0, selectedStopIndex: null },
      createCanvasRefs(),
    );

    // result
    expect(drawGradientLineMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when the targeted paint is not a linear gradient', () => {
    // before
    const node = rectangle({ fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }] });

    drawGradientHandleLayer(CONTEXT, [node], { nodeId: 'rect-1', paintIndex: 0, selectedStopIndex: null }, createCanvasRefs());

    // result
    expect(drawGradientLineMock).not.toHaveBeenCalled();
  });

  it('should draw the line, endpoint handles, and stop handles for the targeted linear gradient fill', () => {
    // before
    drawGradientHandleLayer(CONTEXT, [rectangle()], { nodeId: 'rect-1', paintIndex: 0, selectedStopIndex: 1 }, createCanvasRefs());

    // result
    expect(drawGradientLineMock).toHaveBeenCalledTimes(1);
    expect(drawGradientEndpointHandlesMock).toHaveBeenCalledTimes(1);
    expect(drawGradientStopHandlesMock).toHaveBeenCalledTimes(1);

    const stopHandlesArgs = drawGradientStopHandlesMock.mock.calls[0];

    expect(stopHandlesArgs[5]).toBe(1);
  });

  it('should not draw a value label when no stop is hovered or dragged', () => {
    // before
    drawGradientHandleLayer(CONTEXT, [rectangle()], { nodeId: 'rect-1', paintIndex: 0, selectedStopIndex: null }, createCanvasRefs());

    // result
    expect(drawGradientStopValueLabelMock).not.toHaveBeenCalled();
  });

  it('should draw a value label for the hovered stop', () => {
    // before
    const refs = createCanvasRefs();

    refs.hover.hoveredGradientStopIndexRef.current = 1;

    drawGradientHandleLayer(CONTEXT, [rectangle()], { nodeId: 'rect-1', paintIndex: 0, selectedStopIndex: null }, refs);

    // result
    expect(drawGradientStopValueLabelMock).toHaveBeenCalledTimes(1);

    const [, , position] = drawGradientStopValueLabelMock.mock.calls[0];

    expect(position).toBe(1);
  });

  it('should draw a value label for the dragged stop, taking priority over the hover ref', () => {
    // before
    const refs = createCanvasRefs();

    refs.hover.hoveredGradientStopIndexRef.current = 0;
    refs.gradientStop.gradientStopDragRef.current = { color: '#ffffff', draggedStopIndex: 0, nodeId: 'rect-1', opacity: 100, paintIndex: 0 };

    drawGradientHandleLayer(CONTEXT, [rectangle()], { nodeId: 'rect-1', paintIndex: 0, selectedStopIndex: null }, refs);

    // result
    expect(drawGradientStopValueLabelMock).toHaveBeenCalledTimes(1);

    const [, , position] = drawGradientStopValueLabelMock.mock.calls[0];

    expect(position).toBe(0);
  });

  it('should ignore a drag ref belonging to a different node or paint index', () => {
    // before
    const refs = createCanvasRefs();

    refs.gradientStop.gradientStopDragRef.current = { color: '#ffffff', draggedStopIndex: 0, nodeId: 'other-node', opacity: 100, paintIndex: 0 };

    drawGradientHandleLayer(CONTEXT, [rectangle()], { nodeId: 'rect-1', paintIndex: 0, selectedStopIndex: null }, refs);

    // result
    expect(drawGradientStopValueLabelMock).not.toHaveBeenCalled();
  });
});
