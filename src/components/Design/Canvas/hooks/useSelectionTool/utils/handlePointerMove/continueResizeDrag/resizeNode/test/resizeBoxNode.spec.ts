// store
import { addNode, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { getRotatedAnchorSolver } from '../../getRotatedAnchorSolver';
import { resizeBoxNode } from '../resizeBoxNode';

const addFrameNode = (): string => {
  store.dispatch(
    addNode({ fill: '#ff0000', height: 50, name: 'Frame', parentId: null, rotation: 0, type: NodeType.frame, width: 100, x: 0, y: 0 }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

const addMediaNode = (): string => {
  store.dispatch(
    addNode({
      flipX: false,
      flipY: false,
      height: 100,
      name: 'Image',
      parentId: null,
      rotation: 0,
      src: 'a.png',
      type: NodeType.media,
      width: 100,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('resizeBoxNode', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should resize a single unrotated node using the plain (non-solver) position formula', () => {
    // mock
    const idA = addFrameNode();

    // before
    resizeBoxNode(
      idA,
      { flip: null, height: 50, rotation: 0, width: 100, x: 0, y: 0 },
      store.dispatch,
      { x: 0, y: 0 },
      1.5,
      1.6,
      true,
      null,
    );

    // result
    expect(store.getState().design.nodes[idA]).toMatchObject({ height: 80, width: 150, x: 0, y: 0 });
  });

  it('should toggle flip when the drag crosses the anchor', () => {
    // mock
    const idMedia = addMediaNode();

    // before — negative scaleX signals a crossed anchor on the X axis only
    resizeBoxNode(
      idMedia,
      { flip: { x: false, y: false }, height: 100, rotation: 0, width: 100, x: 0, y: 0 },
      store.dispatch,
      { x: 0, y: null },
      -0.3,
      1,
      true,
      null,
    );

    // result
    expect(store.getState().design.nodes[idMedia]).toMatchObject({ flipX: true, flipY: false });
  });

  it('should use the rotated anchor solver for a single rotated node, when one is provided', () => {
    // mock
    const idA = addFrameNode();
    const solver = getRotatedAnchorSolver({ height: 50, width: 100, x: 0, y: 0 }, 'e', 90, 2, 1);

    // before
    resizeBoxNode(
      idA,
      { flip: null, height: 50, rotation: 90, width: 100, x: 0, y: 0 },
      store.dispatch,
      { x: 0, y: null },
      2,
      1,
      true,
      solver,
    );

    // result — matches getRotatedAnchorSolver's own directly-verified output for these inputs
    const node = store.getState().design.nodes[idA] as { height: number; width: number; x: number; y: number };

    expect(node).toMatchObject({ height: 50, width: 200 });
    expect(node.x).toBeCloseTo(-50);
    expect(node.y).toBeCloseTo(50);
  });

  it("should project the world scale onto a rotated GROUP member's own local axes, not use it raw", () => {
    // mock
    const idA = addFrameNode();

    // before — no solver (group path); scaleX=2/scaleY=1 in world space, member rotated 90deg
    resizeBoxNode(
      idA,
      { flip: null, height: 50, rotation: 90, width: 100, x: 0, y: 0 },
      store.dispatch,
      { x: 0, y: null },
      2,
      1,
      false,
      null,
    );

    // result — matches the end-to-end "grow a rotated GROUP MEMBER..." case in continueResizeDrag.spec.ts
    expect(store.getState().design.nodes[idA]).toMatchObject({ height: 100, width: 100, x: 50, y: -25 });
  });
});
