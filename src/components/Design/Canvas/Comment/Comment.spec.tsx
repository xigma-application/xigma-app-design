import { configureStore, EnhancedStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';

// components
import Comment from './Comment';

// store
import designReducer, { startCommentDraft } from 'store/design/slice';
import { TDesignState } from 'store/design/types';

// types
import { ToolName } from 'types/design/enums';

const createTestStore = (): EnhancedStore<{ design: TDesignState }> =>
  configureStore({
    preloadedState: {
      design: {
        activePageId: 'page-1',
        activeTool: ToolName.comment,
        commentDraftPosition: null,
        editingNodeId: null,
        editingSelectionChangedAt: 0,
        editingSelectionEnd: 0,
        editingSelectionStart: 0,
        editingTextBox: null,
        editingTextContent: '',
        isActionsPanelOpen: false,
        isUiHidden: false,
        isUiMinimized: false,
        lastFrameTool: ToolName.frame,
        lastMoreTool: null,
        lastMouseTool: ToolName.default,
        lastPenTool: ToolName.pen,
        lastShapeTool: ToolName.rectangle,
        lastTextTool: ToolName.text,
        pages: {
          'page-1': {
            comments: { 'comment-1': { author: 'Xigma', content: 'hello', createdAt: 0, id: 'comment-1', x: 100, y: 200 } },
            id: 'page-1',
            name: 'Page 1',
            nodes: {},
            paintColor: '#d9d9d9',
            rootOrder: [],
            selectedIds: [],
            viewport: { x: 10, y: 20, zoom: 2 },
          },
        },
        penActiveVertexId: null,
        vectorEditingNodeIds: [],
      },
    },
    reducer: { design: designReducer },
  });

const renderWithStore = (store: EnhancedStore<{ design: TDesignState }>): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <Comment />
    </Provider>,
  );

describe('Comment behaviors', () => {
  it('should render a pin for every stored comment, positioned via the viewport transform', () => {
    // before
    const { container } = renderWithStore(createTestStore());
    const pin = container.querySelector('[class*="CommentPin"]') as HTMLDivElement;

    // result — worldToScreen: x * zoom + viewport.x = 100 * 2 + 10 = 210; y * zoom + viewport.y = 200 * 2 + 20 = 420
    expect(pin).toHaveStyle({ left: '210px', top: '420px' });
  });

  it('should not render a draft input when no draft is open', () => {
    // before
    const { container } = renderWithStore(createTestStore());

    // result
    expect(container.querySelector('[class*="CommentDraftInput"]')).not.toBeInTheDocument();
  });

  it('should render the draft input at the draft position once one is open', () => {
    // mock
    const store = createTestStore();

    store.dispatch(startCommentDraft({ x: 50, y: 60 }));

    // before
    const { container } = renderWithStore(store);
    const draftInput = container.querySelector('[class*="CommentDraftInput"]') as HTMLDivElement;

    // result — worldToScreen: 50 * 2 + 10 = 110; 60 * 2 + 20 = 140; then -32px so the pin's tip touches it
    expect(draftInput).toHaveStyle({ left: '110px', top: '108px' });
  });
});
