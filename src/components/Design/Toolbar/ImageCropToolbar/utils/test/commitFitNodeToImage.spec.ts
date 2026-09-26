// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TImageFrameNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { TImagePaint } from 'types/design/paint/types';

// utils
import { commitFitNodeToImage } from '../commitFitNodeToImage';

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
      x: 10,
      y: 20,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const readNode = (id: string): TImageFrameNode => selectActivePage(store.getState()).nodes[id] as TImageFrameNode;

describe('commitFitNodeToImage', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it("should resize and reposition the node to exactly match the image's current crop rect", () => {
    // mock
    const crop = { height: 60, rotation: 0, width: 90, x: 35, y: 10 };
    const paint: TImagePaint = { crop, opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };
    const id = addImageRectNode(paint);
    const node = readNode(id);

    // before
    commitFitNodeToImage(store.dispatch, node, paint);

    // result — the node now exactly matches the crop rect, none of the image clipped off
    const updated = readNode(id);

    expect({ height: updated.height, width: updated.width, x: updated.x, y: updated.y }).toEqual({
      height: crop.height,
      width: crop.width,
      x: crop.x,
      y: crop.y,
    });
  });

  it('should fall back to the node bounds when the paint has no crop yet and the image size has not loaded', () => {
    // mock
    const paint: TImagePaint = { opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };
    const id = addImageRectNode(paint);
    const node = readNode(id);

    // before
    commitFitNodeToImage(store.dispatch, node, paint);

    // result — untouched, since the crop already falls back to the node's own bounds
    const updated = readNode(id);

    expect({ height: updated.height, width: updated.width, x: updated.x, y: updated.y }).toEqual({
      height: node.height,
      width: node.width,
      x: node.x,
      y: node.y,
    });
  });
});
