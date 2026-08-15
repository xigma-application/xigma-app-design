import { configureStore, EnhancedStore } from '@reduxjs/toolkit';
import { FocusEvent, RefObject } from 'react';
import { Provider } from 'react-redux';
import { renderHook } from '@testing-library/react';

// hooks
import { useCommitTextEdit } from '../useCommitTextEdit';

// store
import designReducer, { addNode, setSelection } from 'store/design/slice';
import { TDesignState } from 'store/design/types';

// types
import { NodeType, PathType } from 'types/design/enums';

const createTestStore = (): EnhancedStore<{ design: TDesignState }> => configureStore({ reducer: { design: designReducer } });

const createSelectOnCommitRef = (selectOnCommit = false): RefObject<boolean> => ({ current: selectOnCommit });

const createBlurEvent = (html: string): FocusEvent<HTMLDivElement> => {
  const currentTarget = document.createElement('div');

  currentTarget.innerHTML = html;

  return { currentTarget } as FocusEvent<HTMLDivElement>;
};

describe('useCommitTextEdit behaviors', () => {
  it('should do nothing when there is no box being edited', () => {
    // mock
    const store = createTestStore();

    // before
    const { result } = renderHook(() => useCommitTextEdit(null, null, createSelectOnCommitRef()), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    result.current(createBlurEvent('hello'));

    // result
    expect(store.getState().design.rootOrder).toHaveLength(0);
  });

  it('should add a text node with the fixed box size, not the rendered content size, when blurred with content', () => {
    // mock
    const store = createTestStore();
    const box = { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 10, y: 10 };

    // before
    const { result } = renderHook(() => useCommitTextEdit(box, null, createSelectOnCommitRef()), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    result.current(createBlurEvent('hello world'));

    // result
    const { design } = store.getState();

    expect(design.rootOrder).toHaveLength(1);
    expect(design.nodes[design.rootOrder[0]]).toMatchObject({
      content: 'hello world',
      height: 20,
      type: NodeType.text,
      width: 100,
      x: 10,
      y: 10,
    });
  });

  it("should carry the editing box's rotation and mirror into the new node, not hardcode them to zero", () => {
    // mock
    const store = createTestStore();
    const box = { flipX: true, flipY: true, height: 20, rotation: 30, width: 100, x: 10, y: 10 };

    // before
    const { result } = renderHook(() => useCommitTextEdit(box, null, createSelectOnCommitRef()), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    result.current(createBlurEvent('hello world'));

    // result
    const { design } = store.getState();

    expect(design.nodes[design.rootOrder[0]]).toMatchObject({ flipX: true, flipY: true, rotation: 30 });
    expect(design.editingTextBox).toBeNull();
  });

  it('should carry the path binding into the new node when the box is attached to a path', () => {
    // mock
    const store = createTestStore();
    const box = {
      flipX: false,
      flipY: false,
      height: 200,
      pathFlip: true,
      pathId: 'ellipse-1',
      pathStartOffset: 0.25,
      rotation: 0,
      width: 200,
      x: 0,
      y: 0,
    };

    // before
    const { result } = renderHook(() => useCommitTextEdit(box, null, createSelectOnCommitRef()), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    result.current(createBlurEvent('curved'));

    // result
    const { design } = store.getState();

    expect(design.nodes[design.rootOrder[0]]).toMatchObject({ pathFlip: true, pathId: 'ellipse-1', pathStartOffset: 0.25 });
  });

  it('should collapse a blank line (Enter twice) to a single newline, not the browser doubled one', () => {
    // mock
    const store = createTestStore();
    const box = { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 10, y: 10 };

    // before
    const { result } = renderHook(() => useCommitTextEdit(box, null, createSelectOnCommitRef()), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action — chrome represents the blank line as a <div> containing only a <br>
    result.current(createBlurEvent('first<div><br></div><div>second</div>'));

    // result
    const { design } = store.getState();

    expect(design.nodes[design.rootOrder[0]]).toMatchObject({ content: 'first\n\nsecond' });
  });

  it('should keep a whitespace-only value as valid content, not treat it as empty', () => {
    // mock
    const store = createTestStore();
    const box = { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 10, y: 10 };

    // before
    const { result } = renderHook(() => useCommitTextEdit(box, null, createSelectOnCommitRef()), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    result.current(createBlurEvent(' '));

    // result
    const { design } = store.getState();

    expect(design.rootOrder).toHaveLength(1);
    expect(design.nodes[design.rootOrder[0]]).toMatchObject({ content: ' ' });
  });

  it('should discard the box without adding a node when blurred with no content', () => {
    // mock
    const store = createTestStore();
    const box = { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 10, y: 10 };

    // before
    const { result } = renderHook(() => useCommitTextEdit(box, null, createSelectOnCommitRef()), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    result.current(createBlurEvent(''));

    // result
    const { design } = store.getState();

    expect(design.rootOrder).toHaveLength(0);
    expect(design.editingTextBox).toBeNull();
    expect(design.selectedIds).toEqual([]);
  });

  it('should update the existing node in place, not add a new one, when editing an existing node', () => {
    // mock
    const store = createTestStore();

    store.dispatch(
      addNode({
        content: 'original',
        fill: '#ffffff',
        flipX: false,
        flipY: false,
        fontFamily: 'Inter',
        fontSize: 14,
        height: 20,
        name: 'Text',
        parentId: null,
        rotation: 0,
        type: NodeType.text,
        width: 100,
        x: 10,
        y: 10,
      }),
    );

    const [existingId] = store.getState().design.rootOrder;
    const box = { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 10, y: 10 };

    store.dispatch(setSelection([existingId]));

    // before
    const { result } = renderHook(() => useCommitTextEdit(box, existingId, createSelectOnCommitRef()), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    result.current(createBlurEvent('replaced'));

    // result
    const { design } = store.getState();

    expect(design.rootOrder).toEqual([existingId]);
    expect(design.nodes[existingId]).toMatchObject({ content: 'replaced', height: 20, width: 100, x: 10, y: 10 });
    expect(design.editingTextBox).toBeNull();
    // committing always deselects, same as clicking away on empty canvas would — previously this
    // only happened as a side effect of useSelectionTool's own empty-click handler, which is now
    // disabled for the whole duration of any edit session (see useStraightCaretEditing)
    expect(design.selectedIds).toEqual([]);
  });

  it('should clear selection once a new text node is committed with content, even when the box is not attached to a path', () => {
    // mock
    const store = createTestStore();
    const box = { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 10, y: 10 };

    // before
    const { result } = renderHook(() => useCommitTextEdit(box, null, createSelectOnCommitRef()), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    result.current(createBlurEvent('hello'));

    // result
    expect(store.getState().design.selectedIds).toEqual([]);
  });

  it('should delete the existing node when blurred with no content, matching a freshly-drawn box being discarded', () => {
    // mock
    const store = createTestStore();

    store.dispatch(
      addNode({
        content: 'original',
        fill: '#ffffff',
        flipX: false,
        flipY: false,
        fontFamily: 'Inter',
        fontSize: 14,
        height: 20,
        name: 'Text',
        parentId: null,
        rotation: 0,
        type: NodeType.text,
        width: 100,
        x: 10,
        y: 10,
      }),
    );

    const [existingId] = store.getState().design.rootOrder;
    const box = { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 10, y: 10 };

    store.dispatch(setSelection([existingId]));

    // before
    const { result } = renderHook(() => useCommitTextEdit(box, existingId, createSelectOnCommitRef()), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    result.current(createBlurEvent(''));

    // result
    const { design } = store.getState();

    expect(design.nodes[existingId]).toBeUndefined();
    expect(design.rootOrder).toHaveLength(0);
    expect(design.editingTextBox).toBeNull();
    expect(design.selectedIds).toEqual([]);
  });

  it('should also delete the bound path node when an existing path-text node is cleared to empty', () => {
    // mock
    const store = createTestStore();

    store.dispatch(
      addNode({
        height: 200,
        name: 'Path',
        parentId: null,
        pathType: PathType.ellipse,
        rotation: 0,
        type: NodeType.path,
        width: 200,
        x: 0,
        y: 0,
      }),
    );

    const [pathId] = store.getState().design.rootOrder;

    store.dispatch(
      addNode({
        content: 'original',
        fill: '#ffffff',
        flipX: false,
        flipY: false,
        fontFamily: 'Inter',
        fontSize: 14,
        height: 200,
        name: 'Text',
        parentId: null,
        pathFlip: false,
        pathId,
        pathStartOffset: 0,
        rotation: 0,
        type: NodeType.text,
        width: 200,
        x: 0,
        y: 0,
      }),
    );

    const textId = store.getState().design.rootOrder[1];
    const box = {
      flipX: false,
      flipY: false,
      height: 200,
      pathFlip: false,
      pathId,
      pathStartOffset: 0,
      rotation: 0,
      width: 200,
      x: 0,
      y: 0,
    };

    // before
    const { result } = renderHook(() => useCommitTextEdit(box, textId, createSelectOnCommitRef()), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    result.current(createBlurEvent(''));

    // result
    const { design } = store.getState();

    expect(design.nodes[textId]).toBeUndefined();
    expect(design.nodes[pathId]).toBeUndefined();
    expect(design.rootOrder).toHaveLength(0);
  });

  it('should select the newly created node instead of clearing selection when selectOnCommitRef is set (Escape path)', () => {
    // mock
    const store = createTestStore();
    const box = { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 10, y: 10 };
    const selectOnCommitRef = createSelectOnCommitRef(true);

    // before
    const { result } = renderHook(() => useCommitTextEdit(box, null, selectOnCommitRef), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    result.current(createBlurEvent('hello'));

    // result
    const { design } = store.getState();

    expect(design.selectedIds).toEqual([design.rootOrder[0]]);
    expect(selectOnCommitRef.current).toBe(false);
  });

  it('should select the existing node instead of clearing selection when selectOnCommitRef is set and re-editing an existing node', () => {
    // mock
    const store = createTestStore();

    store.dispatch(
      addNode({
        content: 'original',
        fill: '#ffffff',
        flipX: false,
        flipY: false,
        fontFamily: 'Inter',
        fontSize: 14,
        height: 20,
        name: 'Text',
        parentId: null,
        rotation: 0,
        type: NodeType.text,
        width: 100,
        x: 10,
        y: 10,
      }),
    );

    const [existingId] = store.getState().design.rootOrder;
    const box = { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 10, y: 10 };

    // before
    const { result } = renderHook(() => useCommitTextEdit(box, existingId, createSelectOnCommitRef(true)), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    result.current(createBlurEvent('replaced'));

    // result
    expect(store.getState().design.selectedIds).toEqual([existingId]);
  });

  it('should still clear selection when selectOnCommitRef is set but the content ends up empty (nothing to select)', () => {
    // mock
    const store = createTestStore();
    const box = { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 10, y: 10 };

    // before
    const { result } = renderHook(() => useCommitTextEdit(box, null, createSelectOnCommitRef(true)), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    result.current(createBlurEvent(''));

    // result
    const { design } = store.getState();

    expect(design.rootOrder).toHaveLength(0);
    expect(design.selectedIds).toEqual([]);
  });
});
