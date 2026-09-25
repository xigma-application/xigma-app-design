// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage, selectNodes } from 'store/design/selectors';
import { store } from 'store';
import { undo } from 'store/history/actions';

// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode, TFrameNode, TGroupNode, TRectangleNode, TSectionNode } from 'types/design/types';
import { TImagePaint } from 'types/design/paint/types';

// utils
import { handleFlipSelection } from '../handleFlipSelection';

const addEllipseNode = (overrides: Partial<TEllipseNode> = {}): string => {
  store.dispatch(
    addNode({
      fill: '#ff0000',
      flipX: false,
      flipY: false,
      height: 20,
      name: 'Ellipse',
      parentId: null,
      rotation: 0,
      type: NodeType.ellipse,
      width: 40,
      x: 0,
      y: 0,
      ...overrides,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addRectangleNode = (overrides: Partial<TRectangleNode> = {}): string => {
  store.dispatch(
    addNode({
      fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
      height: 20,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 20,
      x: 0,
      y: 0,
      ...overrides,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addFrameNode = (overrides: Partial<TFrameNode> = {}): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
      height: 20,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 20,
      x: 0,
      y: 0,
      ...overrides,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addSectionNode = (overrides: Partial<TSectionNode> = {}): string => {
  store.dispatch(
    addNode({
      childIds: [],
      fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
      height: 20,
      name: 'Section',
      parentId: null,
      rotation: 0,
      type: NodeType.section,
      width: 20,
      x: 0,
      y: 0,
      ...overrides,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('handleFlipSelection', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should do nothing when nothing is selected', () => {
    // mock
    const before = selectNodes(store.getState());

    // action
    handleFlipSelection(store.dispatch, 'horizontal');

    // result
    expect(selectNodes(store.getState())).toEqual(before);
  });

  it('should toggle flipX and keep x/y/width/height unchanged when flipping a single flippable node horizontally', () => {
    // mock
    const id = addEllipseNode({ x: 100, y: 200 });
    store.dispatch(setSelection([id]));

    // action
    handleFlipSelection(store.dispatch, 'horizontal');

    // result
    const node = selectNodes(store.getState())[id] as TEllipseNode;
    expect(node.flipX).toBe(true);
    expect(node.flipY).toBe(false);
    expect(node.x).toBe(100);
    expect(node.y).toBe(200);
    expect(node.width).toBe(40);
    expect(node.height).toBe(20);
  });

  it('should toggle flipY when flipping vertically', () => {
    // mock
    const id = addEllipseNode();
    store.dispatch(setSelection([id]));

    // action
    handleFlipSelection(store.dispatch, 'vertical');

    // result
    const node = selectNodes(store.getState())[id] as TEllipseNode;
    expect(node.flipX).toBe(false);
    expect(node.flipY).toBe(true);
  });

  it('should mirror two selected nodes around their shared bounding-box center, swapping their left-right order', () => {
    // mock — A at x:0-20, B at x:80-100, shared bbox is x:0-100 (center 50)
    const idA = addRectangleNode({ x: 0, y: 0 });
    const idB = addRectangleNode({ x: 80, y: 0 });
    store.dispatch(setSelection([idA, idB]));

    // action
    handleFlipSelection(store.dispatch, 'horizontal');

    // result — mirroring x around 50: A's new x = 50 - (50-0) - 20 = ... equivalently center-of-A
    // (10) mirrors to 90, so new x = 90 - width/2 = 80; B's center (90) mirrors to 10, new x = 0
    const nodes = selectNodes(store.getState());
    expect((nodes[idA] as TRectangleNode).x).toBe(80);
    expect((nodes[idB] as TRectangleNode).x).toBe(0);
    expect((nodes[idA] as TRectangleNode).y).toBe(0);
    expect((nodes[idB] as TRectangleNode).y).toBe(0);
  });

  it('should recursively flip every leaf descendant of a selected group, around the group’s own bounding box, without touching the group node itself', () => {
    // mock — two rectangles at x:0-20 and x:80-100 inside a group
    const idA = addRectangleNode({ x: 0, y: 0 });
    const idB = addRectangleNode({ x: 80, y: 0 });
    store.dispatch(
      addNode({
        childIds: [idA, idB],
        height: 20,
        name: 'Group',
        parentId: null,
        rotation: 0,
        type: NodeType.group,
        width: 100,
        x: 0,
        y: 0,
      }),
    );

    const { rootOrder } = selectActivePage(store.getState());
    const groupId = rootOrder[rootOrder.length - 1];
    const groupBefore = selectNodes(store.getState())[groupId] as TGroupNode;

    store.dispatch(setSelection([groupId]));

    // action
    handleFlipSelection(store.dispatch, 'horizontal');

    // result
    const nodes = selectNodes(store.getState());
    expect((nodes[idA] as TRectangleNode).x).toBe(80);
    expect((nodes[idB] as TRectangleNode).x).toBe(0);
    expect(nodes[groupId]).toEqual(groupBefore); // the group's own record is untouched
  });

  it('should negate a rotated node’s rotation on top of the usual flip, matching Figma’s "flip reflects the tilt too" behavior', () => {
    // mock — flipPoint (mirror) runs before rotatePoint at render time, so mirroring a rotated
    // node's world appearance needs its stored angle negated too, or the tilt direction is wrong
    const id = addRectangleNode({ rotation: 20 });
    store.dispatch(setSelection([id]));

    // action
    handleFlipSelection(store.dispatch, 'horizontal');

    // result
    expect((selectNodes(store.getState())[id] as TRectangleNode).rotation).toBe(340);
  });

  it('should negate rotation the same way for a vertical flip too', () => {
    // mock
    const id = addRectangleNode({ rotation: 20 });
    store.dispatch(setSelection([id]));

    // action
    handleFlipSelection(store.dispatch, 'vertical');

    // result
    expect((selectNodes(store.getState())[id] as TRectangleNode).rotation).toBe(340);
  });

  it('should leave rotation untouched (no extra dispatch) when the node has no rotation', () => {
    // mock
    const id = addRectangleNode({ rotation: 0 });
    store.dispatch(setSelection([id]));

    // action
    handleFlipSelection(store.dispatch, 'horizontal');

    // result
    expect((selectNodes(store.getState())[id] as TRectangleNode).rotation).toBe(0);
  });

  it('should not touch rotation for a line node (it has none)', () => {
    // mock
    store.dispatch(
      addNode({
        name: 'Line',
        parentId: null,
        strokes: [{ color: '#000000', opacity: 100, type: 'solid' }],
        type: NodeType.line,
        x1: 0,
        x2: 20,
        y1: 0,
        y2: 0,
      }),
    );
    const { rootOrder } = selectActivePage(store.getState());
    const id = rootOrder[rootOrder.length - 1];
    store.dispatch(setSelection([id]));

    // action
    handleFlipSelection(store.dispatch, 'horizontal');

    // result — no throw, and the node still exists with no rotation field
    expect(selectNodes(store.getState())[id]).not.toHaveProperty('rotation');
  });

  it('should undo the whole flip (every touched node) in a single step', () => {
    // mock
    const idA = addRectangleNode({ x: 0, y: 0 });
    const idB = addRectangleNode({ x: 80, y: 0 });
    store.dispatch(setSelection([idA, idB]));

    const before = selectNodes(store.getState());

    // action
    handleFlipSelection(store.dispatch, 'horizontal');
    expect((selectNodes(store.getState())[idA] as TRectangleNode).x).toBe(80);

    store.dispatch(undo());

    // result
    expect(selectNodes(store.getState())).toEqual(before);
  });

  it('should do nothing at all when the selection is a single section', () => {
    // mock
    const id = addSectionNode();
    store.dispatch(setSelection([id]));
    const before = selectNodes(store.getState());

    // action
    handleFlipSelection(store.dispatch, 'vertical');

    // result
    expect(selectNodes(store.getState())).toEqual(before);
  });

  it('should flip a frame inside a multi-selection as a single frame and swap its place with the rest of the selection', () => {
    // mock: a 20px frame at 0 and a 20px rectangle at 80, so the shared box spans 0..100
    const frameId = addFrameNode({ paddingLeft: 3, x: 0, y: 0 });
    const rectId = addRectangleNode({ x: 80, y: 0 });
    store.dispatch(setSelection([frameId, rectId]));

    // action
    handleFlipSelection(store.dispatch, 'horizontal');

    // result
    const nodes = selectNodes(store.getState());
    expect(nodes[frameId]).toMatchObject({ paddingLeft: undefined, paddingRight: 3, x: 80 });
    expect((nodes[rectId] as TRectangleNode).x).toBe(0);
  });

  it('should round-trip an image fill’s crop correctly across two consecutive flips, instead of reverting it to a stale pre-flip snapshot', () => {
    // mock — two rectangles sharing a bbox of x:0-100 (center 50); A carries an image fill whose
    // crop starts flush with its own bounds. Flip is a single-shot resize (no arm/disarm drag
    // lifecycle), so it must never rely on a cache left over from a previous flip
    const paint: TImagePaint = {
      crop: { height: 20, rotation: 0, width: 20, x: 0, y: 0 },
      opacity: 100,
      ref: 'image-1',
      rotation: 0,
      scaleMode: 'fill',
      type: 'image',
    };
    const idA = addRectangleNode({ fills: [paint], x: 0, y: 0 });
    const idB = addRectangleNode({ x: 80, y: 0 });

    store.dispatch(setSelection([idA, idB]));

    // action — flip once: A moves to x:80, its crop follows to x:80
    handleFlipSelection(store.dispatch, 'horizontal');

    const afterFirstFlip = selectNodes(store.getState())[idA] as TRectangleNode;

    expect(afterFirstFlip.x).toBe(80);
    expect((afterFirstFlip.fills[0] as TImagePaint).crop).toEqual({ height: 20, rotation: 0, width: 20, x: 80, y: 0 });

    // action — flip again: A moves back to x:0; a stale cache would instead drag the crop off
    // to a bogus position computed from the pre-first-flip origin
    handleFlipSelection(store.dispatch, 'horizontal');

    const afterSecondFlip = selectNodes(store.getState())[idA] as TRectangleNode;

    // result — the crop round-trips back to its original position, exactly mirroring the node
    expect(afterSecondFlip.x).toBe(0);
    expect((afterSecondFlip.fills[0] as TImagePaint).crop).toEqual({ height: 20, rotation: 0, width: 20, x: 0, y: 0 });
  });

  it('should toggle flipX on a rectangle’s image fill when flipping horizontally, actually mirroring the picture', () => {
    // mock — a plain rectangle mirroring on its own is a geometric no-op, but an image fill has
    // content that must actually flip, which the paint model can only express via flipX/flipY
    const paint: TImagePaint = { opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };
    const id = addRectangleNode({ fills: [paint] });

    store.dispatch(setSelection([id]));

    // action
    handleFlipSelection(store.dispatch, 'horizontal');

    // result
    const node = selectNodes(store.getState())[id] as TRectangleNode;
    expect((node.fills[0] as TImagePaint).flipX).toBe(true);
    expect((node.fills[0] as TImagePaint).flipY).toBeUndefined();
  });

  it('should toggle flipY on a rectangle’s image fill when flipping vertically', () => {
    // mock
    const paint: TImagePaint = { opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };
    const id = addRectangleNode({ fills: [paint] });

    store.dispatch(setSelection([id]));

    // action
    handleFlipSelection(store.dispatch, 'vertical');

    // result
    const node = selectNodes(store.getState())[id] as TRectangleNode;
    expect((node.fills[0] as TImagePaint).flipX).toBeUndefined();
    expect((node.fills[0] as TImagePaint).flipY).toBe(true);
  });

  it('should flip flipX back off on a second horizontal flip of the same rectangle', () => {
    // mock
    const paint: TImagePaint = { opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };
    const id = addRectangleNode({ fills: [paint] });

    store.dispatch(setSelection([id]));

    // action
    handleFlipSelection(store.dispatch, 'horizontal');
    handleFlipSelection(store.dispatch, 'horizontal');

    // result
    const node = selectNodes(store.getState())[id] as TRectangleNode;
    expect((node.fills[0] as TImagePaint).flipX).toBe(false);
  });

  it('should leave a solid fill untouched (no flipX/flipY added) when flipping', () => {
    // mock
    const id = addRectangleNode({});

    store.dispatch(setSelection([id]));

    // action
    handleFlipSelection(store.dispatch, 'horizontal');

    // result
    const node = selectNodes(store.getState())[id] as TRectangleNode;
    expect(node.fills[0]).not.toHaveProperty('flipX');
  });
});
