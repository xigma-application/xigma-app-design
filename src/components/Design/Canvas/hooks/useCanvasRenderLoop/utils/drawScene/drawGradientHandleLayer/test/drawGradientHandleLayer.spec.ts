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
const drawGradientAddStopPreviewMock = vi.fn();
const drawGradientRotateAngleLabelMock = vi.fn();

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
vi.mock('../drawGradientAddStopPreview', () => ({
  drawGradientAddStopPreview: (...args: unknown[]): void => drawGradientAddStopPreviewMock(...args),
}));
vi.mock('../drawGradientRotateAngleLabel', () => ({
  drawGradientRotateAngleLabel: (...args: unknown[]): void => drawGradientRotateAngleLabelMock(...args),
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
    drawGradientAddStopPreviewMock.mockClear();
    drawGradientRotateAngleLabelMock.mockClear();
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

  it('should not draw the add-stop preview when the line is not hovered', () => {
    // before
    drawGradientHandleLayer(CONTEXT, [rectangle()], { nodeId: 'rect-1', paintIndex: 0, selectedStopIndex: null }, createCanvasRefs());

    // result
    expect(drawGradientAddStopPreviewMock).not.toHaveBeenCalled();
  });

  it('should draw the add-stop preview above the line, at the interpolated gradient color there, with its value label', () => {
    // before
    const refs = createCanvasRefs();

    refs.hover.hoveredGradientLinePositionRef.current = 0.5;

    drawGradientHandleLayer(CONTEXT, [rectangle()], { nodeId: 'rect-1', paintIndex: 0, selectedStopIndex: null }, refs);

    // result — line runs world (0,50) -> (100,50); 0.5 lands at (50, 50), offset up by 18 (zoom 1) -> (50, 32)
    expect(drawGradientAddStopPreviewMock).toHaveBeenCalledTimes(1);

    const [, , , previewPosition, color] = drawGradientAddStopPreviewMock.mock.calls[0];

    expect(previewPosition).toEqual({ x: 50, y: 32 });
    // rectangle()'s stops are white (0%) and black (100%); the midpoint blends to mid-gray
    expect(color).toBe('#808080');

    const [, , labelPosition] = drawGradientStopValueLabelMock.mock.calls[0];

    expect(labelPosition).toBe(0.5);
  });

  it('should not draw the add-stop preview while an existing stop is hovered or dragged, even if the line position ref is set', () => {
    // before
    const refs = createCanvasRefs();

    refs.hover.hoveredGradientLinePositionRef.current = 0.5;
    refs.hover.hoveredGradientStopIndexRef.current = 1;

    drawGradientHandleLayer(CONTEXT, [rectangle()], { nodeId: 'rect-1', paintIndex: 0, selectedStopIndex: null }, refs);

    // result
    expect(drawGradientAddStopPreviewMock).not.toHaveBeenCalled();
  });

  it('should not draw the rotate angle label when no endpoint is hovered or dragged', () => {
    // before
    drawGradientHandleLayer(CONTEXT, [rectangle()], { nodeId: 'rect-1', paintIndex: 0, selectedStopIndex: null }, createCanvasRefs());

    // result
    expect(drawGradientRotateAngleLabelMock).not.toHaveBeenCalled();
  });

  it('should draw the rotate angle label at the hovered endpoint pointer position', () => {
    // before
    const refs = createCanvasRefs();

    refs.hover.hoveredGradientRotateEndpointRef.current = { endpoint: 'start', pointerPosition: { x: 20, y: 30 } };

    drawGradientHandleLayer(CONTEXT, [rectangle()], { nodeId: 'rect-1', paintIndex: 0, selectedStopIndex: null }, refs);

    // result
    expect(drawGradientRotateAngleLabelMock).toHaveBeenCalledTimes(1);

    const [, pointerPosition] = drawGradientRotateAngleLabelMock.mock.calls[0];

    expect(pointerPosition).toEqual({ x: 20, y: 30 });
  });

  it('should draw the rotate angle label from the drag state, taking priority over the hover ref', () => {
    // before
    const refs = createCanvasRefs();

    refs.hover.hoveredGradientRotateEndpointRef.current = { endpoint: 'start', pointerPosition: { x: 20, y: 30 } };
    refs.gradientRotate.gradientRotateDragRef.current = {
      draggedEndpoint: 'end',
      nodeId: 'rect-1',
      paintIndex: 0,
      pointerPosition: { x: 40, y: 60 },
    };

    drawGradientHandleLayer(CONTEXT, [rectangle()], { nodeId: 'rect-1', paintIndex: 0, selectedStopIndex: null }, refs);

    // result
    const [, pointerPosition] = drawGradientRotateAngleLabelMock.mock.calls[0];

    expect(pointerPosition).toEqual({ x: 40, y: 60 });
  });

  it('should ignore a rotate drag ref belonging to a different node or paint index', () => {
    // before
    const refs = createCanvasRefs();

    refs.gradientRotate.gradientRotateDragRef.current = {
      draggedEndpoint: 'start',
      nodeId: 'other-node',
      paintIndex: 0,
      pointerPosition: { x: 40, y: 60 },
    };

    drawGradientHandleLayer(CONTEXT, [rectangle()], { nodeId: 'rect-1', paintIndex: 0, selectedStopIndex: null }, refs);

    // result
    expect(drawGradientRotateAngleLabelMock).not.toHaveBeenCalled();
  });
});
