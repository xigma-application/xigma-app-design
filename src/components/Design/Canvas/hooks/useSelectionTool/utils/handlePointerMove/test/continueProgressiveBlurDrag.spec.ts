import { RefObject } from 'react';

// store
import { addNode, addNodes, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { EffectBlurType, EffectType, NodeType } from 'types/design/enums';
import { TProgressiveBlurDragState } from 'types/design/canvas/types';
import { TRectangleNode, TVectorNode } from 'types/design/types';

// utils
import { continueProgressiveBlurDrag } from '../continueProgressiveBlurDrag';
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { createEffect } from 'utils/design/effects/createEffect';
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });
const createDragRef = (state: TProgressiveBlurDragState | null = null): RefObject<TProgressiveBlurDragState | null> => ({ current: state });

const addRectangle = (blurType = EffectBlurType.progressive, rotation = 0): string => {
  store.dispatch(
    addNode({
      effects: [{ ...createEffect(EffectType.layerBlur), blurType }],
      fills: [],
      height: 100,
      name: 'Rectangle',
      parentId: null,
      rotation,
      type: NodeType.rectangle,
      width: 200,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const readEffect = (nodeId: string): TRectangleNode['effects'] extends (infer T)[] | undefined ? T : never =>
  (store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TRectangleNode).effects![0];

describe('continueProgressiveBlurDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should do nothing when no drag is in progress', () => {
    // mock
    const canvasRefs = createCanvasRefs();

    // action
    continueProgressiveBlurDrag(createCanvas(), pointerEvent(10, 10), store.dispatch, createDragRef(), canvasRefs);

    // result
    expect(canvasRefs.transform.alignmentGuideRef.current).toBeNull();
  });

  it('should move only the dragged endpoint to the normalized pointer position', () => {
    // mock
    const nodeId = addRectangle();
    const dragRef = createDragRef({ effectIndex: 0, endpoint: 'end', nodeId });

    // action — pointer at local (50, 75) of a 200x100 node = (0.25, 0.75), away from every landmark
    continueProgressiveBlurDrag(createCanvas(), pointerEvent(50, 75), store.dispatch, dragRef, createCanvasRefs());

    // result
    expect(readEffect(nodeId).end).toEqual({ x: 0.25, y: 0.75 });
    expect(readEffect(nodeId).start).toBeUndefined();
  });

  it('should snap to the node edges and center and publish a guide while snapped', () => {
    // mock
    const nodeId = addRectangle();
    const canvasRefs = createCanvasRefs();

    // action — 2px off the horizontal center and 1px off the bottom edge
    continueProgressiveBlurDrag(
      createCanvas(),
      pointerEvent(102, 99),
      store.dispatch,
      createDragRef({ effectIndex: 0, endpoint: 'start', nodeId }),
      canvasRefs,
    );

    // result
    expect(readEffect(nodeId).start).toEqual({ x: 0.5, y: 1 });
    expect(canvasRefs.transform.alignmentGuideRef.current).not.toBeNull();
  });

  it('should follow the node rotation', () => {
    // mock
    const nodeId = addRectangle(EffectBlurType.progressive, 90);

    // action — the node center is (100, 50); a pointer 50 above it is where the left-of-center point (x offset -50) sits after a 90 degree rotation
    continueProgressiveBlurDrag(
      createCanvas(),
      pointerEvent(100, 0),
      store.dispatch,
      createDragRef({ effectIndex: 0, endpoint: 'start', nodeId }),
      createCanvasRefs(),
    );

    // result
    expect(readEffect(nodeId).start?.x).toBeCloseTo(0.25, 5);
    expect(readEffect(nodeId).start?.y).toBeCloseTo(0.5, 5);
  });

  it('should ignore an effect that is no longer a progressive layer blur', () => {
    // mock
    const nodeId = addRectangle(EffectBlurType.uniform);

    // action
    continueProgressiveBlurDrag(
      createCanvas(),
      pointerEvent(60, 60),
      store.dispatch,
      createDragRef({ effectIndex: 0, endpoint: 'start', nodeId }),
      createCanvasRefs(),
    );

    // result
    expect(readEffect(nodeId).start).toBeUndefined();
  });

  it('should place the endpoint within the bounds of a vector and leave its other effects alone', () => {
    // mock
    const shadow = createEffect(EffectType.dropShadow);
    const vector = makeSquareVector({
      effects: [shadow, { ...createEffect(EffectType.layerBlur), blurType: EffectBlurType.progressive }],
      id: 'progressiveBlurVector',
    });

    store.dispatch(addNodes({ nodes: [vector], rootIds: [vector.id] }));

    const dragRef = createDragRef({ effectIndex: 1, endpoint: 'end', nodeId: vector.id });

    // action — pointer at (30, 60) of the 100x100 square = (0.3, 0.6)
    continueProgressiveBlurDrag(createCanvas(), pointerEvent(30, 60), store.dispatch, dragRef, createCanvasRefs());

    // result
    const { effects } = selectActivePage(store.getState()).nodes[vector.id] as TVectorNode;

    expect(effects?.[0]).toEqual(shadow);
    expect(effects?.[1].end).toEqual({ x: 0.3, y: 0.6 });
  });

  it('should do nothing for a layer that no longer exists', () => {
    // mock
    const canvasRefs = createCanvasRefs();
    const dragRef = createDragRef({ effectIndex: 0, endpoint: 'end', nodeId: 'missing' });

    // action
    continueProgressiveBlurDrag(createCanvas(), pointerEvent(10, 10), store.dispatch, dragRef, canvasRefs);

    // result
    expect(canvasRefs.transform.alignmentGuideRef.current).toBeNull();
  });
});
