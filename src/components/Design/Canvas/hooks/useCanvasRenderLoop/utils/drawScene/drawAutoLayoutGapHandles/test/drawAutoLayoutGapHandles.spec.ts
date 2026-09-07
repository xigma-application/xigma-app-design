// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TDrawSceneContext } from '../../types';
import { TFrameNode, TRectangleNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { drawAutoLayoutGapHandles } from '../drawAutoLayoutGapHandles';

const getAutoLayoutFrameCenterMock = vi.fn();
const getAutoLayoutGapHandlesMock = vi.fn();
const drawAutoLayoutGapHandleBarsMock = vi.fn();
const drawAutoLayoutGapHatchFillMock = vi.fn();
const drawAutoLayoutGapLabelMock = vi.fn();
const drawAutoLayoutGapOutlineMock = vi.fn();

vi.mock('store/design/utils/autoLayout/getAutoLayoutFrameCenter', () => ({
  getAutoLayoutFrameCenter: (...args: unknown[]): unknown => getAutoLayoutFrameCenterMock(...args),
}));
vi.mock('store/design/utils/autoLayout/getAutoLayoutGapHandles/getAutoLayoutGapHandles', () => ({
  getAutoLayoutGapHandles: (...args: unknown[]): unknown => getAutoLayoutGapHandlesMock(...args),
}));
vi.mock('../drawAutoLayoutGapHandleBars', () => ({
  drawAutoLayoutGapHandleBars: (...args: unknown[]): void => drawAutoLayoutGapHandleBarsMock(...args),
}));
vi.mock('../drawAutoLayoutGapHatchFill', () => ({
  drawAutoLayoutGapHatchFill: (...args: unknown[]): void => drawAutoLayoutGapHatchFillMock(...args),
}));
vi.mock('../drawAutoLayoutGapLabel', () => ({
  drawAutoLayoutGapLabel: (...args: unknown[]): void => drawAutoLayoutGapLabelMock(...args),
}));
vi.mock('../drawAutoLayoutGapOutline', () => ({
  drawAutoLayoutGapOutline: (...args: unknown[]): void => drawAutoLayoutGapOutlineMock(...args),
}));

const context = {} as TDrawSceneContext;
const frameCenter = { x: 150, y: 100 };
const handles = {
  horizontal: [{ height: 50, width: 20, x: 50, y: 0 }],
  vertical: [{ height: 20, width: 120, x: 0, y: 50 }],
};

const frame: TFrameNode = {
  childIds: ['child-a'],
  clipContent: true,
  fill: '#fff',
  height: 200,
  id: 'frame-1',
  layoutMode: LayoutMode.horizontal,
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 300,
  x: 0,
  y: 0,
};

const childA: TRectangleNode = {
  fill: '#000',
  height: 50,
  id: 'child-a',
  name: 'Rectangle',
  parentId: 'frame-1',
  rotation: 0,
  type: NodeType.rectangle,
  width: 50,
  x: 0,
  y: 0,
};

const nodesById = { 'child-a': childA, 'frame-1': frame };

describe('drawAutoLayoutGapHandles', () => {
  beforeEach(() => {
    getAutoLayoutFrameCenterMock.mockReset().mockReturnValue(frameCenter);
    getAutoLayoutGapHandlesMock.mockReset().mockReturnValue(handles);
    drawAutoLayoutGapHandleBarsMock.mockClear();
    drawAutoLayoutGapHatchFillMock.mockClear();
    drawAutoLayoutGapLabelMock.mockClear();
    drawAutoLayoutGapOutlineMock.mockClear();
  });

  it('should draw only the label when nothing is selected', () => {
    // before
    drawAutoLayoutGapHandles(context, [], createCanvasRefs(), nodesById);

    // result
    expect(drawAutoLayoutGapHandleBarsMock).not.toHaveBeenCalled();
    expect(drawAutoLayoutGapLabelMock).toHaveBeenCalledWith(context, expect.anything(), nodesById);
  });

  it('should draw only the label when the frame is selected but the pointer is outside it and no drag is active', () => {
    // before
    drawAutoLayoutGapHandles(context, [frame], createCanvasRefs(), nodesById);

    // result
    expect(drawAutoLayoutGapHandleBarsMock).not.toHaveBeenCalled();
  });

  it('should draw the bars, but neither hatch nor outline, while inside the frame with no handle hovered or dragged', () => {
    // mock
    const refs = createCanvasRefs();

    refs.hover.isAutoLayoutGapAreaHoveredRef.current = true;

    // before
    drawAutoLayoutGapHandles(context, [frame], refs, nodesById);

    // result
    expect(drawAutoLayoutGapHandleBarsMock).toHaveBeenCalledWith(context, handles, frameCenter, 0);
    expect(drawAutoLayoutGapHatchFillMock).not.toHaveBeenCalled();
    expect(drawAutoLayoutGapOutlineMock).not.toHaveBeenCalled();
  });

  it('should draw a hatch fill over the hovered axis while inside the frame with a handle hovered', () => {
    // mock
    const refs = createCanvasRefs();

    refs.hover.isAutoLayoutGapAreaHoveredRef.current = true;
    refs.hover.hoveredAutoLayoutGapRef.current = { axis: 'horizontal', frameId: 'frame-1', point: { x: 60, y: 25 } };

    // before
    drawAutoLayoutGapHandles(context, [frame], refs, nodesById);

    // result
    expect(drawAutoLayoutGapHatchFillMock).toHaveBeenCalledWith(context, handles.horizontal, frameCenter, 0);
    expect(drawAutoLayoutGapOutlineMock).not.toHaveBeenCalled();
  });

  it('should draw a vertical-axis hatch fill while hovering a vertical handle', () => {
    // mock
    const refs = createCanvasRefs();

    refs.hover.isAutoLayoutGapAreaHoveredRef.current = true;
    refs.hover.hoveredAutoLayoutGapRef.current = { axis: 'vertical', frameId: 'frame-1', point: { x: 25, y: 60 } };

    // before
    drawAutoLayoutGapHandles(context, [frame], refs, nodesById);

    // result
    expect(drawAutoLayoutGapHatchFillMock).toHaveBeenCalledWith(context, handles.vertical, frameCenter, 0);
  });

  it('should draw a horizontal-axis outline while dragging a horizontal handle', () => {
    // mock
    const refs = createCanvasRefs();

    refs.transform.autoLayoutGapDragRef.current = {
      axis: 'horizontal',
      frameId: 'frame-1',
      originalGapValue: 30,
      point: { x: 60, y: 25 },
      pointerStart: { x: 60, y: 25 },
    };

    // before
    drawAutoLayoutGapHandles(context, [frame], refs, nodesById);

    // result
    expect(drawAutoLayoutGapOutlineMock).toHaveBeenCalledWith(context, handles.horizontal, frameCenter, 0);
  });

  it('should draw an outline over the dragged axis, taking priority over any hover, and force the bars visible', () => {
    // mock
    const refs = createCanvasRefs();

    refs.hover.hoveredAutoLayoutGapRef.current = { axis: 'horizontal', frameId: 'frame-1', point: { x: 60, y: 25 } };
    refs.transform.autoLayoutGapDragRef.current = {
      axis: 'vertical',
      frameId: 'frame-1',
      originalGapValue: 10,
      point: { x: 25, y: 60 },
      pointerStart: { x: 25, y: 60 },
    };

    // before
    drawAutoLayoutGapHandles(context, [frame], refs, nodesById);

    // result
    expect(drawAutoLayoutGapHandleBarsMock).toHaveBeenCalledWith(context, handles, frameCenter, 0);
    expect(drawAutoLayoutGapOutlineMock).toHaveBeenCalledWith(context, handles.vertical, frameCenter, 0);
    expect(drawAutoLayoutGapHatchFillMock).not.toHaveBeenCalled();
  });
});
