// others
import { contrastCheckerStateCache } from '../contrastCheckerStateCache';
import { DEFAULT_CONTRAST_CHECKER_STATE } from '../../constants';

// types
import { ContrastLevel } from '../../enums';

// utils
import { updateContrastCheckerState } from '../updateContrastCheckerState';

describe('updateContrastCheckerState', () => {
  beforeEach(() => {
    contrastCheckerStateCache.current = DEFAULT_CONTRAST_CHECKER_STATE;
  });

  it('should merge the patch into the shared cache and hand the merged state to the setter', () => {
    // mock
    const setState = vi.fn();

    // action
    updateContrastCheckerState({ level: ContrastLevel.aaa }, setState);

    // result
    expect(contrastCheckerStateCache.current).toEqual({ ...DEFAULT_CONTRAST_CHECKER_STATE, level: ContrastLevel.aaa });
    expect(setState).toHaveBeenCalledWith(contrastCheckerStateCache.current);
  });
});
