import { act, renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';

// hooks
import { useSetImagePaintScaleMode } from '../useSetImagePaintScaleMode';

// store
import { selectImageEditor } from 'store/design/selectors';
import { setImageEditor } from 'store/design/slice';
import { store } from 'store';

// types
import { TImagePaint } from 'types/design/paint/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const imagePaint: TImagePaint = { opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' };

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
