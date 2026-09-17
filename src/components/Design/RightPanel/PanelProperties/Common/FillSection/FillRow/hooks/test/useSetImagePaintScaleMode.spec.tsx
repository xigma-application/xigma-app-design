import { act, renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';

// hooks
import { useSetImagePaintScaleMode } from '../useSetImagePaintScaleMode';

// store
import { addNode, setImageEditor } from 'store/design/slice';
import { selectActivePage, selectImageEditor } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TImagePaint } from 'types/design/paint/types';
import { TRectangleNode } from 'types/design/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const imagePaint: TImagePaint = { opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };

const addImageRectangle = (): string => {
  store.dispatch(
    addNode({
      fills: [imagePaint],
      height: 100,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 150,
      x: 10,
      y: 20,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('useSetImagePaintScaleMode behaviors', () => {
  afterEach(() => {
    store.dispatch(setImageEditor(null));
  });

  it('should forward fill to onChange as the paint scaleMode', () => {
    // before
    const onChange = vi.fn();
    const { result } = renderHook(() => useSetImagePaintScaleMode(imagePaint, onChange, 'node-1', 0), { wrapper });

    // action
    act(() => result.current('fill'));

    // result
    expect(onChange).toHaveBeenCalledWith({ ...imagePaint, scaleMode: 'fill' });
  });

  it('should forward fit to onChange as the paint scaleMode', () => {
    // before
    const onChange = vi.fn();
    const { result } = renderHook(() => useSetImagePaintScaleMode(imagePaint, onChange, 'node-1', 0), { wrapper });

    // action
    act(() => result.current('fit'));

    // result
    expect(onChange).toHaveBeenCalledWith({ ...imagePaint, scaleMode: 'fit' });
  });

  it('should clear an existing crop rect and exit crop mode when switching back to fill or fit', () => {
    // mock — the paint carries a crop rect left over from crop mode, and the editor is still active
    const croppedPaint: TImagePaint = { ...imagePaint, crop: { height: 40, rotation: 0, width: 40, x: 5, y: 5 } };

    store.dispatch(setImageEditor({ mode: 'crop', nodeId: 'node-1', paintIndex: 0 }));
    const onChange = vi.fn();
    const { result } = renderHook(() => useSetImagePaintScaleMode(croppedPaint, onChange, 'node-1', 0), { wrapper });

    // action
    act(() => result.current('fit'));

    // result — the stale crop rect no longer overrides the renderer's scaleMode geometry, and the
    // editor drops back to position mode so the overflow preview stops drawing
    expect(onChange).toHaveBeenCalledWith({ ...imagePaint, crop: undefined, scaleMode: 'fit' });
    expect(selectImageEditor(store.getState())).toEqual({ mode: 'position', nodeId: 'node-1', paintIndex: 0 });
  });

  it('should not touch the image editor when switching to fill or fit while it targets a different node', () => {
    // mock
    store.dispatch(setImageEditor({ mode: 'crop', nodeId: 'other-node', paintIndex: 0 }));
    const onChange = vi.fn();
    const { result } = renderHook(() => useSetImagePaintScaleMode(imagePaint, onChange, 'node-1', 0), { wrapper });

    // action
    act(() => result.current('fill'));

    // result
    expect(selectImageEditor(store.getState())).toEqual({ mode: 'crop', nodeId: 'other-node', paintIndex: 0 });
  });

  it('should not touch onChange for crop, and instead flip the active image editor into crop mode', () => {
    // mock
    store.dispatch(setImageEditor({ mode: 'position', nodeId: 'node-1', paintIndex: 0 }));
    const onChange = vi.fn();
    const { result } = renderHook(() => useSetImagePaintScaleMode(imagePaint, onChange, 'node-1', 0), { wrapper });

    // action
    act(() => result.current('crop'));

    // result
    expect(onChange).not.toHaveBeenCalled();
    expect(selectImageEditor(store.getState())).toEqual({ mode: 'crop', nodeId: 'node-1', paintIndex: 0 });
  });

  it('should also seed the image paint with a crop rect matching the node bounds when entering crop mode', () => {
    // mock
    const nodeId = addImageRectangle();

    store.dispatch(setImageEditor({ mode: 'position', nodeId, paintIndex: 0 }));
    const onChange = vi.fn();
    const { result } = renderHook(() => useSetImagePaintScaleMode(imagePaint, onChange, nodeId, 0), { wrapper });

    // action
    act(() => result.current('crop'));

    // result — the seed rect matches the node's own bounds exactly, so nothing visibly jumps
    const node = selectActivePage(store.getState()).nodes[nodeId] as TRectangleNode;

    expect((node.fills[0] as TImagePaint).crop).toEqual({ height: 100, rotation: 0, width: 150, x: 10, y: 20 });
  });

  it('should do nothing for crop when there is no active image editor for this node', () => {
    // before
    const onChange = vi.fn();
    const { result } = renderHook(() => useSetImagePaintScaleMode(imagePaint, onChange, 'node-1', 0), { wrapper });

    // action
    act(() => result.current('crop'));

    // result
    expect(onChange).not.toHaveBeenCalled();
    expect(selectImageEditor(store.getState())).toBeNull();
  });

  it('should not dispatch again when the image editor is already in crop mode', () => {
    // mock
    store.dispatch(setImageEditor({ mode: 'crop', nodeId: 'node-1', paintIndex: 0, selectedTarget: 'image' }));
    const onChange = vi.fn();
    const { result } = renderHook(() => useSetImagePaintScaleMode(imagePaint, onChange, 'node-1', 0), { wrapper });

    // action
    act(() => result.current('crop'));

    // result — selectedTarget survives untouched, proving no redundant dispatch overwrote it
    expect(selectImageEditor(store.getState())).toEqual({ mode: 'crop', nodeId: 'node-1', paintIndex: 0, selectedTarget: 'image' });
  });

  it('should not flip an image editor that targets a different node or paint index', () => {
    // mock
    store.dispatch(setImageEditor({ mode: 'position', nodeId: 'other-node', paintIndex: 0 }));
    const onChange = vi.fn();
    const { result } = renderHook(() => useSetImagePaintScaleMode(imagePaint, onChange, 'node-1', 0), { wrapper });

    // action
    act(() => result.current('crop'));

    // result
    expect(selectImageEditor(store.getState())).toEqual({ mode: 'position', nodeId: 'other-node', paintIndex: 0 });
  });

  it('should do nothing for a non-image paint', () => {
    // before
    const onChange = vi.fn();
    const { result } = renderHook(
      () => useSetImagePaintScaleMode({ color: '#ff0000', opacity: 100, type: 'solid' }, onChange, 'node-1', 0),
      { wrapper },
    );

    // action
    act(() => result.current('fill'));

    // result
    expect(onChange).not.toHaveBeenCalled();
  });
});
