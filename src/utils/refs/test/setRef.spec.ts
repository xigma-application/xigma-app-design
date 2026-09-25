// types
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { setRef } from '../setRef';

describe('setRef', () => {
  it('should write the value into the ref stored under the key', () => {
    // mock
    const refs: TCanvasRefs = createCanvasRefs();

    // before
    setRef(refs.hover, 'hoveredStarRatioHandleRef', 'star-1');

    // result
    expect(refs.hover.hoveredStarRatioHandleRef.current).toBe('star-1');
  });

  it('should clear the ref when given null', () => {
    // mock
    const refs = createCanvasRefs();

    refs.hover.hoveredStarRatioHandleRef.current = 'star-1';

    // before
    setRef(refs.hover, 'hoveredStarRatioHandleRef', null);

    // result
    expect(refs.hover.hoveredStarRatioHandleRef.current).toBeNull();
  });
});
