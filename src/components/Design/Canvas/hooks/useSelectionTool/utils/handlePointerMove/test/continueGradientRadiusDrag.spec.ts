import { RefObject } from 'react';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TGradientRadiusDragState } from 'types/design/canvas/types';
import { TRectangleNode } from 'types/design/types';

// utils
import { continueGradientRadiusDrag } from '../continueGradientRadiusDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

const createGradientRadiusDragRef = (dragState: TGradientRadiusDragState | null = null): RefObject<TGradientRadiusDragState | null> => ({
  current: dragState,
});

const addGradientRectangle = (): string => {
  store.dispatch(
    addNode({
      fills: [
        {
          end: { x: 1, y: 0.5 },
          opacity: 100,
          start: { x: 0, y: 0.5 },
          stops: [
            { color: '#ffffff', opacity: 100, position: 0 },
            { color: '#000000', opacity: 100, position: 1 },
          ],
          type: 'gradient-radial',
        },
      ],
      height: 100,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 100,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const getRadiusRatio = (nodeId: string): number | undefined => {
  const node = store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TRectangleNode;
  const paint = node.fills[0];

  return paint.type === 'gradient-radial' || paint.type === 'gradient-angular' ? paint.radiusRatio : undefined;
};

// start (0,50), end (100,50) -> a full radius (ratio 1) sits perpendicular at world (0, 150)

describe('continueGradientRadiusDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should do nothing when no gradient radius drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    continueGradientRadiusDrag(canvas, pointerEvent(0, 150), store.dispatch, createGradientRadiusDragRef());

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes).toEqual({});
  });

  it('should set radiusRatio from the perpendicular distance of the cursor', () => {
    const nodeId = addGradientRectangle();
    const canvas = createCanvas();
    const dragRef = createGradientRadiusDragRef({ nodeId, paintIndex: 0 });

    // before — half of the full radius
    continueGradientRadiusDrag(canvas, pointerEvent(0, 90), store.dispatch, dragRef);

    // result
    expect(getRadiusRatio(nodeId)).toBeCloseTo(0.4, 5);
  });

  it('should let the ratio grow past 1 when dragged further than the primary radius', () => {
    const nodeId = addGradientRectangle();
    const canvas = createCanvas();
    const dragRef = createGradientRadiusDragRef({ nodeId, paintIndex: 0 });

    // before
    continueGradientRadiusDrag(canvas, pointerEvent(0, 250), store.dispatch, dragRef);

    // result
    expect(getRadiusRatio(nodeId)).toBeCloseTo(2, 5);
  });

  it('should also set radiusRatio for an angular gradient', () => {
    store.dispatch(
      addNode({
        fills: [
          {
            end: { x: 1, y: 0.5 },
            opacity: 100,
            start: { x: 0, y: 0.5 },
            stops: [
              { color: '#ffffff', opacity: 100, position: 0 },
              { color: '#000000', opacity: 100, position: 1 },
            ],
            type: 'gradient-angular',
          },
        ],
        height: 100,
        name: 'Rectangle',
        parentId: null,
        rotation: 0,
        type: NodeType.rectangle,
        width: 100,
        x: 0,
        y: 0,
      }),
    );

    const { rootOrder } = selectActivePage(store.getState());
    const nodeId = rootOrder[rootOrder.length - 1];
    const canvas = createCanvas();
    const dragRef = createGradientRadiusDragRef({ nodeId, paintIndex: 0 });

    // before — half of the full radius
    continueGradientRadiusDrag(canvas, pointerEvent(0, 90), store.dispatch, dragRef);

    // result
    expect(getRadiusRatio(nodeId)).toBeCloseTo(0.4, 5);
  });

  it('should do nothing when the targeted paint is no longer a radial gradient', () => {
    // mock — the fill was switched to solid since the drag started
    store.dispatch(
      addNode({
        fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
        height: 100,
        name: 'Rectangle',
        parentId: null,
        rotation: 0,
        type: NodeType.rectangle,
        width: 100,
        x: 0,
        y: 0,
      }),
    );
    const { rootOrder } = selectActivePage(store.getState());
    const nodeId = rootOrder[rootOrder.length - 1];
    const canvas = createCanvas();
    const dragRef = createGradientRadiusDragRef({ nodeId, paintIndex: 0 });

    // before / result — no crash, and the solid fill is left untouched
    expect(() => continueGradientRadiusDrag(canvas, pointerEvent(0, 150), store.dispatch, dragRef)).not.toThrow();
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId]).toMatchObject({
      fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
    });
  });
});
