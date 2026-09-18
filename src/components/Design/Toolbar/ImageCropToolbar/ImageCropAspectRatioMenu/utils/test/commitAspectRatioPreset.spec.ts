// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { TImagePaint } from 'types/design/paint/types';

// utils
import { commitAspectRatioPreset } from '../commitAspectRatioPreset';
import { imagePaintTextureSizeCache } from 'utils/canvas/getOrLoadTexture';

const addImageRectNode = (paint: TImagePaint): string => {
  store.dispatch(
    addNode({
      fills: [paint],
      height: 100,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 200,
      x: 0,
      y: 50,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const readNode = (id: string): TAppearanceNode => selectActivePage(store.getState()).nodes[id] as TAppearanceNode;

describe('commitAspectRatioPreset', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
    imagePaintTextureSizeCache.clear();
  });

  it('should resize and reposition the node to the computed preset rect', () => {
    // mock
    const paint: TImagePaint = { opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };
    const id = addImageRectNode(paint);
    const node = readNode(id);

    // before — a 1:1 preset fit into the node's own 200x100 bounds (no crop yet)
    commitAspectRatioPreset(store.dispatch, node, paint, { ratioHeight: 1, ratioWidth: 1 });

    // result
    const updated = readNode(id);

    expect({ height: updated.height, width: updated.width, x: updated.x, y: updated.y }).toEqual({ height: 100, width: 100, x: 50, y: 50 });
  });

  it('should not dispatch any change when the preset rect cannot be resolved', () => {
    // mock — "original" with no loaded texture never resolves a rect
    const paint: TImagePaint = { opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };
    const id = addImageRectNode(paint);
    const node = readNode(id);

    // before
    commitAspectRatioPreset(store.dispatch, node, paint, 'original');

    // result — untouched
    expect(readNode(id)).toEqual(node);
  });

  it('should max out the corner radius for the "circle" target', () => {
    // mock
    const paint: TImagePaint = { opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };
    const id = addImageRectNode(paint);
    const node = readNode(id);

    // before — the 1:1 fit resolves to a 100x100 rect, so its max corner radius is 50
    commitAspectRatioPreset(store.dispatch, node, paint, { cornerRadius: 'max', ratioHeight: 1, ratioWidth: 1 });

    // result
    expect(readNode(id).cornerRadius).toBe(50);
  });

  it('should clear the corner radius for a plain ratio target with no cornerRadius flag', () => {
    // mock
    const paint: TImagePaint = { opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };
    const id = addImageRectNode(paint);
    const node = readNode(id);

    // before
    commitAspectRatioPreset(store.dispatch, node, paint, { ratioHeight: 1, ratioWidth: 1 });

    // result
    expect(readNode(id).cornerRadius).toBe(0);
  });

  it('should clear a leftover circle corner radius when Square is picked afterward', () => {
    // mock — the node was already rounded into a circle by a previous Circle pick
    const paint: TImagePaint = { opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };
    const id = addImageRectNode(paint);
    const circledNode = { ...readNode(id), cornerRadius: 50, height: 100, width: 100, x: 50, y: 50 };

    // before — picking plain Square on top of the already-circled node
    commitAspectRatioPreset(store.dispatch, circledNode, paint, { ratioHeight: 1, ratioWidth: 1 });

    // result — squared off again, not still rounded
    expect(readNode(id).cornerRadius).toBe(0);
  });
});
