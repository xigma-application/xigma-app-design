import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import ColumnAlignment from './ColumnAlignment';
import { TooltipProvider } from 'shared';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

const renderColumnAlignment = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <ColumnAlignment />
      </TooltipProvider>
    </Provider>,
  );

const addFrameNode = (parentId: string | null): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height: 20,
      name: 'Frame',
      parentId,
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

describe('ColumnAlignment snapshots', () => {
  it('should render the horizontal and vertical alignment button groups', () => {
    // before
    const { asFragment } = renderColumnAlignment();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('ColumnAlignment behaviors', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should render the row label', () => {
    // before
    renderColumnAlignment();

    // result
    expect(screen.getByText('Alignment')).toBeInTheDocument();
  });

  it('should render every horizontal and vertical alignment button', () => {
    // before
    renderColumnAlignment();

    // result
    expect(screen.getByLabelText('Align left')).toBeInTheDocument();
    expect(screen.getByLabelText('Align horizontal centers')).toBeInTheDocument();
    expect(screen.getByLabelText('Align right')).toBeInTheDocument();
    expect(screen.getByLabelText('Align top')).toBeInTheDocument();
    expect(screen.getByLabelText('Align vertical centers')).toBeInTheDocument();
    expect(screen.getByLabelText('Align bottom')).toBeInTheDocument();
  });

  it('should disable every button when the selected frame has no parent', () => {
    // mock
    const frameId = addFrameNode(null);
    store.dispatch(setSelection([frameId]));

    // before
    renderColumnAlignment();

    // result
    expect(screen.getByLabelText('Align left')).toBeDisabled();
  });

  it('should enable every button when the selected frame has a parent', () => {
    // mock
    const parentId = addFrameNode(null);
    const childId = addFrameNode(parentId);
    store.dispatch(setSelection([childId]));

    // before
    renderColumnAlignment();

    // result
    expect(screen.getByLabelText('Align left')).not.toBeDisabled();
  });
});
