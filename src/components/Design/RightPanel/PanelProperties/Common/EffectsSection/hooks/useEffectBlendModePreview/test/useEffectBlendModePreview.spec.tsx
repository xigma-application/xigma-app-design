import { act, renderHook, RenderHookResult } from '@testing-library/react';
import { ReactNode } from 'react';

// hooks
import { TUseEffectBlendModePreviewResult, useEffectBlendModePreview } from '../useEffectBlendModePreview';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

// types
import { BlendMode } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <CanvasRefsProvider>{children}</CanvasRefsProvider>;

type TPreviewHook = { preview: TUseEffectBlendModePreviewResult; refs: TCanvasRefs };

const renderPreview = (nodeIds: string[], openIndex: number | null): RenderHookResult<TPreviewHook, { openIndex: number | null }> =>
  renderHook(({ openIndex: index }) => ({ preview: useEffectBlendModePreview(nodeIds, index), refs: useCanvasRefsContext() }), {
    initialProps: { openIndex },
    wrapper,
  });

describe('useEffectBlendModePreview', () => {
  it('should write the hovered blend mode with the node id and effect index, and clear it on null', () => {
    // before
    const { result } = renderPreview(['node-1'], 0);

    // action
    act(() => result.current.preview.onBlendModePreview(1, BlendMode.multiply));

    // result
    expect(result.current.refs.blendMode.effectPreviewRef.current).toEqual({
      blendMode: BlendMode.multiply,
      effectIndex: 1,
      nodeIds: ['node-1'],
    });

    // action
    act(() => result.current.preview.onBlendModePreview(1, null));

    // result
    expect(result.current.refs.blendMode.effectPreviewRef.current).toBeNull();
  });

  it('should not write a preview without a node', () => {
    // before
    const { result } = renderPreview([], null);

    // action
    act(() => result.current.preview.onBlendModePreview(0, BlendMode.screen));

    // result
    expect(result.current.refs.blendMode.effectPreviewRef.current).toBeNull();
  });

  it('should drop a lingering preview when the open panel changes', () => {
    // before
    const { rerender, result } = renderPreview(['node-1'], 0);

    act(() => result.current.preview.onBlendModePreview(0, BlendMode.screen));

    // action
    rerender({ openIndex: null });

    // result
    expect(result.current.refs.blendMode.effectPreviewRef.current).toBeNull();
  });
});
