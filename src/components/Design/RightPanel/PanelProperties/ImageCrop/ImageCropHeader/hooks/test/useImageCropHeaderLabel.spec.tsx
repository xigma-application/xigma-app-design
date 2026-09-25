import { renderHook } from '@testing-library/react';

// hooks
import { useImageCropHeaderLabel } from '../useImageCropHeaderLabel';

const imageCropMock = vi.fn();

vi.mock('store', async (importOriginal) => ({ ...(await importOriginal<object>()), useAppSelector: (): unknown => imageCropMock() }));

describe('useImageCropHeaderLabel', () => {
  it('should label a video crop as a video', () => {
    // mock
    imageCropMock.mockReturnValue({ paint: { type: 'video' } });

    // before
    const { result } = renderHook(() => useImageCropHeaderLabel());

    // result
    expect(result.current).toMatch(/video/i);
  });

  it('should label an image crop, or no crop, as an image', () => {
    // mock
    imageCropMock.mockReturnValueOnce({ paint: { type: 'image' } }).mockReturnValueOnce(undefined);

    // before
    const image = renderHook(() => useImageCropHeaderLabel());
    const none = renderHook(() => useImageCropHeaderLabel());

    // result
    expect(image.result.current).not.toMatch(/video/i);
    expect(none.result.current).toBe(image.result.current);
  });
});
