// store
import { addNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TImagePaint } from 'types/design/paint/types';
import { TSceneNode } from 'types/design/types';

// utils
import { getDimensionChangeCropFills } from '../getDimensionChangeCropFills';

const addEllipseNode = (width: number, height: number): TSceneNode => {
  store.dispatch(
    addNode({ fill: '#ff0000', flipX: false, flipY: false, height, name: 'Ellipse', parentId: null, rotation: 0, type: NodeType.ellipse, width, x: 0, y: 0 }),
  );

  const { rootOrder } = selectActivePage(store.getState());
  const id = rootOrder[rootOrder.length - 1];

  return selectActivePage(store.getState()).nodes[id];
};

const addRectangleNode = (width: number, height: number): TSceneNode => {
  store.dispatch(
    addNode({
      fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
      height,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());
  const id = rootOrder[rootOrder.length - 1];

  return selectActivePage(store.getState()).nodes[id];
};

describe('getDimensionChangeCropFills', () => {
  it('should return undefined when there is no selected node', () => {
    // action
    const result = getDimensionChangeCropFills(undefined, 100, 50, 200, 50);

    // result
    expect(result).toBeUndefined();
  });

  it('should return undefined when the selected node is not an appearance node', () => {
    // mock
    const node = addEllipseNode(100, 50);

    // action
    const result = getDimensionChangeCropFills(node, 100, 50, 200, 50);

    // result
    expect(result).toBeUndefined();
  });

  it('should return undefined when the appearance node has no image fill with a crop', () => {
    // mock
    const node = addRectangleNode(100, 50);

    // action
    const result = getDimensionChangeCropFills(node, 100, 50, 200, 50);

    // result
    expect(result).toBeUndefined();
  });

  it('should scale a stored image fill’s crop proportionally when the appearance node’s dimensions change', () => {
    // mock
    const paint: TImagePaint = {
      crop: { height: 25, rotation: 0, width: 50, x: 25, y: 12.5 },
      opacity: 100,
      ref: 'image-1',
      rotation: 0,
      scaleMode: 'fill',
      type: 'image',
    };

    store.dispatch(
      addNode({
        fills: [paint],
        height: 50,
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
    const node = selectActivePage(store.getState()).nodes[rootOrder[rootOrder.length - 1]];

    // action
    const result = getDimensionChangeCropFills(node, 100, 50, 200, 50);

    // result
    expect(result).toEqual([{ ...paint, crop: { height: 25, rotation: 0, width: 100, x: 50, y: 12.5 } }]);
  });

  it('should default the scale factor to 1 when the node’s current width or height is zero', () => {
    // mock
    const paint: TImagePaint = {
      crop: { height: 25, rotation: 0, width: 50, x: 25, y: 12.5 },
      opacity: 100,
      ref: 'image-1',
      rotation: 0,
      scaleMode: 'fill',
      type: 'image',
    };

    store.dispatch(
      addNode({
        fills: [paint],
        height: 50,
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
    const node = selectActivePage(store.getState()).nodes[rootOrder[rootOrder.length - 1]];

    // action
    const result = getDimensionChangeCropFills(node, 0, 0, 200, 100);

    // result — the crop keeps its own size (scale factor defaults to 1) but re-centers on the node’s new center
    expect(result).toEqual([{ ...paint, crop: { height: 25, rotation: 0, width: 50, x: 125, y: 62.5 } }]);
  });
});
