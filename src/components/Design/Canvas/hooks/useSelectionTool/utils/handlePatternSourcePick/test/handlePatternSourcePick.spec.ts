// store
import { selectActivePage, selectIsPatternSourcePicking } from 'store/design/selectors';
import { addNode, setPatternSourcePickTarget, setPatternSourcePicking, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { handlePatternSourcePick } from '../handlePatternSourcePick';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number, button = 0): PointerEvent =>
  new PointerEvent('pointerdown', { button, clientX: x, clientY: y, pointerId: 1 });

const addPatternRectangle = (x: number, y: number, size = 20): string => {
  store.dispatch(
    addNode({
      fills: [
        {
          alignmentIndex: 0,
          direction: 'horizontal',
          opacity: 100,
          scale: 100,
          spacingX: 0,
          spacingY: 0,
          tileType: 'rectangular',
          type: 'pattern',
        },
      ],
      height: size,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: size,
      x,
      y,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addSourceFrame = (x: number, y: number, size = 20): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: false,
      fills: [{ color: '#00ff00', opacity: 100, type: 'solid' }],
      height: size,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: size,
      x,
      y,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const getFills = (nodeId: string): TRectangleNode['fills'] => (selectActivePage(store.getState()).nodes[nodeId] as TRectangleNode).fills;

describe('handlePatternSourcePick', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setPatternSourcePickTarget(null));
    store.dispatch(setPatternSourcePicking(false));
  });

  it('should ignore a non-primary button press', () => {
    // mock
    const targetId = addPatternRectangle(100, 100);

    addSourceFrame(200, 200);
    store.dispatch(setPatternSourcePickTarget({ nodeId: targetId, paintIndex: 0 }));
    store.dispatch(setPatternSourcePicking(true));

    // before
    handlePatternSourcePick(createCanvas(), pointerEvent(205, 205, 1), store.dispatch);

    // result
    expect(getFills(targetId)[0]).not.toHaveProperty('sourceNodeId');
    expect(selectIsPatternSourcePicking(store.getState())).toBe(true);
  });

  it('should do nothing when there is no pick target armed', () => {
    // mock
    store.dispatch(setPatternSourcePicking(true));

    // before
    handlePatternSourcePick(createCanvas(), pointerEvent(1, 1), store.dispatch);

    // result — picking stays armed since there was nothing to resolve it against
    expect(selectIsPatternSourcePicking(store.getState())).toBe(true);
  });

  it("should write the hit node's id into the target pattern paint's sourceNodeId and disarm picking", () => {
    // mock
    const targetId = addPatternRectangle(300, 300);
    const sourceId = addSourceFrame(400, 400);

    store.dispatch(setPatternSourcePickTarget({ nodeId: targetId, paintIndex: 0 }));
    store.dispatch(setPatternSourcePicking(true));

    // before
    handlePatternSourcePick(createCanvas(), pointerEvent(405, 405), store.dispatch);

    // result
    expect(getFills(targetId)[0]).toMatchObject({ sourceNodeId: sourceId, type: 'pattern' });
    expect(selectIsPatternSourcePicking(store.getState())).toBe(false);
  });

  it('should disarm picking without changing the fill when the click misses every node', () => {
    // mock
    const targetId = addPatternRectangle(500, 500);

    store.dispatch(setPatternSourcePickTarget({ nodeId: targetId, paintIndex: 0 }));
    store.dispatch(setPatternSourcePicking(true));

    // before
    handlePatternSourcePick(createCanvas(), pointerEvent(9000, 9000), store.dispatch);

    // result
    expect(getFills(targetId)[0]).not.toHaveProperty('sourceNodeId');
    expect(selectIsPatternSourcePicking(store.getState())).toBe(false);
  });

  it('should refuse to use the target node itself as its own pattern source', () => {
    // mock — click lands back on the target rectangle itself
    const targetId = addPatternRectangle(600, 600);

    store.dispatch(setPatternSourcePickTarget({ nodeId: targetId, paintIndex: 0 }));
    store.dispatch(setPatternSourcePicking(true));

    // before
    handlePatternSourcePick(createCanvas(), pointerEvent(605, 605), store.dispatch);

    // result
    expect(getFills(targetId)[0]).not.toHaveProperty('sourceNodeId');
    expect(selectIsPatternSourcePicking(store.getState())).toBe(false);
  });

  it('should disarm without throwing when the pick target points at a node that no longer exists', () => {
    // mock — a real node sits under the click point, but the target itself is stale
    addSourceFrame(1000, 1000);
    store.dispatch(setPatternSourcePickTarget({ nodeId: 'missing-node', paintIndex: 0 }));
    store.dispatch(setPatternSourcePicking(true));

    // before
    handlePatternSourcePick(createCanvas(), pointerEvent(1005, 1005), store.dispatch);

    // result — nothing to write to, but picking still ends
    expect(selectIsPatternSourcePicking(store.getState())).toBe(false);
  });

  it('should only touch the target paintIndex, leaving the target node other fills untouched', () => {
    // mock
    store.dispatch(
      addNode({
        fills: [
          { color: '#0000ff', opacity: 100, type: 'solid' },
          {
            alignmentIndex: 0,
            direction: 'horizontal',
            opacity: 100,
            scale: 100,
            spacingX: 0,
            spacingY: 0,
            tileType: 'rectangular',
            type: 'pattern',
          },
        ],
        height: 20,
        name: 'Rectangle',
        parentId: null,
        rotation: 0,
        type: NodeType.rectangle,
        width: 20,
        x: 1100,
        y: 1100,
      }),
    );

    const { rootOrder } = selectActivePage(store.getState());
    const targetId = rootOrder[rootOrder.length - 1];
    const sourceId = addSourceFrame(1200, 1200);

    store.dispatch(setPatternSourcePickTarget({ nodeId: targetId, paintIndex: 1 }));
    store.dispatch(setPatternSourcePicking(true));

    // before
    handlePatternSourcePick(createCanvas(), pointerEvent(1205, 1205), store.dispatch);

    // result
    const fills = getFills(targetId);

    expect(fills[0]).toEqual({ color: '#0000ff', opacity: 100, type: 'solid' });
    expect(fills[1]).toMatchObject({ sourceNodeId: sourceId, type: 'pattern' });
  });

  it('should disarm without writing anything when the target paint at paintIndex is no longer a pattern', () => {
    // mock
    addSourceFrame(800, 800);
    store.dispatch(
      addNode({
        fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
        height: 20,
        name: 'Solid rectangle',
        parentId: null,
        rotation: 0,
        type: NodeType.rectangle,
        width: 20,
        x: 900,
        y: 900,
      }),
    );

    const { rootOrder } = selectActivePage(store.getState());
    const solidId = rootOrder[rootOrder.length - 1];

    store.dispatch(setPatternSourcePickTarget({ nodeId: solidId, paintIndex: 0 }));
    store.dispatch(setPatternSourcePicking(true));

    // before
    handlePatternSourcePick(createCanvas(), pointerEvent(805, 805), store.dispatch);

    // result
    expect(getFills(solidId)[0]).toEqual({ color: '#ff0000', opacity: 100, type: 'solid' });
    expect(selectIsPatternSourcePicking(store.getState())).toBe(false);
  });
});
