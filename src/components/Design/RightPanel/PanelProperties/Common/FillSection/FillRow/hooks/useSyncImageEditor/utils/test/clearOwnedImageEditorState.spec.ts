// utils
import { clearOwnedImageEditorState } from '../clearOwnedImageEditorState';

// store
import { selectImageEditor, selectImageFillPickerFocus } from 'store/design/selectors';
import { setImageEditor, setImageFillPickerFocus } from 'store/design/slice';
import { store } from 'store';

describe('clearOwnedImageEditorState', () => {
  afterEach(() => {
    store.dispatch(setImageEditor(null));
    store.dispatch(setImageFillPickerFocus(null));
  });

  it('should clear both the image editor and the fill-picker focus when they belong to this fill', () => {
    // mock
    store.dispatch(setImageEditor({ mode: 'crop', nodeId: 'node-1', paintIndex: 0 }));
    store.dispatch(setImageFillPickerFocus({ nodeId: 'node-1', paintIndex: 0 }));

    // action
    clearOwnedImageEditorState(store.dispatch, 'node-1', 0);

    // result
    expect(selectImageEditor(store.getState())).toBeNull();
    expect(selectImageFillPickerFocus(store.getState())).toBeNull();
  });

  it("should not touch a sibling fill's image editor state", () => {
    // mock
    store.dispatch(setImageEditor({ mode: 'crop', nodeId: 'node-1', paintIndex: 1 }));
    store.dispatch(setImageFillPickerFocus({ nodeId: 'node-1', paintIndex: 1 }));

    // action — a different fill (index 0) tries to clear its own, stale claim
    clearOwnedImageEditorState(store.dispatch, 'node-1', 0);

    // result — fill 1's own state survives untouched
    expect(selectImageEditor(store.getState())).toEqual({ mode: 'crop', nodeId: 'node-1', paintIndex: 1 });
    expect(selectImageFillPickerFocus(store.getState())).toEqual({ nodeId: 'node-1', paintIndex: 1 });
  });

  it('should do nothing when nothing is currently set', () => {
    // action / result
    expect(() => clearOwnedImageEditorState(store.dispatch, 'node-1', 0)).not.toThrow();
    expect(selectImageEditor(store.getState())).toBeNull();
    expect(selectImageFillPickerFocus(store.getState())).toBeNull();
  });
});
