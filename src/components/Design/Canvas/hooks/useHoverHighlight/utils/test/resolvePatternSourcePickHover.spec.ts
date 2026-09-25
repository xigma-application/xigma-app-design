// types
import { TSceneNode } from 'types/design/types';

// utils
import { resolvePatternSourcePickHover } from '../resolvePatternSourcePickHover';

const groupChildHitMock = vi.fn();
const selectionHitMock = vi.fn();
const hasPatternMock = vi.fn();

vi.mock('../../../useSelectionTool/utils/handlePointerDown/getGroupChildHitAtPoint', () => ({
  getGroupChildHitAtPoint: (...args: unknown[]): unknown => groupChildHitMock(...args),
}));
vi.mock('../../../useSelectionTool/utils/handlePointerDown/getSelectionHitAtPoint/getSelectionHitAtPoint', () => ({
  getSelectionHitAtPoint: (...args: unknown[]): unknown => selectionHitMock(...args),
}));
vi.mock('../../../useSelectionTool/utils/handlePatternSourcePick/doesNodeHavePatternInSubtree', () => ({
  doesNodeHavePatternInSubtree: (...args: unknown[]): unknown => hasPatternMock(...args),
}));
vi.mock('utils/math/pointer/getPointerPosition', () => ({ getPointerPosition: (): unknown => ({ x: 0, y: 0 }) }));

const canvas = document.createElement('canvas');
const pointerEvent = (ctrlKey = false): PointerEvent => ({ ctrlKey, metaKey: false }) as PointerEvent;

describe('resolvePatternSourcePickHover', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hasPatternMock.mockReturnValue(false);
  });

  it('should hover the selectable layer under the pointer', () => {
    // mock
    const hoverRef = { current: null as string | null };
    selectionHitMock.mockReturnValue({ id: 'hit' } as TSceneNode);

    // before
    resolvePatternSourcePickHover(canvas, pointerEvent(), hoverRef);

    // result
    expect(hoverRef.current).toBe('hit');
    expect(groupChildHitMock).not.toHaveBeenCalled();
  });

  it('should reach a group child directly with Control held', () => {
    // mock
    const hoverRef = { current: null as string | null };
    groupChildHitMock.mockReturnValue({ id: 'child' } as TSceneNode);

    // before
    resolvePatternSourcePickHover(canvas, pointerEvent(true), hoverRef);

    // result
    expect(hoverRef.current).toBe('child');
    expect(selectionHitMock).not.toHaveBeenCalled();
  });

  it('should hover nothing over empty space or over a layer that already holds a pattern', () => {
    // mock
    const hoverRef = { current: 'old' as string | null };
    selectionHitMock.mockReturnValueOnce(null).mockReturnValueOnce({ id: 'patterned' });
    groupChildHitMock.mockReturnValue(null);

    // before
    resolvePatternSourcePickHover(canvas, pointerEvent(true), hoverRef);

    // result
    expect(hoverRef.current).toBeNull();

    // mock
    hasPatternMock.mockReturnValue(true);

    // before
    resolvePatternSourcePickHover(canvas, pointerEvent(), hoverRef);

    // result
    expect(hoverRef.current).toBeNull();
  });
});
