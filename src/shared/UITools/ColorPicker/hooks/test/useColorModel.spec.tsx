import { act, renderHook } from '@testing-library/react';

// hooks
import { useColorModel } from '../useColorModel';

describe('useColorModel behaviors', () => {
  it('should derive hsv from the initial hex value', () => {
    // before
    const { result } = renderHook(() => useColorModel({ alpha: 100, hex: '#ff0000' }, vi.fn()));

    // result
    expect(result.current.hex).toBe('#ff0000');
    expect(result.current.hsv).toEqual({ h: 0, s: 100, v: 100 });
  });

  it('should merge a partial hsv change and call onChange with the derived hex, preserving alpha', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderHook(() => useColorModel({ alpha: 50, hex: '#ff0000' }, onChange));

    // action
    act(() => result.current.setHsv({ h: 120 }));

    // result
    expect(onChange).toHaveBeenCalledWith({ alpha: 50, hex: '#00ff00' });
  });

  it('should normalize and commit a typed hex value', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderHook(() => useColorModel({ alpha: 100, hex: '#000000' }, onChange));

    // action
    act(() => result.current.setHex('F00'));

    // result
    expect(onChange).toHaveBeenCalledWith({ alpha: 100, hex: '#ff0000' });
  });

  it('should update alpha while preserving hex', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderHook(() => useColorModel({ alpha: 100, hex: '#ff0000' }, onChange));

    // action
    act(() => result.current.setAlpha(40));

    // result
    expect(onChange).toHaveBeenCalledWith({ alpha: 40, hex: '#ff0000' });
  });

  it('should commit a preset hex and alpha together in a single onChange call', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderHook(() => useColorModel({ alpha: 100, hex: '#ff0000' }, onChange));

    // action
    act(() => result.current.setPreset({ alpha: 50, hex: '#00ff00' }));

    // result
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({ alpha: 50, hex: '#00ff00' });
  });

  it('should resync hsv when the external hex value genuinely changes', () => {
    // before
    const { rerender, result } = renderHook(({ value }) => useColorModel(value, vi.fn()), {
      initialProps: { value: { alpha: 100, hex: '#ff0000' } },
    });

    // action
    rerender({ value: { alpha: 100, hex: '#0000ff' } });

    // result
    expect(result.current.hsv).toEqual({ h: 240, s: 100, v: 100 });
  });

  it('should preserve an in-progress hue when saturation drops to zero and value echoes back the same hex', () => {
    // before
    const { rerender, result } = renderHook(({ value }) => useColorModel(value, vi.fn()), {
      initialProps: { value: { alpha: 100, hex: '#ff0000' } },
    });

    act(() => result.current.setHsv({ h: 200 }));
    act(() => result.current.setHsv({ s: 0 }));

    const grayHex = result.current.hex;

    // action — parent echoes the same hex back, as a controlled component would
    rerender({ value: { alpha: 100, hex: grayHex } });

    // result — hue must survive, not be reset to the ambiguous 0 a naive hexToHsv(value.hex) would produce
    expect(result.current.hsv.h).toBe(200);
  });
});
