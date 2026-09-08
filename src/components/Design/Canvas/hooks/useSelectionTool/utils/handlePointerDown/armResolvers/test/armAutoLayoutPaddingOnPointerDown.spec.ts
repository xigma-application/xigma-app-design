// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode } from 'types/design/types';

// utils
import { armAutoLayoutPaddingOnPointerDown } from '../armAutoLayoutPaddingOnPointerDown';

const getAutoLayoutPaddingHandleAtPointMock = vi.fn();
const armAutoLayoutPaddingDragMock = vi.fn();

vi.mock('../../../../../../utils/getAutoLayoutPaddingHandleAtPoint', () => ({
  getAutoLayoutPaddingHandleAtPoint: (...args: unknown[]): unknown => getAutoLayoutPaddingHandleAtPointMock(...args),
}));
vi.mock('../../armAutoLayoutPaddingDrag', () => ({
  armAutoLayoutPaddingDrag: (...args: unknown[]): void => armAutoLayoutPaddingDragMock(...args),
}));

const canvas = {} as HTMLCanvasElement;
const event = {} as PointerEvent;
const canvasRefs = { transform: { autoLayoutPaddingDragRef: { current: null } } };
const point = { x: 20, y: 100 };
const viewport = { x: 0, y: 0, zoom: 1 };

const frame: TFrameNode = {
  childIds: [],
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

describe('armAutoLayoutPaddingOnPointerDown', () => {
  beforeEach(() => {
    getAutoLayoutPaddingHandleAtPointMock.mockReset();
    armAutoLayoutPaddingDragMock.mockClear();
  });

  it('should arm the padding drag with the hit side and value, and return true', () => {
    // mock
    getAutoLayoutPaddingHandleAtPointMock.mockReturnValue({ side: 'left', value: 20 });

    // before
    const result = armAutoLayoutPaddingOnPointerDown({ canvas, canvasRefs, event, point, selectedNodes: [frame], viewport } as never);

    // result
    expect(result).toBe(true);
    expect(armAutoLayoutPaddingDragMock).toHaveBeenCalledWith(
      canvas,
      event,
      canvasRefs.transform.autoLayoutPaddingDragRef,
      'left',
      'frame-1',
      20,
      point,
    );
  });

  it('should return undefined and not arm anything when no padding handle is hit', () => {
    // mock
    getAutoLayoutPaddingHandleAtPointMock.mockReturnValue(null);

    // before
    const result = armAutoLayoutPaddingOnPointerDown({ canvas, canvasRefs, event, point, selectedNodes: [frame], viewport } as never);

    // result
    expect(result).toBeUndefined();
    expect(armAutoLayoutPaddingDragMock).not.toHaveBeenCalled();
  });

  it('should return undefined when nothing is selected', () => {
    // before
    const result = armAutoLayoutPaddingOnPointerDown({ canvas, canvasRefs, event, point, selectedNodes: [], viewport } as never);

    // result
    expect(result).toBeUndefined();
    expect(getAutoLayoutPaddingHandleAtPointMock).not.toHaveBeenCalled();
  });

  it('should return undefined when the selected node is not a frame', () => {
    // before
    const result = armAutoLayoutPaddingOnPointerDown({
      canvas,
      canvasRefs,
      event,
      point,
      selectedNodes: [rectangle],
      viewport,
    } as never);

    // result
    expect(result).toBeUndefined();
    expect(getAutoLayoutPaddingHandleAtPointMock).not.toHaveBeenCalled();
  });

  it('should return undefined when the selected frame is not an auto-layout frame', () => {
    // mock
    const freeFormFrame = { ...frame, layoutMode: LayoutMode.freeForm };

    // before
    const result = armAutoLayoutPaddingOnPointerDown({
      canvas,
      canvasRefs,
      event,
      point,
      selectedNodes: [freeFormFrame],
      viewport,
    } as never);

    // result
    expect(result).toBeUndefined();
    expect(getAutoLayoutPaddingHandleAtPointMock).not.toHaveBeenCalled();
  });
});
