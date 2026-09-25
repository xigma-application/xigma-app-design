// store
import { addNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { LineEndpoint, NodeType } from 'types/design/enums';

// utils
import { handleShiftKeyChange } from '../handleShiftKeyChange';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const keyboardEvent = (key: string, shiftKey = true): KeyboardEvent => new KeyboardEvent('keydown', { key, shiftKey });

const createLineNode = (): string => {
  const { payload } = store.dispatch(
    addNode({
      endPoint: LineEndpoint.none,
      name: 'Line',
      parentId: null,
      startPoint: LineEndpoint.none,
      strokes: [{ color: '#000000', opacity: 100, type: 'solid' }],
      type: NodeType.line,
      x1: 0,
      x2: 0,
      y1: 0,
      y2: 0,
    }),
  );

  return payload.id;
};

describe('handleShiftKeyChange', () => {
  it('should ignore a non-Shift key', () => {
    // mock
    const nodeId = createLineNode();
    const canvas = createCanvas();
    const startRef = { current: { x: 0, y: 0 } };
    const lastPointerClientPositionRef = { current: { x: 100, y: 20 } };

    // before
    handleShiftKeyChange(
      canvas,
      keyboardEvent('Alt'),
      store.dispatch,
      IDENTITY_VIEWPORT,
      startRef,
      { current: nodeId },
      lastPointerClientPositionRef,
    );

    // result
    expect(selectActivePage(store.getState()).nodes[nodeId]).toMatchObject({ x2: 0, y2: 0 });
  });

  it('should do nothing when no drag has started yet', () => {
    // before & result — must not throw with no in-progress drag
    expect(() =>
      handleShiftKeyChange(
        createCanvas(),
        keyboardEvent('Shift'),
        store.dispatch,
        IDENTITY_VIEWPORT,
        { current: null },
        { current: null },
        { current: { x: 100, y: 20 } },
      ),
    ).not.toThrow();
  });

  it('should do nothing when the pointer has never moved over the canvas', () => {
    // mock
    const nodeId = createLineNode();

    // before & result — must not throw with no known pointer position
    expect(() =>
      handleShiftKeyChange(
        createCanvas(),
        keyboardEvent('Shift'),
        store.dispatch,
        IDENTITY_VIEWPORT,
        { current: { x: 0, y: 0 } },
        { current: nodeId },
        { current: null },
      ),
    ).not.toThrow();

    // result
    expect(selectActivePage(store.getState()).nodes[nodeId]).toMatchObject({ x2: 0, y2: 0 });
  });

  it('should re-evaluate the in-progress line at the last known pointer position, hard-snapping to the nearest 15° increment', () => {
    // mock — same (0,0) -> (100,20) drag used by the hook-level test, re-triggered via Shift alone
    const nodeId = createLineNode();
    const canvas = createCanvas();
    const startRef = { current: { x: 0, y: 0 } };
    const lastPointerClientPositionRef = { current: { x: 100, y: 20 } };

    // before
    handleShiftKeyChange(
      canvas,
      keyboardEvent('Shift', true),
      store.dispatch,
      IDENTITY_VIEWPORT,
      startRef,
      { current: nodeId },
      lastPointerClientPositionRef,
    );

    // result
    expect(selectActivePage(store.getState()).nodes[nodeId]).toMatchObject({ x2: 98, y2: 26 });
  });
});
