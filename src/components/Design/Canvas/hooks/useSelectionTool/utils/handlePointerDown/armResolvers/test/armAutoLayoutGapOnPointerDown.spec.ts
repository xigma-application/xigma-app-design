// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode } from 'types/design/types';

// utils
import { armAutoLayoutGapOnPointerDown } from '../armAutoLayoutGapOnPointerDown';

const getAutoLayoutGapHandleAtPointMock = vi.fn();
const armAutoLayoutGapDragMock = vi.fn();

vi.mock('../../../../../../utils/getAutoLayoutGapHandleAtPoint', () => ({
  getAutoLayoutGapHandleAtPoint: (...args: unknown[]): unknown => getAutoLayoutGapHandleAtPointMock(...args),
}));
vi.mock('../../armAutoLayoutGapDrag', () => ({
  armAutoLayoutGapDrag: (...args: unknown[]): void => armAutoLayoutGapDragMock(...args),
}));

const canvas = {} as HTMLCanvasElement;
const event = {} as PointerEvent;
const canvasRefs = { transform: { autoLayoutGapDragRef: { current: null } } };
const point = { x: 60, y: 25 };
const viewport = { x: 0, y: 0, zoom: 1 };

const frame: TFrameNode = {
  childIds: ['a', 'b'],
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
  verticalGap: 10,
  width: 300,
  x: 0,
  y: 0,
};

const rectangle: TRectangleNode = {
  fill: '#000',
  height: 50,
  id: 'rect-1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 50,
  x: 0,
  y: 0,
};

describe('armAutoLayoutGapOnPointerDown', () => {
  beforeEach(() => {
    getAutoLayoutGapHandleAtPointMock.mockReset();
    armAutoLayoutGapDragMock.mockClear();
  });

  it('should arm the horizontal-gap drag with the frame’s horizontal gap value and return true', () => {
    // mock
    getAutoLayoutGapHandleAtPointMock.mockReturnValue({ axis: 'horizontal', fillRect: { height: 50, width: 20, x: 50, y: 0 } });

    // before
    const result = armAutoLayoutGapOnPointerDown({ canvas, canvasRefs, event, point, selectedNodes: [frame], viewport } as never);

    // result
    expect(result).toBe(true);
    expect(armAutoLayoutGapDragMock).toHaveBeenCalledWith(
      canvas,
      event,
      canvasRefs.transform.autoLayoutGapDragRef,
      'horizontal',
      'frame-1',
      30,
      point,
    );
  });

  it('should arm the vertical-gap drag with the frame’s vertical gap value', () => {
    // mock
    getAutoLayoutGapHandleAtPointMock.mockReturnValue({ axis: 'vertical', fillRect: { height: 20, width: 120, x: 0, y: 50 } });

    // before
    armAutoLayoutGapOnPointerDown({ canvas, canvasRefs, event, point, selectedNodes: [frame], viewport } as never);

    // result
    expect(armAutoLayoutGapDragMock).toHaveBeenCalledWith(
      canvas,
      event,
      canvasRefs.transform.autoLayoutGapDragRef,
      'vertical',
      'frame-1',
      10,
      point,
    );
  });

  it('should default an unset gap value to 0', () => {
    // mock
    getAutoLayoutGapHandleAtPointMock.mockReturnValue({ axis: 'horizontal', fillRect: { height: 50, width: 20, x: 50, y: 0 } });
    const frameWithoutGap = { ...frame, horizontalGap: undefined };

    // before
    armAutoLayoutGapOnPointerDown({ canvas, canvasRefs, event, point, selectedNodes: [frameWithoutGap], viewport } as never);

    // result
    expect(armAutoLayoutGapDragMock).toHaveBeenCalledWith(
      canvas,
      event,
      canvasRefs.transform.autoLayoutGapDragRef,
      'horizontal',
      'frame-1',
      0,
      point,
    );
  });

  it('should default the vertical gap value to 0 when it is unset', () => {
    // mock
    getAutoLayoutGapHandleAtPointMock.mockReturnValue({ axis: 'vertical', fillRect: { height: 20, width: 120, x: 0, y: 50 } });
    const frameWithoutGap = { ...frame, verticalGap: undefined };

    // before
    armAutoLayoutGapOnPointerDown({ canvas, canvasRefs, event, point, selectedNodes: [frameWithoutGap], viewport } as never);

    // result
    expect(armAutoLayoutGapDragMock).toHaveBeenCalledWith(
      canvas,
      event,
      canvasRefs.transform.autoLayoutGapDragRef,
      'vertical',
      'frame-1',
      0,
      point,
    );
  });

  it('should return undefined and not arm anything when no gap handle is hit', () => {
    // mock
    getAutoLayoutGapHandleAtPointMock.mockReturnValue(null);

    // before
    const result = armAutoLayoutGapOnPointerDown({ canvas, canvasRefs, event, point, selectedNodes: [frame], viewport } as never);

    // result
    expect(result).toBeUndefined();
    expect(armAutoLayoutGapDragMock).not.toHaveBeenCalled();
  });

  it('should return undefined when nothing is selected', () => {
    // before
    const result = armAutoLayoutGapOnPointerDown({ canvas, canvasRefs, event, point, selectedNodes: [], viewport } as never);

    // result
    expect(result).toBeUndefined();
    expect(getAutoLayoutGapHandleAtPointMock).not.toHaveBeenCalled();
  });

  it('should return undefined when the selected node is not a frame', () => {
    // before
    const result = armAutoLayoutGapOnPointerDown({ canvas, canvasRefs, event, point, selectedNodes: [rectangle], viewport } as never);

    // result
    expect(result).toBeUndefined();
    expect(getAutoLayoutGapHandleAtPointMock).not.toHaveBeenCalled();
  });

  it('should return undefined when the selected frame is not an auto-layout frame', () => {
    // mock
    const freeFormFrame = { ...frame, layoutMode: LayoutMode.freeForm };

    // before
    const result = armAutoLayoutGapOnPointerDown({ canvas, canvasRefs, event, point, selectedNodes: [freeFormFrame], viewport } as never);

    // result
    expect(result).toBeUndefined();
    expect(getAutoLayoutGapHandleAtPointMock).not.toHaveBeenCalled();
  });
});
