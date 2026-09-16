// store
import { setImageEditor } from 'store/design/slice';
import { store } from 'store';

// utils
import { armExitImageEditorOnPointerDown } from '../armExitImageEditorOnPointerDown';

describe('armExitImageEditorOnPointerDown', () => {
  beforeEach(() => {
    store.dispatch(setImageEditor(null));
  });

  afterEach(() => {
    store.dispatch(setImageEditor(null));
  });

  it('should clear the image editor and claim the pointer-down when nothing was hit while it is active', () => {
    // mock
    store.dispatch(setImageEditor({ mode: 'position', nodeId: 'node-1', paintIndex: 0 }));
    const dispatch = vi.fn();

    // before
    const result = armExitImageEditorOnPointerDown({ dispatch, hit: null } as never);

    // result
    expect(result).toBe(true);
    expect(dispatch).toHaveBeenCalledWith(setImageEditor(null));
  });

  it('should return undefined and dispatch nothing when a node was hit, even while the image editor is active', () => {
    // mock
    store.dispatch(setImageEditor({ mode: 'position', nodeId: 'node-1', paintIndex: 0 }));
    const dispatch = vi.fn();

    // before
    const result = armExitImageEditorOnPointerDown({ dispatch, hit: { id: 'node-1' } } as never);

    // result
    expect(result).toBeUndefined();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should return undefined and dispatch nothing when there is no active image editor', () => {
    // mock
    const dispatch = vi.fn();

    // before
    const result = armExitImageEditorOnPointerDown({ dispatch, hit: null } as never);

    // result
    expect(result).toBeUndefined();
    expect(dispatch).not.toHaveBeenCalled();
  });
});
