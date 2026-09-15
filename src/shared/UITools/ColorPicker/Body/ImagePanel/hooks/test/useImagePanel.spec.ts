import { act, renderHook, RenderHookResult } from '@testing-library/react';

// hooks
import { TUseImagePanelResult, useImagePanel } from '../useImagePanel';

const renderImagePanel = (): RenderHookResult<TUseImagePanelResult, unknown> => renderHook(() => useImagePanel());

describe('useImagePanel behaviors', () => {
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
});
