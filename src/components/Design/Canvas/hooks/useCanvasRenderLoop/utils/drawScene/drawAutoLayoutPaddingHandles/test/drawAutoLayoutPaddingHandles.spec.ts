// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TDrawSceneContext } from '../../types';
import { TFrameNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { drawAutoLayoutPaddingHandles } from '../drawAutoLayoutPaddingHandles';

const getAutoLayoutFrameCenterMock = vi.fn();
const getAutoLayoutPaddingHandlesMock = vi.fn();
const drawAutoLayoutPaddingGuideLineMock = vi.fn();
const drawAutoLayoutPaddingHandleBarMock = vi.fn();
const drawAutoLayoutPaddingHatchFillMock = vi.fn();
const drawAutoLayoutPaddingLabelMock = vi.fn();

vi.mock('store/design/utils/autoLayout/getAutoLayoutFrameCenter', () => ({
  getAutoLayoutFrameCenter: (...args: unknown[]): unknown => getAutoLayoutFrameCenterMock(...args),
}));
vi.mock('utils/canvas/autoLayoutPadding/getAutoLayoutPaddingHandles', () => ({
  getAutoLayoutPaddingHandles: (...args: unknown[]): unknown => getAutoLayoutPaddingHandlesMock(...args),
}));
vi.mock('../drawAutoLayoutPaddingGuideLine', () => ({
  drawAutoLayoutPaddingGuideLine: (...args: unknown[]): void => drawAutoLayoutPaddingGuideLineMock(...args),
}));
vi.mock('../drawAutoLayoutPaddingHandleBar', () => ({
  drawAutoLayoutPaddingHandleBar: (...args: unknown[]): void => drawAutoLayoutPaddingHandleBarMock(...args),
}));
vi.mock('../drawAutoLayoutPaddingHatchFill', () => ({
  drawAutoLayoutPaddingHatchFill: (...args: unknown[]): void => drawAutoLayoutPaddingHatchFillMock(...args),
}));
vi.mock('../drawAutoLayoutPaddingLabel', () => ({
  drawAutoLayoutPaddingLabel: (...args: unknown[]): void => drawAutoLayoutPaddingLabelMock(...args),
}));

const context = {} as TDrawSceneContext;
const frameCenter = { x: 150, y: 100 };

const handles = {
  bottom: { band: { height: 0, width: 300, x: 0, y: 200 }, handleCenter: { x: 150, y: 170 }, side: 'bottom', value: 0 },
  left: { band: { height: 200, width: 20, x: 0, y: 0 }, handleCenter: { x: 10, y: 100 }, side: 'left', value: 20 },
  right: { band: { height: 200, width: 0, x: 300, y: 0 }, handleCenter: { x: 270, y: 100 }, side: 'right', value: 0 },
  top: { band: { height: 0, width: 300, x: 0, y: 0 }, handleCenter: { x: 150, y: 30 }, side: 'top', value: 0 },
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
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 300,
  x: 0,
  y: 0,
};

const nodesById = { 'frame-1': frame };

describe('drawAutoLayoutPaddingHandles', () => {
  beforeEach(() => {
    getAutoLayoutFrameCenterMock.mockReset().mockReturnValue(frameCenter);
    getAutoLayoutPaddingHandlesMock.mockReset().mockReturnValue(handles);
    drawAutoLayoutPaddingGuideLineMock.mockClear();
    drawAutoLayoutPaddingHandleBarMock.mockClear();
    drawAutoLayoutPaddingHatchFillMock.mockClear();
    drawAutoLayoutPaddingLabelMock.mockClear();
  });

  it('should draw only the label when nothing is selected', () => {
    // before
    drawAutoLayoutPaddingHandles(context, [], createCanvasRefs(), nodesById);

    // result
    expect(drawAutoLayoutPaddingHandleBarMock).not.toHaveBeenCalled();
    expect(drawAutoLayoutPaddingLabelMock).toHaveBeenCalledWith(context, expect.anything(), nodesById);
  });

  it('should draw only the label when the frame is selected but the pointer is outside it and no drag is active', () => {
    // before
    drawAutoLayoutPaddingHandles(context, [frame], createCanvasRefs(), nodesById);

    // result
    expect(drawAutoLayoutPaddingHandleBarMock).not.toHaveBeenCalled();
  });

  it('should always show the bar for a padded side, without needing that specific handle hovered', () => {
    // mock
    const refs = createCanvasRefs();

    refs.hover.isAutoLayoutPaddingAreaHoveredRef.current = true;

    // before
    drawAutoLayoutPaddingHandles(context, [frame], refs, nodesById);

    // result
    expect(drawAutoLayoutPaddingHandleBarMock).toHaveBeenCalledWith(context, handles.left.handleCenter, 'left', frameCenter, 0);
  });

  it('should not show a padded side’s hatch fill just from the frame being hovered elsewhere', () => {
    // mock
    const refs = createCanvasRefs();

    refs.hover.isAutoLayoutPaddingAreaHoveredRef.current = true;

    // before — pointer is somewhere in the frame, but not inside the left band itself
    drawAutoLayoutPaddingHandles(context, [frame], refs, nodesById);

    // result
    expect(drawAutoLayoutPaddingHatchFillMock).not.toHaveBeenCalled();
  });

  it('should show a padded side’s hatch fill once the pointer actually enters that side’s own padding band', () => {
    // mock
    const refs = createCanvasRefs();

    refs.hover.isAutoLayoutPaddingAreaHoveredRef.current = true;
    refs.hover.hoveredAutoLayoutPaddingBandsRef.current = ['left'];

    // before
    drawAutoLayoutPaddingHandles(context, [frame], refs, nodesById);

    // result
    expect(drawAutoLayoutPaddingHandleBarMock).toHaveBeenCalledWith(context, handles.left.handleCenter, 'left', frameCenter, 0);
    expect(drawAutoLayoutPaddingHatchFillMock).toHaveBeenCalledWith(context, handles.left.band, frameCenter, 0);
  });

  it('should hide a zero-padding side’s bar unless that specific handle is hovered', () => {
    // mock
    const refs = createCanvasRefs();

    refs.hover.isAutoLayoutPaddingAreaHoveredRef.current = true;

    // before
    drawAutoLayoutPaddingHandles(context, [frame], refs, nodesById);

    // result
    expect(drawAutoLayoutPaddingHandleBarMock).not.toHaveBeenCalledWith(context, handles.right.handleCenter, 'right', frameCenter, 0);
    expect(drawAutoLayoutPaddingHatchFillMock).not.toHaveBeenCalledWith(context, handles.right.band, frameCenter, 0);
  });

  it('should show a zero-padding side’s bar, but no hatch, once that specific handle is hovered', () => {
    // mock
    const refs = createCanvasRefs();

    refs.hover.isAutoLayoutPaddingAreaHoveredRef.current = true;
    refs.hover.hoveredAutoLayoutPaddingRef.current = { frameId: 'frame-1', point: { x: 270, y: 100 }, side: 'right' };

    // before
    drawAutoLayoutPaddingHandles(context, [frame], refs, nodesById);

    // result
    expect(drawAutoLayoutPaddingHandleBarMock).toHaveBeenCalledWith(context, handles.right.handleCenter, 'right', frameCenter, 0);
    expect(drawAutoLayoutPaddingHatchFillMock).not.toHaveBeenCalledWith(context, handles.right.band, frameCenter, 0);
  });

  it('should draw only the guide line for the side being dragged, and pass its side to the handles builder', () => {
    // mock
    const refs = createCanvasRefs();

    refs.transform.autoLayoutPaddingDragRef.current = {
      frameId: 'frame-1',
      hasMoved: true,
      mode: 'delta',
      originalPaddingValue: 20,
      point: { x: 10, y: 100 },
      pointerStart: { x: 10, y: 100 },
      side: 'left',
    };

    // before
    drawAutoLayoutPaddingHandles(context, [frame], refs, nodesById);

    // result
    expect(getAutoLayoutPaddingHandlesMock).toHaveBeenCalledWith(frame, context.viewport, 'left');
    expect(drawAutoLayoutPaddingGuideLineMock).toHaveBeenCalledWith(context, frame, handles.left.band, 'left', frameCenter, 0);
    expect(drawAutoLayoutPaddingHandleBarMock).not.toHaveBeenCalledWith(context, handles.left.handleCenter, 'left', frameCenter, 0);
  });

  it('should keep showing another padded side normally while a different side is being dragged', () => {
    // mock
    const refs = createCanvasRefs();

    refs.transform.autoLayoutPaddingDragRef.current = {
      frameId: 'frame-1',
      hasMoved: true,
      mode: 'absolute',
      originalPaddingValue: 0,
      point: { x: 270, y: 100 },
      pointerStart: { x: 270, y: 100 },
      side: 'right',
    };

    // before
    drawAutoLayoutPaddingHandles(context, [frame], refs, nodesById);

    // result — left still has padding > 0, so it draws normally even though right is being dragged
    expect(drawAutoLayoutPaddingHandleBarMock).toHaveBeenCalledWith(context, handles.left.handleCenter, 'left', frameCenter, 0);
    expect(drawAutoLayoutPaddingGuideLineMock).toHaveBeenCalledWith(context, frame, handles.right.band, 'right', frameCenter, 0);
  });

  it('should draw a guide line for a RightPanel-hovered side, with no bar/hatch and no canvas hover needed', () => {
    // mock
    const refs = createCanvasRefs();

    refs.hover.rightPanelPaddingGuideRef.current = { frameId: 'frame-1', sides: ['left'] };

    // before
    drawAutoLayoutPaddingHandles(context, [frame], refs, nodesById);

    // result
    expect(drawAutoLayoutPaddingGuideLineMock).toHaveBeenCalledWith(context, frame, handles.left.band, 'left', frameCenter, 0);
    expect(drawAutoLayoutPaddingHandleBarMock).not.toHaveBeenCalled();
    expect(drawAutoLayoutPaddingHatchFillMock).not.toHaveBeenCalled();
  });

  it('should draw a guide line for every side named by a merged RightPanel field', () => {
    // mock
    const refs = createCanvasRefs();

    refs.hover.rightPanelPaddingGuideRef.current = { frameId: 'frame-1', sides: ['left', 'right'] };

    // before
    drawAutoLayoutPaddingHandles(context, [frame], refs, nodesById);

    // result
    expect(drawAutoLayoutPaddingGuideLineMock).toHaveBeenCalledWith(context, frame, handles.left.band, 'left', frameCenter, 0);
    expect(drawAutoLayoutPaddingGuideLineMock).toHaveBeenCalledWith(context, frame, handles.right.band, 'right', frameCenter, 0);
  });

  it('should not draw a RightPanel guide line for a different frame’s stashed hover', () => {
    // mock
    const refs = createCanvasRefs();

    refs.hover.rightPanelPaddingGuideRef.current = { frameId: 'frame-2', sides: ['left'] };

    // before
    drawAutoLayoutPaddingHandles(context, [frame], refs, nodesById);

    // result
    expect(drawAutoLayoutPaddingGuideLineMock).not.toHaveBeenCalled();
  });

  it('should not draw a RightPanel guide line while a real canvas drag is active', () => {
    // mock
    const refs = createCanvasRefs();

    refs.hover.rightPanelPaddingGuideRef.current = { frameId: 'frame-1', sides: ['right'] };
    refs.transform.autoLayoutPaddingDragRef.current = {
      frameId: 'frame-1',
      hasMoved: true,
      mode: 'delta',
      originalPaddingValue: 20,
      point: { x: 10, y: 100 },
      pointerStart: { x: 10, y: 100 },
      side: 'left',
    };

    // before
    drawAutoLayoutPaddingHandles(context, [frame], refs, nodesById);

    // result — only the real drag's own guide line draws, not the stashed RightPanel one
    expect(drawAutoLayoutPaddingGuideLineMock).toHaveBeenCalledTimes(1);
    expect(drawAutoLayoutPaddingGuideLineMock).toHaveBeenCalledWith(context, frame, handles.left.band, 'left', frameCenter, 0);
  });

  it('should draw only the guide line for a side whose value popup is open, and pass its side to the handles builder', () => {
    // mock
    const refs = createCanvasRefs();

    refs.transform.autoLayoutPaddingEditRef.current = { frameId: 'frame-1', point: { x: 10, y: 100 }, side: 'left' };

    // before
    drawAutoLayoutPaddingHandles(context, [frame], refs, nodesById);

    // result
    expect(getAutoLayoutPaddingHandlesMock).toHaveBeenCalledWith(frame, context.viewport, 'left');
    expect(drawAutoLayoutPaddingGuideLineMock).toHaveBeenCalledWith(context, frame, handles.left.band, 'left', frameCenter, 0);
    expect(drawAutoLayoutPaddingHandleBarMock).not.toHaveBeenCalledWith(context, handles.left.handleCenter, 'left', frameCenter, 0);
  });

  it('should ignore a value popup open for a different frame', () => {
    // mock
    const refs = createCanvasRefs();

    refs.transform.autoLayoutPaddingEditRef.current = { frameId: 'frame-2', point: { x: 10, y: 100 }, side: 'left' };

    // before
    drawAutoLayoutPaddingHandles(context, [frame], refs, nodesById);

    // result
    expect(getAutoLayoutPaddingHandlesMock).toHaveBeenCalledWith(frame, context.viewport, null);
    expect(drawAutoLayoutPaddingHandleBarMock).not.toHaveBeenCalled();
  });

  it('should always draw the label', () => {
    // before
    drawAutoLayoutPaddingHandles(context, [frame], createCanvasRefs(), nodesById);

    // result
    expect(drawAutoLayoutPaddingLabelMock).toHaveBeenCalledWith(context, expect.anything(), nodesById);
  });
});
