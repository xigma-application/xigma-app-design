// store
import { RootState } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TVectorNode } from 'types/design/types';

// utils
import { armVectorWidthPointCreate } from '../armVectorWidthPointCreate';

const strokeHitMock = vi.fn();
const cursorMock = vi.fn();

vi.mock('@reduxjs/toolkit', async (importOriginal) => ({ ...(await importOriginal<object>()), nanoid: (): string => 'new-id' }));
vi.mock('../../../../../../../utils/getVectorCutHitAcrossOpenNodes', () => ({
  getVectorCutHitAcrossOpenNodes: (...args: unknown[]): unknown => strokeHitMock(...args),
}));
vi.mock('utils/canvas/vectorNetwork/getVectorChainOrder/getVectorChainOrder', () => ({ getVectorChainOrder: (): string => 'order' }));
vi.mock('utils/canvas/vectorNetwork/getVectorChainFractionAtPosition', () => ({ getVectorChainFractionAtPosition: (): number => 0.4 }));
vi.mock('utils/canvas/vectorNetwork/getVectorSegmentNormalAtT', () => ({ getVectorSegmentNormalAtT: (): unknown => ({ x: 0, y: 1 }) }));
vi.mock('utils/canvas/createCursorRotator/getRotatedCursorUrl', () => ({
  getRotatedCursorUrl: (...args: unknown[]): unknown => cursorMock(...args),
}));

const state = { design: { activePageId: 'p', pages: { p: { nodes: {} } } } } as unknown as RootState;
const viewport = { x: 0, y: 0, zoom: 1 };
const createCanvas = (): HTMLCanvasElement => ({ setPointerCapture: vi.fn(), style: { cursor: 'old' } }) as unknown as HTMLCanvasElement;
const refs = (): TCanvasRefs =>
  ({
    vectorEdit: { lastVectorWidthHandleSideRef: { current: null }, selectedVectorWidthHandlesRef: { current: [] } },
    vectorWidth: { vectorWidthPointDragRef: { current: null } },
  }) as unknown as TCanvasRefs;

describe('armVectorWidthPointCreate', () => {
  it('should create a width point where the stroke is pressed and start dragging its right side', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = refs();
    const setClassName = vi.fn();
    strokeHitMock.mockReturnValue({ hit: { segmentId: 's1', t: 0.5 }, node: { id: 'v', segments: { s1: {} }, strokeWidth: 8 } });
    cursorMock.mockReturnValue('cursor');

    // before
    const result = armVectorWidthPointCreate(
      canvas,
      canvasRefs,
      { pointerId: 2 } as PointerEvent,
      { x: 1, y: 2 },
      setClassName,
      state,
      [{ id: 'v' } as TVectorNode],
      viewport,
    );

    // result
    expect(result).toBe(true);
    expect(canvasRefs.vectorWidth.vectorWidthPointDragRef.current).toEqual({
      armMagnitude: 4,
      armWorldPoint: { x: 1, y: 2 },
      groupTargets: [],
      isNewPoint: true,
      nodeId: 'v',
      point: { id: 'new-id', leftOffset: 4, position: 0.4, rightOffset: 4 },
      target: 'right',
    });
    expect(canvasRefs.vectorEdit.selectedVectorWidthHandlesRef.current).toHaveLength(3);
    expect(canvasRefs.vectorEdit.lastVectorWidthHandleSideRef.current).toEqual({ nodeId: 'v', pointId: 'new-id', side: 'right' });
    expect(canvas.style.cursor).toBe('cursor');
    expect(setClassName).toHaveBeenCalledWith(null);
  });

  it('should fall back to the default cursor, and do nothing off the stroke', () => {
    // mock
    const canvas = createCanvas();
    strokeHitMock
      .mockReturnValueOnce({ hit: { segmentId: 's1', t: 0.5 }, node: { id: 'v', segments: { s1: {} }, strokeWidth: 8 } })
      .mockReturnValueOnce(null);
    cursorMock.mockReturnValue(null);

    // before
    armVectorWidthPointCreate(canvas, refs(), { pointerId: 2 } as PointerEvent, { x: 1, y: 2 }, vi.fn(), state, [], viewport);

    // result
    expect(canvas.style.cursor).toBe('');
    expect(
      armVectorWidthPointCreate(canvas, refs(), { pointerId: 2 } as PointerEvent, { x: 1, y: 2 }, vi.fn(), state, [], viewport),
    ).toBeUndefined();
  });
});
