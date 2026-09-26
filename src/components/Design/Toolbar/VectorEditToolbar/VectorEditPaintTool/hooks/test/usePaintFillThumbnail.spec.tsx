import { renderHook } from '@testing-library/react';

// hooks
import { usePaintFillThumbnail } from '../usePaintFillThumbnail';

const usePatternThumbnailMock = vi.fn<(sourceNodeId: string | null | undefined) => string | null>(() => 'pattern.png');

vi.mock('shared/UITools/ColorPicker/Body/PatternPanel/PatternSourcePreview/hooks/usePatternThumbnail', () => ({
  usePatternThumbnail: (sourceNodeId: string | null | undefined): string | null => usePatternThumbnailMock(sourceNodeId),
}));

const red = { color: '#ff0000', opacity: 100, type: 'solid' as const };

describe('usePaintFillThumbnail', () => {
  it('should show the image or video of the fill', () => {
    // before
    const { result } = renderHook(() =>
      usePaintFillThumbnail([red, { opacity: 100, ref: 'photo.png', rotation: 0, scaleMode: 'fill', type: 'image' }]),
    );

    // result
    expect(result.current).toBe('photo.png');
    expect(usePatternThumbnailMock).toHaveBeenLastCalledWith(null);
  });

  it('should render the pattern source for a pattern fill', () => {
    // before
    const { result } = renderHook(() => usePaintFillThumbnail([{ opacity: 100, sourceNodeId: 'source', type: 'pattern' } as never]));

    // result
    expect(result.current).toBe('pattern.png');
    expect(usePatternThumbnailMock).toHaveBeenLastCalledWith('source');
  });

  it('should show nothing without an image fill', () => {
    // mock
    usePatternThumbnailMock.mockReturnValueOnce(null);

    // before
    const { result } = renderHook(() => usePaintFillThumbnail(null));

    // result
    expect(result.current).toBeNull();
  });
});
