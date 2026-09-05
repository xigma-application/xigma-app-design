import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import ColumnAlignmentLayout from './ColumnAlignmentLayout';
import { TooltipProvider } from 'shared';

// store
import { addNode, setSelection, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { LayoutMode, NodeType } from 'types/design/enums';

const renderColumnAlignmentLayout = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <ColumnAlignmentLayout />
      </TooltipProvider>
    </Provider>,
  );

const addFrameNode = (layoutMode?: LayoutMode): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height: 50,
      layoutMode,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 100,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('ColumnAlignmentLayout snapshots', () => {
  it('should render the alignment and gap row for a vertical frame', () => {
    // mock
    const frameId = addFrameNode(LayoutMode.vertical);

    store.dispatch(setSelection([frameId]));

    // before
    const { asFragment } = renderColumnAlignmentLayout();

    // result
    expect(asFragment()).toMatchSnapshot();

    // cleanup
    store.dispatch(setSelection([]));
  });
});

describe('ColumnAlignmentLayout behaviors', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should render nothing for a free form frame', () => {
    // mock
    const frameId = addFrameNode(LayoutMode.freeForm);

    store.dispatch(setSelection([frameId]));

    // before
    const { container } = renderColumnAlignmentLayout();

    // result
    expect(container).toBeEmptyDOMElement();
  });

  it('should render nothing for a grid frame', () => {
    // mock
    const frameId = addFrameNode(LayoutMode.grid);

    store.dispatch(setSelection([frameId]));

    // before
    const { container } = renderColumnAlignmentLayout();

    // result
    expect(container).toBeEmptyDOMElement();
  });

  it('should render the alignment and gap labels for a horizontal frame', () => {
    // mock
    const frameId = addFrameNode(LayoutMode.horizontal);

    store.dispatch(setSelection([frameId]));

    // before
    renderColumnAlignmentLayout();

    // result
    expect(screen.getByText('Alignment')).toBeInTheDocument();
    expect(screen.getByText('Gap')).toBeInTheDocument();
  });

  it('should show the current gap value', () => {
    // mock
    const frameId = addFrameNode(LayoutMode.horizontal);

    store.dispatch(updateNode({ changes: { itemSpacing: 24 }, id: frameId }));
    store.dispatch(setSelection([frameId]));

    // before
    renderColumnAlignmentLayout();

    // result
    expect(screen.getByLabelText('Gap')).toHaveValue(24);
  });

  it('should reflect the selected frame’s own wrap flag, instead of always rendering as non-wrapped', () => {
    // mock
    const frameId = addFrameNode(LayoutMode.horizontal);

    store.dispatch(updateNode({ changes: { layoutWrap: true }, id: frameId }));
    store.dispatch(setSelection([frameId]));

    // before
    const { container } = renderColumnAlignmentLayout();

    // result
    expect(container.querySelector('[class*="option-view--horizontal-wrap"]')).not.toBeNull();
  });

  it('should commit a new alignment when an option is clicked', () => {
    // mock
    const frameId = addFrameNode(LayoutMode.horizontal);

    store.dispatch(setSelection([frameId]));

    // before
    renderColumnAlignmentLayout();

    // action
    screen.getByLabelText('Bottom right').click();

    // result
    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({ layoutAlignment: 'bottomRight' });
  });
});
