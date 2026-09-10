import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import PositionSection from './PositionSection';
import { TooltipProvider } from 'shared';

// store
import { addNode, moveNodes, setSelection, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { LayoutMode, NodeType } from 'types/design/enums';

const renderPositionSection = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <PositionSection />
      </TooltipProvider>
    </Provider>,
  );

const addFrameNode = (): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height: 20,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 20,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('PositionSection snapshots', () => {
  it('should render the alignment and position rows', () => {
    // before
    const { asFragment } = renderPositionSection();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('PositionSection behaviors', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should render the alignment row label', () => {
    // before
    renderPositionSection();

    // result
    expect(screen.getByText('Alignment')).toBeInTheDocument();
  });

  it('should render the section label and the position row label', () => {
    // before
    renderPositionSection();

    // result
    expect(screen.getAllByText('Position')).toHaveLength(2);
  });

  it('should render the rotation row label', () => {
    // before
    renderPositionSection();

    // result
    expect(screen.getByText('Rotation')).toBeInTheDocument();
  });

  it('should not show the ignore-auto-layout toggle when nothing is selected', () => {
    // before
    renderPositionSection();

    // result
    expect(screen.queryByLabelText('Ignore auto layout')).toBeNull();
  });

  it('should show the ignore-auto-layout toggle for a child of a managed-layout frame', () => {
    // mock
    const parentId = addFrameNode();

    store.dispatch(updateNode({ changes: { layoutMode: LayoutMode.horizontal }, id: parentId }));

    const childId = addFrameNode();

    store.dispatch(moveNodes({ nodeIds: [childId], targetIndex: 0, targetParentId: parentId }));
    store.dispatch(setSelection([childId]));

    // before
    renderPositionSection();

    // result
    expect(screen.getByLabelText('Ignore auto layout')).toBeInTheDocument();
  });

  it('should toggle ignoreAutoLayout when the button is clicked', () => {
    // mock
    const parentId = addFrameNode();

    store.dispatch(updateNode({ changes: { layoutMode: LayoutMode.horizontal }, id: parentId }));

    const childId = addFrameNode();

    store.dispatch(moveNodes({ nodeIds: [childId], targetIndex: 0, targetParentId: parentId }));
    store.dispatch(setSelection([childId]));

    // before
    renderPositionSection();

    // action
    screen.getByLabelText('Ignore auto layout').click();

    // result
    expect(selectActivePage(store.getState()).nodes[childId]).toMatchObject({ ignoreAutoLayout: true });
  });
});
