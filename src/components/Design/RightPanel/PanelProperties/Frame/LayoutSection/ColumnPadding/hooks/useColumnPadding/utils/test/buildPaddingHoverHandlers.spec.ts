import { RefObject } from 'react';

// types
import { TRightPanelPaddingGuideState } from 'types/design/canvas/types';

// utils
import { buildPaddingHoverHandlers } from '../buildPaddingHoverHandlers';

describe('buildPaddingHoverHandlers', () => {
  it('should write the frame id and given sides to the ref on hover start', () => {
    // mock
    const paddingGuideRef: RefObject<TRightPanelPaddingGuideState | null> = { current: null };
    const handlers = buildPaddingHoverHandlers(paddingGuideRef, 'frame-1', ['left', 'right']);

    // action
    handlers.onHoverStart();

    // result
    expect(paddingGuideRef.current).toEqual({ frameId: 'frame-1', sides: ['left', 'right'] });
  });

  it('should clear the ref on hover end', () => {
    // mock
    const paddingGuideRef: RefObject<TRightPanelPaddingGuideState | null> = {
      current: { frameId: 'frame-1', sides: ['top'] },
    };
    const handlers = buildPaddingHoverHandlers(paddingGuideRef, 'frame-1', ['top']);

    // action
    handlers.onHoverEnd();

    // result
    expect(paddingGuideRef.current).toBeNull();
  });
});
