import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';

// hooks
import { useHandleCancelClick } from '../useHandleCancelClick';

// store
import { addNode, setImageEditor, setSelection, updateNode } from 'store/design/slice';
import { selectActivePage, selectImageEditor } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { TImagePaint } from 'types/design/paint/types';

const renderUseHandleCancelClick = (): ReturnType<typeof renderHook<ReturnType<typeof useHandleCancelClick>, unknown>> =>
  renderHook(() => useHandleCancelClick(), { wrapper: ({ children }) => <Provider store={store}>{children}</Provider> });

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

const readNode = (id: string): TAppearanceNode => selectActivePage(store.getState()).nodes[id] as TAppearanceNode;

describe('useHandleCancelClick', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setImageEditor(null));
  });

  it('should restore the node to its pre-crop appearance and exit the editor', () => {
    // mock — entering crop mode captures a snapshot of the node as it looks right now
    const paint: TImagePaint = { opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };
    const id = addImageRectNode(paint);

    store.dispatch(setImageEditor({ mode: 'crop', nodeId: id, paintIndex: 0 }));

    const beforeCrop = readNode(id);

    // simulate a crop edit committed since entering crop mode (e.g. an aspect ratio preset)
    store.dispatch(updateNode({ changes: { cornerRadius: 50, height: 50, width: 50, x: 35, y: 35 }, id }));

    const { result } = renderUseHandleCancelClick();

    // before
    act(() => result.current());

    // result — back to the exact pre-crop appearance
    const restored = readNode(id);

    expect({ cornerRadius: restored.cornerRadius, height: restored.height, width: restored.width, x: restored.x, y: restored.y }).toEqual({
      cornerRadius: beforeCrop.cornerRadius,
      height: beforeCrop.height,
      width: beforeCrop.width,
      x: beforeCrop.x,
      y: beforeCrop.y,
    });

    // result — the editor is closed
    expect(selectImageEditor(store.getState())).toBeNull();
  });

  it('should just exit the editor when there is no crop target', () => {
    const { result } = renderUseHandleCancelClick();

    // before
    act(() => result.current());

    // result
    expect(selectImageEditor(store.getState())).toBeNull();
  });
});
