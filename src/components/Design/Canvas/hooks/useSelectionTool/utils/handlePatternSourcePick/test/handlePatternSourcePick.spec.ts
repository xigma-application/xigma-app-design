// store
import { selectActivePage, selectIsPatternSourcePicking } from 'store/design/selectors';
import { addNode, groupNodes, setPatternSourcePickTarget, setPatternSourcePicking, setSelection } from 'store/design/slice';
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

const pointerEvent = (x: number, y: number, button = 0, options: Partial<PointerEventInit> = {}): PointerEvent =>
  new PointerEvent('pointerdown', { button, clientX: x, clientY: y, pointerId: 1, ...options });

const addPatternRectangle = (x: number, y: number, size = 20): string => {
  store.dispatch(
    addNode({
      fills: [
        {
          alignmentIndex: 0,
          direction: 'horizontal',
          offsetX: 0,
          offsetY: 0,
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

  it('should refuse a node that itself has a pattern fill as a source, preventing any A<-B<-C chain', () => {
    // mock — B already consumes a pattern from some other source; A now tries to pick B as its own source
    const targetId = addPatternRectangle(700, 700);
    const otherSourceId = addSourceFrame(750, 750);
    const chainedConsumerId = addPatternRectangle(800, 800);

    store.dispatch(setPatternSourcePickTarget({ nodeId: chainedConsumerId, paintIndex: 0 }));
    store.dispatch(setPatternSourcePicking(true));
    handlePatternSourcePick(createCanvas(), pointerEvent(755, 755), store.dispatch);

    expect(getFills(chainedConsumerId)[0]).toMatchObject({ sourceNodeId: otherSourceId });

    store.dispatch(setPatternSourcePickTarget({ nodeId: targetId, paintIndex: 0 }));
    store.dispatch(setPatternSourcePicking(true));

    // before — target tries to pick the already-a-consumer rectangle as its own source
    handlePatternSourcePick(createCanvas(), pointerEvent(805, 805), store.dispatch);

    // result — refused, same as picking itself
    expect(getFills(targetId)[0]).not.toHaveProperty('sourceNodeId');
    expect(selectIsPatternSourcePicking(store.getState())).toBe(false);
  });

  it('should refuse a frame whose descendant has a pattern fill, not just the frame itself', () => {
    // mock — a frame containing a rectangle that itself has a pattern fill somewhere inside it
    const targetId = addPatternRectangle(900, 900);

    store.dispatch(
      addNode({
        fills: [
          {
            alignmentIndex: 0,
            direction: 'horizontal',
            offsetX: 0,
            offsetY: 0,
            opacity: 100,
            scale: 100,
            spacingX: 0,
            spacingY: 0,
            tileType: 'rectangular',
            type: 'pattern',
          },
        ],
        height: 10,
        name: 'Nested pattern rectangle',
        parentId: null,
        rotation: 0,
        type: NodeType.rectangle,
        width: 10,
        x: 955,
        y: 955,
      }),
    );

    const { rootOrder: rootOrderAfterChild } = selectActivePage(store.getState());
    const nestedPatternId = rootOrderAfterChild[rootOrderAfterChild.length - 1];

    store.dispatch(
      addNode({
        childIds: [nestedPatternId],
        clipContent: false,
        fills: [{ color: '#00ff00', opacity: 100, type: 'solid' }],
        height: 60,
        name: 'Frame',
        parentId: null,
        rotation: 0,
        type: NodeType.frame,
        width: 60,
        x: 950,
        y: 950,
      }),
    );

    store.dispatch(setPatternSourcePickTarget({ nodeId: targetId, paintIndex: 0 }));
    store.dispatch(setPatternSourcePicking(true));

    // before — click lands on the frame itself (its own fill is plain solid), not the nested rectangle
    handlePatternSourcePick(createCanvas(), pointerEvent(952, 952), store.dispatch);

    // result — refused, since the frame's own subtree contains a pattern fill
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
            offsetX: 0,
            offsetY: 0,
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

  it('should pick the whole group, not its child, on a plain click — matching default selection behavior', () => {
    // mock
    const targetId = addPatternRectangle(1300, 1300);
    const childId = addSourceFrame(1400, 1400);
    const siblingId = addSourceFrame(1500, 1400);

    store.dispatch(setSelection([childId, siblingId]));
    store.dispatch(groupNodes());

    const { nodes } = selectActivePage(store.getState());
    const groupId = nodes[childId].parentId;

    store.dispatch(setSelection([]));
    store.dispatch(setPatternSourcePickTarget({ nodeId: targetId, paintIndex: 0 }));
    store.dispatch(setPatternSourcePicking(true));

    // before
    handlePatternSourcePick(createCanvas(), pointerEvent(1405, 1405), store.dispatch);

    // result
    expect(getFills(targetId)[0]).toMatchObject({ sourceNodeId: groupId });
  });

  it('should bypass the group parent and pick its child directly when Control is held — matching default selection behavior', () => {
    // mock — same setup as above, but Control should reach the child, not the group
    const targetId = addPatternRectangle(1600, 1300);
    const childId = addSourceFrame(1700, 1400);
    const siblingId = addSourceFrame(1800, 1400);

    store.dispatch(setSelection([childId, siblingId]));
    store.dispatch(groupNodes());
    store.dispatch(setSelection([]));
    store.dispatch(setPatternSourcePickTarget({ nodeId: targetId, paintIndex: 0 }));
    store.dispatch(setPatternSourcePicking(true));

    // before
    handlePatternSourcePick(createCanvas(), pointerEvent(1705, 1405, 0, { ctrlKey: true }), store.dispatch);

    // result
    expect(getFills(targetId)[0]).toMatchObject({ sourceNodeId: childId });
  });
});
