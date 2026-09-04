import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import ColumnFlow from './ColumnFlow';
import { TooltipProvider } from 'shared';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { LayoutMode, NodeType } from 'types/design/enums';

const renderColumnFlow = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <ColumnFlow />
      </TooltipProvider>
    </Provider>,
  );

const addFrameNode = (): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height: 50,
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

describe('ColumnFlow snapshots', () => {
  it('should render the flow toggle buttons', () => {
    // before
    const { asFragment } = renderColumnFlow();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('ColumnFlow behaviors', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should render the row label', () => {
    // before
    renderColumnFlow();

    // result
    expect(screen.getByText('Flow')).toBeInTheDocument();
  });

  it('should select "Free form" by default when nothing is selected', () => {
    // before
    renderColumnFlow();

    // result
    expect(screen.getByLabelText('Free form')).toHaveAttribute('aria-pressed', 'true');
  });

  it('should select the clicked flow option', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(setSelection([frameId]));

    // before
    renderColumnFlow();

    // action
    fireEvent.click(screen.getByLabelText('Vertical'));

    // result
    expect(screen.getByLabelText('Vertical')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('Free form')).toHaveAttribute('aria-pressed', 'false');
    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({ layoutMode: LayoutMode.vertical });
  });
});
