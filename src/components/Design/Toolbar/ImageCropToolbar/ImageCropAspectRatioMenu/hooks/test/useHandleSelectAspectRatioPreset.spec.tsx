import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';

// hooks
import { useHandleSelectAspectRatioPreset } from '../useHandleSelectAspectRatioPreset';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TImageFrameNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { TImagePaint } from 'types/design/paint/types';

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

const readNode = (id: string): TImageFrameNode => selectActivePage(store.getState()).nodes[id] as TImageFrameNode;

describe('useHandleSelectAspectRatioPreset', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should commit the computed preset rect onto the given node/paint when called', () => {
    // mock
    const paint: TImagePaint = { opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };
    const id = addImageRectNode(paint);
    const node = readNode(id);

    const { result } = renderHook(() => useHandleSelectAspectRatioPreset(node, paint), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // before
    act(() => result.current({ ratioHeight: 1, ratioWidth: 1 }));

    // result
    const updated = readNode(id);

    expect({ height: updated.height, width: updated.width, x: updated.x, y: updated.y }).toEqual({ height: 100, width: 100, x: 50, y: 50 });
  });

  it('should do nothing when the node or paint is missing', () => {
    // mock
    const paint: TImagePaint = { opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };
    const id = addImageRectNode(paint);
    const node = readNode(id);

    const { result } = renderHook(() => useHandleSelectAspectRatioPreset(undefined, paint), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // before
    act(() => result.current({ ratioHeight: 1, ratioWidth: 1 }));

    // result — untouched
    expect(readNode(id)).toEqual(node);
  });
});
