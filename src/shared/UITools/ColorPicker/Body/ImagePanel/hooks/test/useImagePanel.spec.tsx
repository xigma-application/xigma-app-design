import { act, renderHook, RenderHookResult } from '@testing-library/react';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';

// hooks
import { TUseImagePanelResult, useImagePanel } from '../useImagePanel';

// store
import { selectDesignHintLabelKey } from 'store/design/selectors';
import { setDesignHintLabelKey } from 'store/design/slice';
import { store } from 'store';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const renderImagePanel = (): RenderHookResult<TUseImagePanelResult, unknown> => renderHook(() => useImagePanel(), { wrapper });

const renderImagePanelWithInitial = (
  initialImageUrl?: string,
  initialFillMode?: TUseImagePanelResult['fillMode'],
): RenderHookResult<TUseImagePanelResult, unknown> => renderHook(() => useImagePanel(initialImageUrl, initialFillMode), { wrapper });

describe('useImagePanel behaviors', () => {
  afterEach(() => {
    store.dispatch(setDesignHintLabelKey(null));
  });

  it('should default to fill mode', () => {
    // before
    const { result } = renderImagePanel();

    // result
    expect(result.current).toMatchObject({ fillMode: 'fill' });
  });

  it('should update fillMode when setFillMode is called', () => {
    // before
    const { result } = renderImagePanel();

    // action
    act(() => result.current.setFillMode('tile'));

    // result
    expect(result.current.fillMode).toBe('tile');
  });

  it('should default imageUrl to null', () => {
    // before
    const { result } = renderImagePanel();

    // result
    expect(result.current.imageUrl).toBeNull();
  });

  it('should set imageUrl from a supported image file', () => {
    // mock
    URL.createObjectURL = vi.fn(() => 'blob:mock-url');

    // before
    const { result } = renderImagePanel();
    const file = new File(['content'], 'photo.png', { type: 'image/png' });

    // action
    act(() => result.current.setImage(file));

    // result
    expect(URL.createObjectURL).toHaveBeenCalledWith(file);
    expect(result.current.imageUrl).toBe('blob:mock-url');
    expect(selectDesignHintLabelKey(store.getState())).toBeNull();
  });

  it('should revoke the previous object URL when a new image replaces it', () => {
    // mock
    URL.createObjectURL = vi.fn().mockReturnValueOnce('blob:first').mockReturnValueOnce('blob:second');
    URL.revokeObjectURL = vi.fn();

    // before
    const { result } = renderImagePanel();

    act(() => result.current.setImage(new File(['content'], 'first.png', { type: 'image/png' })));

    // action
    act(() => result.current.setImage(new File(['content'], 'second.png', { type: 'image/png' })));

    // result
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:first');
    expect(result.current.imageUrl).toBe('blob:second');
  });

  it('should dispatch a design hint naming the extension of an unsupported file, without setting imageUrl', () => {
    // before
    const { result } = renderImagePanel();
    const file = new File(['content'], 'icon.svg', { type: 'image/svg+xml' });

    // action
    act(() => result.current.setImage(file));

    // result
    expect(selectDesignHintLabelKey(store.getState())).toBe("This file type (.svg) can't be used as image fill");
    expect(result.current.imageUrl).toBeNull();
  });

  it('should keep setFillMode referentially stable across re-renders, so consumers can safely depend on it in a useEffect', () => {
    // before
    const { rerender, result } = renderImagePanel();
    const firstSetFillMode = result.current.setFillMode;

    // action
    rerender();

    // result — an unstable reference here would re-fire any effect keyed on it every render
    expect(result.current.setFillMode).toBe(firstSetFillMode);
  });

  it('should seed imageUrl and fillMode from the existing paint on mount, so reselecting the same node shows its real state', () => {
    // before — mirrors what a node reselect (full remount) hands in from `paint.ref`/`paint.scaleMode`
    const { result } = renderImagePanelWithInitial('image-1', 'fit');

    // result
    expect(result.current.imageUrl).toBe('image-1');
    expect(result.current.fillMode).toBe('fit');
  });

  it('should still default to null/fill when no initial values are given', () => {
    // before
    const { result } = renderImagePanelWithInitial(undefined, undefined);

    // result
    expect(result.current.imageUrl).toBeNull();
    expect(result.current.fillMode).toBe('fill');
  });

  it('should not touch imageUrl when a later valid file follows an unsupported one', () => {
    // mock
    URL.createObjectURL = vi.fn(() => 'blob:mock-url');

    // before
    const { result } = renderImagePanel();

    act(() => result.current.setImage(new File(['content'], 'icon.svg', { type: 'image/svg+xml' })));
    expect(selectDesignHintLabelKey(store.getState())).not.toBeNull();

    // action
    act(() => result.current.setImage(new File(['content'], 'photo.png', { type: 'image/png' })));

    // result
    expect(result.current.imageUrl).toBe('blob:mock-url');
  });
});
