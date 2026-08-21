import { configureStore, EnhancedStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { fireEvent, render } from '@testing-library/react';

// components
import CommentPin from './CommentPin';

// store
import designReducer from 'store/design/slice';
import { TDesignState } from 'store/design/types';

// types
import { ToolName } from 'types/design/enums';
import { TComment } from 'types/design/types';

const comment: TComment = { author: 'Xigma', content: 'hello', createdAt: 0, id: 'comment-1', x: 0, y: 0 };

const createTestStore = (viewport = { x: 0, y: 0, zoom: 1 }): EnhancedStore<{ design: TDesignState }> =>
  configureStore({
    preloadedState: {
      design: {
        activeTool: ToolName.comment,
        commentDraftPosition: null,
        comments: { [comment.id]: comment },
        editingNodeId: null,
        editingSelectionChangedAt: 0,
        editingSelectionEnd: 0,
        editingSelectionStart: 0,
        editingTextBox: null,
        editingTextContent: '',
        lastFrameTool: ToolName.frame,
        lastMouseTool: ToolName.default,
        lastPenTool: ToolName.pen,
        lastShapeTool: ToolName.rectangle,
        lastTextTool: ToolName.text,
        nodes: {},
        penActiveVertexId: null,
        rootOrder: [],
        selectedIds: [],
        vectorEditingNodeId: null,
        viewport,
      },
    },
    reducer: { design: designReducer },
  });

const renderWithStore = (store: EnhancedStore<{ design: TDesignState }>): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <CommentPin comment={comment} x={12} y={34} />
    </Provider>,
  );

const getRoot = (container: HTMLElement): HTMLDivElement => container.firstElementChild as HTMLDivElement;

const getWrapper = (container: HTMLElement): HTMLDivElement => getRoot(container).firstElementChild as HTMLDivElement;

describe('CommentPin behaviors', () => {
  it('should position the root at the given world-to-screen point', () => {
    // before
    const { container } = renderWithStore(createTestStore());
    const root = getRoot(container);

    // result
    expect(root).toHaveStyle({ left: '12px', top: '34px' });
  });

  it('should render collapsed (no expanded modifier class) by default', () => {
    // before
    const { container } = renderWithStore(createTestStore());
    const wrapper = getWrapper(container);

    // result
    expect(wrapper.className).not.toMatch(/CommentPin__wrapper--visible/);
  });

  it('should expand on hovering the icon badge', () => {
    // before
    const { container } = renderWithStore(createTestStore());
    const badge = container.querySelector('[class*="__icon-wrapper"]') as HTMLDivElement;

    // action
    fireEvent.mouseEnter(badge);

    // result
    const wrapper = getWrapper(container);

    expect(wrapper.className).toMatch(/CommentPin__wrapper--visible/);
  });

  it('should collapse again on mouse leave when not being edited', () => {
    // before
    const { container } = renderWithStore(createTestStore());
    const badge = container.querySelector('[class*="__icon-wrapper"]') as HTMLDivElement;
    const wrapper = getWrapper(container);

    fireEvent.mouseEnter(badge);

    // action
    fireEvent.mouseLeave(wrapper);

    // result
    expect(wrapper.className).not.toMatch(/CommentPin__wrapper--visible/);
  });

  it('should keep a constant pixel size regardless of the canvas zoom, since x/y are already world-to-screen', () => {
    // before
    const zoomedOut = renderWithStore(createTestStore({ x: 0, y: 0, zoom: 0.5 }));
    const zoomedIn = renderWithStore(createTestStore({ x: 0, y: 0, zoom: 2 }));

    // result
    expect(getRoot(zoomedOut.container).style.transform).toBe('');
    expect(getRoot(zoomedIn.container).style.transform).toBe('');
  });
});
