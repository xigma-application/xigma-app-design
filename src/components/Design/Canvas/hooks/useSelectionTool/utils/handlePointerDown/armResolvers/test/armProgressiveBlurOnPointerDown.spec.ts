// store
import { setOpenPropertyPanel } from 'store/design/slice';
import { store } from 'store';

// types
import { EffectBlurType, EffectType, NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { armProgressiveBlurOnPointerDown } from '../armProgressiveBlurOnPointerDown';
import { createEffect } from 'utils/design/effects/createEffect';

const armProgressiveBlurDragMock = vi.fn();

vi.mock('../../armProgressiveBlurDrag', () => ({
  armProgressiveBlurDrag: (...args: unknown[]): void => armProgressiveBlurDragMock(...args),
}));

const rectangle: TRectangleNode = {
  effects: [{ ...createEffect(EffectType.layerBlur), blurType: EffectBlurType.progressive }],
  fills: [],
  height: 100,
  id: 'rect-1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 100,
  x: 0,
  y: 0,
};
const canvas = {} as HTMLCanvasElement;
const event = {} as PointerEvent;
const canvasRefs = { progressiveBlur: { dragRef: { current: null } } };

const run = (x: number, y: number): true | undefined =>
  armProgressiveBlurOnPointerDown({
    canvas,
    canvasRefs,
    event,
    point: { x, y },
    selectedNodes: [rectangle],
    viewport: { x: 0, y: 0, zoom: 1 },
  } as never);

describe('armProgressiveBlurOnPointerDown', () => {
  beforeEach(() => {
    armProgressiveBlurDragMock.mockClear();
    store.dispatch(setOpenPropertyPanel(null));
  });

  it('should arm the drag on the start handle when its panel is open', () => {
    // mock
    store.dispatch(setOpenPropertyPanel({ index: 0, nodeId: 'rect-1', property: 'effects' }));

    // action
    const result = run(50, 2);

    // result
    expect(result).toBe(true);
    expect(armProgressiveBlurDragMock).toHaveBeenCalledWith(canvas, event, canvasRefs.progressiveBlur.dragRef, {
      effectIndex: 0,
      endpoint: 'start',
      nodeId: 'rect-1',
    });
  });

  it('should claim nothing when the panel is closed or the press misses both handles', () => {
    // action
    const closed = run(50, 0);

    store.dispatch(setOpenPropertyPanel({ index: 0, nodeId: 'rect-1', property: 'effects' }));

    const missed = run(20, 50);

    // result
    expect(closed).toBeUndefined();
    expect(missed).toBeUndefined();
    expect(armProgressiveBlurDragMock).not.toHaveBeenCalled();
  });
});
