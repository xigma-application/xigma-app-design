// store
import { setSelection } from 'store/design/slice';

// utils
import { armGroupChildToggleOnPointerDown } from '../armGroupChildToggleOnPointerDown';

const childHitMock = vi.fn();
const armDragMock = vi.fn();

vi.mock('../../getGroupChildHitAtPoint', () => ({ getGroupChildHitAtPoint: (...args: unknown[]): unknown => childHitMock(...args) }));
vi.mock('../../armDrag/armDrag', () => ({ armDrag: (...args: unknown[]): unknown => armDragMock(...args) }));

const context = (ctrlKey: boolean, shiftKey: boolean): Record<string, unknown> => ({
  canvas: { setPointerCapture: vi.fn() },
  canvasRefs: 'refs',
  currentSelection: ['a', 'child'],
  dispatch: vi.fn(),
  event: { ctrlKey, metaKey: false, pointerId: 7, shiftKey },
  point: { x: 1, y: 2 },
  selectionRefs: { dragStateRef: 'dragRef' },
  viewport: 'viewport',
});

describe('armGroupChildToggleOnPointerDown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    childHitMock.mockReturnValue({ id: 'child' });
  });

  it('should select the child under a Control press and arm dragging it', () => {
    // mock
    const ctx = context(true, false);

    // before
    const result = armGroupChildToggleOnPointerDown(ctx as never);

    // result
    expect(result).toBe(true);
    expect(childHitMock).toHaveBeenCalledWith({ x: 1, y: 2 }, 'viewport');
    expect(ctx.dispatch).toHaveBeenCalledWith(setSelection(['child']));
    expect(armDragMock).toHaveBeenCalledWith(['child'], null, { x: 1, y: 2 }, 'dragRef', 'refs');
    expect((ctx.canvas as { setPointerCapture: TFunc }).setPointerCapture).toHaveBeenCalledWith(7);
  });

  it('should toggle the child in the selection with Shift held, without dragging', () => {
    // mock
    const ctx = context(true, true);

    // before
    armGroupChildToggleOnPointerDown(ctx as never);

    // result
    expect(ctx.dispatch).toHaveBeenCalledWith(setSelection(['a']));
    expect(armDragMock).not.toHaveBeenCalled();
  });

  it('should leave the pointer alone without Control or without a child under it', () => {
    // mock
    childHitMock.mockReturnValue(null);

    // result
    expect(armGroupChildToggleOnPointerDown(context(false, false) as never)).toBeUndefined();
    expect(armGroupChildToggleOnPointerDown(context(true, false) as never)).toBeUndefined();
  });
});
