// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { getActiveProgressiveBlurEndpoint } from '../getActiveProgressiveBlurEndpoint';

describe('getActiveProgressiveBlurEndpoint', () => {
  it('should return the hovered endpoint when nothing is dragged', () => {
    // mock
    const refs = createCanvasRefs();

    refs.progressiveBlur.hoveredEndpointRef.current = 'end';

    // result
    expect(getActiveProgressiveBlurEndpoint(refs, 'n1', 0)).toBe('end');
  });

  it('should prefer the dragged endpoint of the same effect over the hovered one', () => {
    // mock
    const refs = createCanvasRefs();

    refs.progressiveBlur.hoveredEndpointRef.current = 'end';
    refs.progressiveBlur.dragRef.current = { effectIndex: 0, endpoint: 'start', nodeId: 'n1' };

    // result
    expect(getActiveProgressiveBlurEndpoint(refs, 'n1', 0)).toBe('start');
  });

  it('should show nothing while a different effect is being dragged', () => {
    // mock
    const refs = createCanvasRefs();

    refs.progressiveBlur.dragRef.current = { effectIndex: 1, endpoint: 'start', nodeId: 'n1' };

    // result
    expect(getActiveProgressiveBlurEndpoint(refs, 'n1', 0)).toBeNull();
  });
});
