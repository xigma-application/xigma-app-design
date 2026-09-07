// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TDrawSceneContext } from '../../types';
import { TFrameNode, TRectangleNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { drawAutoLayoutGapLabel } from '../drawAutoLayoutGapLabel';

const drawValueLabelMock = vi.fn();

vi.mock('utils/canvas/text/drawValueLabel/drawValueLabel', () => ({
  drawValueLabel: (...args: unknown[]): void => drawValueLabelMock(...args),
}));

const context: TDrawSceneContext = {
  buffer: {} as WebGLBuffer,
  canvasHeight: 200,
  canvasWidth: 200,
  gl: {} as WebGL2RenderingContext,
  imageContext: {} as never,
  program: {} as WebGLProgram,
  viewport: { x: 0, y: 0, zoom: 1 },
};

const frame: TFrameNode = {
  childIds: [],
  clipContent: true,
  fill: '#fff',
  height: 200,
  horizontalGap: 30,
  id: 'frame-1',
  layoutMode: LayoutMode.horizontal,
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  verticalGap: 12,
  width: 300,
  x: 0,
  y: 0,
};

describe('drawAutoLayoutGapLabel', () => {
  beforeEach(() => {
    drawValueLabelMock.mockClear();
  });

  it('should draw the horizontal gap value while a horizontal-axis drag is active', () => {
    // mock
    const refs = createCanvasRefs();

    refs.transform.autoLayoutGapDragRef.current = {
      axis: 'horizontal',
      frameId: 'frame-1',
      originalGapValue: 30,
      point: { x: 65, y: 25 },
      pointerStart: { x: 65, y: 25 },
    };

    // before
    drawAutoLayoutGapLabel(context, refs, { 'frame-1': frame });

    // result
    expect(drawValueLabelMock).toHaveBeenCalledWith(
      context.gl,
      context.program,
      context.buffer,
      context.imageContext,
      '30',
      { x: 65, y: 25 },
      { x: 1, y: -1 },
      context.canvasWidth,
      context.canvasHeight,
      context.viewport,
    );
  });

  it('should draw the vertical gap value while hovering a vertical-axis handle', () => {
    // mock
    const refs = createCanvasRefs();

    refs.hover.hoveredAutoLayoutGapRef.current = { axis: 'vertical', frameId: 'frame-1', point: { x: 25, y: 65 } };

    // before
    drawAutoLayoutGapLabel(context, refs, { 'frame-1': frame });

    // result
    expect(drawValueLabelMock).toHaveBeenCalledWith(
      context.gl,
      context.program,
      context.buffer,
      context.imageContext,
      '12',
      { x: 25, y: 65 },
      { x: 1, y: -1 },
      context.canvasWidth,
      context.canvasHeight,
      context.viewport,
    );
  });

  it('should default an unset vertical gap value to 0', () => {
    // mock
    const refs = createCanvasRefs();
    const frameWithoutGap = { ...frame, verticalGap: undefined };

    refs.hover.hoveredAutoLayoutGapRef.current = { axis: 'vertical', frameId: 'frame-1', point: { x: 25, y: 65 } };

    // before
    drawAutoLayoutGapLabel(context, refs, { 'frame-1': frameWithoutGap });

    // result
    expect(drawValueLabelMock).toHaveBeenCalledWith(
      context.gl,
      context.program,
      context.buffer,
      context.imageContext,
      '0',
      { x: 25, y: 65 },
      { x: 1, y: -1 },
      context.canvasWidth,
      context.canvasHeight,
      context.viewport,
    );
  });

  it('should default an unset horizontal gap value to 0', () => {
    // mock
    const refs = createCanvasRefs();
    const frameWithoutGap = { ...frame, horizontalGap: undefined };

    refs.hover.hoveredAutoLayoutGapRef.current = { axis: 'horizontal', frameId: 'frame-1', point: { x: 65, y: 25 } };

    // before
    drawAutoLayoutGapLabel(context, refs, { 'frame-1': frameWithoutGap });

    // result
    expect(drawValueLabelMock).toHaveBeenCalledWith(
      context.gl,
      context.program,
      context.buffer,
      context.imageContext,
      '0',
      { x: 65, y: 25 },
      { x: 1, y: -1 },
      context.canvasWidth,
      context.canvasHeight,
      context.viewport,
    );
  });

  it('should draw nothing when neither a drag nor a hover is active', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    drawAutoLayoutGapLabel(context, refs, { 'frame-1': frame });

    // result
    expect(drawValueLabelMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when the referenced frame no longer exists', () => {
    // mock
    const refs = createCanvasRefs();

    refs.hover.hoveredAutoLayoutGapRef.current = { axis: 'horizontal', frameId: 'missing', point: { x: 0, y: 0 } };

    // before
    drawAutoLayoutGapLabel(context, refs, {});

    // result
    expect(drawValueLabelMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when the referenced node is not a frame', () => {
    // mock
    const refs = createCanvasRefs();
    const rectangle: TRectangleNode = {
      fill: '#000',
      height: 50,
      id: 'frame-1',
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 50,
      x: 0,
      y: 0,
    };

    refs.hover.hoveredAutoLayoutGapRef.current = { axis: 'horizontal', frameId: 'frame-1', point: { x: 0, y: 0 } };

    // before
    drawAutoLayoutGapLabel(context, refs, { 'frame-1': rectangle });

    // result
    expect(drawValueLabelMock).not.toHaveBeenCalled();
  });
});
