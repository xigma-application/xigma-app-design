// store
import { RootState } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TVectorWidthPointHandleHit } from '../../../../../../../utils/getVectorWidthPointHandleAtPoint';

// utils
import { armVectorWidthHandleGrab } from '../armVectorWidthHandleGrab';

const groupTargetsMock = vi.fn();

vi.mock('utils/canvas/createCursorRotator/getRotatedCursorUrl', () => ({
  getRotatedCursorUrl: (_name: string, angle: number): string | null => (angle ? `cursor-${angle}` : null),
}));
vi.mock('../../../../../../../utils/getVectorWidthPointGroupDragTargets', () => ({
  getVectorWidthPointGroupDragTargets: (...args: unknown[]): unknown => groupTargetsMock(...args),
}));

const state = { design: { activePageId: 'p', pages: { p: { nodes: {} } } } } as unknown as RootState;
const point = { id: 'p1', leftOffset: 2, position: 0.5, rightOffset: 3 };

const createCanvas = (): HTMLCanvasElement => ({ setPointerCapture: vi.fn(), style: { cursor: 'old' } }) as unknown as HTMLCanvasElement;
const refs = (selected: unknown[]): TCanvasRefs =>
  ({
    vectorEdit: { lastVectorWidthHandleSideRef: { current: null }, selectedVectorWidthHandlesRef: { current: selected } },
    vectorWidth: { vectorWidthPointDragRef: { current: null } },
  }) as unknown as TCanvasRefs;
const hit = (target: string, angle = 30): TVectorWidthPointHandleHit =>
  ({ angle, nodeId: 'v', point, target }) as unknown as TVectorWidthPointHandleHit;

describe('armVectorWidthHandleGrab', () => {
  it('should grab a side handle with the other selected sides and show a rotated resize cursor', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = refs([]);
    const setClassName = vi.fn();
    groupTargetsMock.mockReturnValue({ groupTargets: ['t'], selection: ['sel'] });

    // before
    const result = armVectorWidthHandleGrab(
      canvas,
      canvasRefs,
      { pointerId: 4 } as PointerEvent,
      { x: 1, y: 2 },
      setClassName,
      state,
      hit('left'),
    );

    // result
    expect(result).toBe(true);
    expect(canvasRefs.vectorWidth.vectorWidthPointDragRef.current).toEqual({
      armMagnitude: 2,
      armWorldPoint: { x: 1, y: 2 },
      groupTargets: ['t'],
      isNewPoint: false,
      nodeId: 'v',
      point,
      target: 'left',
    });
    expect(canvasRefs.vectorEdit.selectedVectorWidthHandlesRef.current).toEqual(['sel']);
    expect(canvasRefs.vectorEdit.lastVectorWidthHandleSideRef.current).toEqual({ nodeId: 'v', pointId: 'p1', side: 'left' });
    expect(canvas.style.cursor).toBe('cursor-30');
    expect(setClassName).toHaveBeenCalledWith(null);
  });

  it('should fall back to the default cursor when no rotated cursor is available', () => {
    // mock
    const canvas = createCanvas();

    // before
    armVectorWidthHandleGrab(canvas, refs([]), { pointerId: 4 } as PointerEvent, { x: 1, y: 2 }, vi.fn(), state, hit('right', 0));

    // result
    expect(canvas.style.cursor).toBe('');
  });

  it('should grab a point handle, selecting it unless it is already selected', () => {
    // mock
    const canvas = createCanvas();
    const setClassName = vi.fn();
    const fresh = refs([]);
    const alreadySelected = refs([
      { nodeId: 'v', pointId: 'p1', side: 'point' },
      { nodeId: 'v', pointId: 'p2', side: 'left' },
    ]);
    groupTargetsMock.mockClear();

    // before
    armVectorWidthHandleGrab(canvas, fresh, { pointerId: 4 } as PointerEvent, { x: 1, y: 2 }, setClassName, state, hit('point'));
    armVectorWidthHandleGrab(canvas, alreadySelected, { pointerId: 4 } as PointerEvent, { x: 1, y: 2 }, setClassName, state, hit('point'));

    // result
    expect(groupTargetsMock).not.toHaveBeenCalled();
    expect(fresh.vectorWidth.vectorWidthPointDragRef.current).toMatchObject({ armMagnitude: 3, groupTargets: [] });
    expect(fresh.vectorEdit.selectedVectorWidthHandlesRef.current).toEqual([{ nodeId: 'v', pointId: 'p1', side: 'point' }]);
    expect(alreadySelected.vectorEdit.selectedVectorWidthHandlesRef.current).toHaveLength(2);
    expect(canvas.style.cursor).toBe('');
    expect(setClassName).toHaveBeenCalledWith('controller');
  });

  it('should do nothing without a hit', () => {
    // result
    expect(armVectorWidthHandleGrab(createCanvas(), refs([]), {} as PointerEvent, { x: 0, y: 0 }, vi.fn(), state, null)).toBeUndefined();
  });
});
