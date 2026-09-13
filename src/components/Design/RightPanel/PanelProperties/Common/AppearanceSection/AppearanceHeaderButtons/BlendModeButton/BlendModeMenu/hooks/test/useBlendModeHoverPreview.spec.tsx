import { act, renderHook } from '@testing-library/react';
import { ReactNode } from 'react';

// hooks
import { useBlendModeHoverPreview } from '../useBlendModeHoverPreview';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

// types
import { BlendMode } from 'types/design/enums';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <CanvasRefsProvider>{children}</CanvasRefsProvider>;

describe('useBlendModeHoverPreview', () => {
  it('should write the hovered blend mode for the given node onto the shared preview ref', () => {
    // before
    const { result } = renderHook(
      () => {
        const refs = useCanvasRefsContext();
        const preview = useBlendModeHoverPreview('node-1');

        return { preview, refs };
      },
      { wrapper },
    );

    // action
    act(() => result.current.preview.onOptionMouseEnter(BlendMode.multiply)());

    // result
    expect(result.current.refs.blendMode.previewRef.current).toEqual({ blendMode: BlendMode.multiply, nodeId: 'node-1' });
  });

  it('should clear the preview ref on mouse leave', () => {
    // before
    const { result } = renderHook(
      () => {
        const refs = useCanvasRefsContext();
        const preview = useBlendModeHoverPreview('node-1');

        return { preview, refs };
      },
      { wrapper },
    );

    act(() => result.current.preview.onOptionMouseEnter(BlendMode.multiply)());

    // action
    act(() => result.current.preview.onOptionMouseLeave());

    // result
    expect(result.current.refs.blendMode.previewRef.current).toBeNull();
  });
});
