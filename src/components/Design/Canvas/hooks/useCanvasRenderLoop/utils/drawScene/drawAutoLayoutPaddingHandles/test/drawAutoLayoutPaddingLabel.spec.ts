// others
import { AUTO_LAYOUT_PADDING_HANDLE_FILL } from 'constant/canvas';

// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TDrawSceneContext } from '../../types';
import { TFrameNode, TRectangleNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { drawAutoLayoutPaddingLabel } from '../drawAutoLayoutPaddingLabel';

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
  id: 'frame-1',
  layoutMode: LayoutMode.horizontal,
  name: 'Frame',
  paddingLeft: 20,
  paddingTop: 12,
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 300,
  x: 0,
  y: 0,
};

describe('drawAutoLayoutPaddingLabel', () => {
  beforeEach(() => {
    drawValueLabelMock.mockClear();
  });

  it('should draw the left padding value while a left-side drag is active', () => {
    // mock
    const refs = createCanvasRefs();

    refs.transform.autoLayoutPaddingDragRef.current = {
      frameId: 'frame-1',
      mode: 'delta',
      originalPaddingValue: 20,
      point: { x: 20, y: 100 },
      pointerStart: { x: 20, y: 100 },
      side: 'left',
    };

    // before
    drawAutoLayoutPaddingLabel(context, refs, { 'frame-1': frame });

    // result
    expect(drawValueLabelMock).toHaveBeenCalledWith(
      context.gl,
      context.program,
      context.buffer,
      context.imageContext,
      '20',
      { x: 20, y: 100 },
      { x: 1, y: -1 },
      context.canvasWidth,
      context.canvasHeight,
      context.viewport,
      { fill: AUTO_LAYOUT_PADDING_HANDLE_FILL },
    );
  });

  it('should draw the top padding value while hovering the top handle', () => {
    // mock
    const refs = createCanvasRefs();

    refs.hover.hoveredAutoLayoutPaddingRef.current = { frameId: 'frame-1', point: { x: 150, y: 12 }, side: 'top' };

    // before
    drawAutoLayoutPaddingLabel(context, refs, { 'frame-1': frame });

    // result
    expect(drawValueLabelMock).toHaveBeenCalledWith(
      context.gl,
      context.program,
      context.buffer,
      context.imageContext,
      '12',
      { x: 150, y: 12 },
      { x: 1, y: -1 },
      context.canvasWidth,
      context.canvasHeight,
      context.viewport,
      { fill: AUTO_LAYOUT_PADDING_HANDLE_FILL },
    );
  });

  it('should default an unset padding value to 0', () => {
    // mock
    const refs = createCanvasRefs();
    const frameWithoutPadding = { ...frame, paddingLeft: undefined };

    refs.hover.hoveredAutoLayoutPaddingRef.current = { frameId: 'frame-1', point: { x: 30, y: 100 }, side: 'left' };

    // before
    drawAutoLayoutPaddingLabel(context, refs, { 'frame-1': frameWithoutPadding });

    // result
    expect(drawValueLabelMock).toHaveBeenCalledWith(
      context.gl,
      context.program,
      context.buffer,
      context.imageContext,
      '0',
      { x: 30, y: 100 },
      { x: 1, y: -1 },
      context.canvasWidth,
      context.canvasHeight,
      context.viewport,
      { fill: AUTO_LAYOUT_PADDING_HANDLE_FILL },
    );
  });

  it('should draw nothing when neither a drag nor a hover is active', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    drawAutoLayoutPaddingLabel(context, refs, { 'frame-1': frame });

    // result
    expect(drawValueLabelMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when the referenced frame no longer exists', () => {
    // mock
    const refs = createCanvasRefs();

    refs.hover.hoveredAutoLayoutPaddingRef.current = { frameId: 'missing', point: { x: 0, y: 0 }, side: 'left' };

    // before
    drawAutoLayoutPaddingLabel(context, refs, {});

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

    refs.hover.hoveredAutoLayoutPaddingRef.current = { frameId: 'frame-1', point: { x: 0, y: 0 }, side: 'left' };

    // before
    drawAutoLayoutPaddingLabel(context, refs, { 'frame-1': rectangle });

    // result
    expect(drawValueLabelMock).not.toHaveBeenCalled();
  });
});
