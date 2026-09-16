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

describe('useImagePanel behaviors', () => {
  afterEach(() => {
    store.dispatch(setDesignHintLabelKey(null));
  });

  it('should default to the zeroed adjustment state with fill mode', () => {
    // before
    const { result } = renderImagePanel();

    // result
    expect(result.current).toMatchObject({
      contrast: 0,
      exposure: 0,
      fillMode: 'fill',
      highlights: 0,
      saturation: 0,
      shadows: 0,
      temperature: 0,
      tint: 0,
    });
  });

  it('should update only fillMode when setFillMode is called', () => {
    // before
    const { result } = renderImagePanel();

    // action
    act(() => result.current.setFillMode('tile'));

    // result
    expect(result.current.fillMode).toBe('tile');
    expect(result.current.exposure).toBe(0);
  });

  it('should update only exposure when setExposure is called', () => {
    // before
    const { result } = renderImagePanel();

    // action
    act(() => result.current.setExposure(42));

    // result
    expect(result.current.exposure).toBe(42);
    expect(result.current.contrast).toBe(0);
  });

  it('should update only contrast when setContrast is called', () => {
    // before
    const { result } = renderImagePanel();

    // action
    act(() => result.current.setContrast(-10));

    // result
    expect(result.current.contrast).toBe(-10);
    expect(result.current.saturation).toBe(0);
  });

  it('should update only saturation when setSaturation is called', () => {
    // before
    const { result } = renderImagePanel();

    // action
    act(() => result.current.setSaturation(20));

    // result
    expect(result.current.saturation).toBe(20);
    expect(result.current.temperature).toBe(0);
  });

  it('should update only temperature when setTemperature is called', () => {
    // before
    const { result } = renderImagePanel();

    // action
    act(() => result.current.setTemperature(-20));

    // result
    expect(result.current.temperature).toBe(-20);
    expect(result.current.tint).toBe(0);
  });

  it('should update only tint when setTint is called', () => {
    // before
    const { result } = renderImagePanel();

    // action
    act(() => result.current.setTint(15));

    // result
    expect(result.current.tint).toBe(15);
    expect(result.current.highlights).toBe(0);
  });

  it('should update only highlights when setHighlights is called', () => {
    // before
    const { result } = renderImagePanel();

    // action
    act(() => result.current.setHighlights(30));

    // result
    expect(result.current.highlights).toBe(30);
    expect(result.current.shadows).toBe(0);
  });

  it('should update only shadows when setShadows is called', () => {
    // before
    const { result } = renderImagePanel();

    // action
    act(() => result.current.setShadows(-30));

    // result
    expect(result.current.shadows).toBe(-30);
    expect(result.current.fillMode).toBe('fill');
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
    act(() => result.current.setExposure(1));
    rerender();

    // result — an unstable reference here would re-fire any effect keyed on it every render
    expect(result.current.setFillMode).toBe(firstSetFillMode);
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
