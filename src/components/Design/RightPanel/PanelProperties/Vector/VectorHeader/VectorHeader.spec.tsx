import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import VectorHeader from './VectorHeader';
import { TooltipProvider } from 'shared';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// store
import { addNodes, setSelection } from 'store/design/slice';
import { store } from 'store';

// utils
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';

const renderVectorHeader = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <CanvasRefsProvider>
        <TooltipProvider>
          <VectorHeader />
        </TooltipProvider>
      </CanvasRefsProvider>
    </Provider>,
  );

beforeAll(() => {
  store.dispatch(
    addNodes({
      nodes: [makeSquareVector({ id: 'header-vector-a' }), makeSquareVector({ id: 'header-vector-b' })],
      rootIds: ['header-vector-a', 'header-vector-b'],
    }),
  );
});

beforeEach(() => {
  store.dispatch(setSelection(['header-vector-a']));
});

describe('VectorHeader snapshots', () => {
  it('should render the Vector path label with its buttons', () => {
    // before
    const { asFragment } = renderVectorHeader();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('VectorHeader behaviors', () => {
  it('should render the Vector path label with the component, mask and boolean buttons', () => {
    // before
    renderVectorHeader();

    // result
    expect(screen.getByText('Vector path')).toBeInTheDocument();
    expect(screen.getByLabelText('Create component')).toBeInTheDocument();
    expect(screen.getByLabelText('Use as mask')).toBeInTheDocument();
    expect(screen.getByLabelText('Boolean operations')).toBeInTheDocument();
    expect(screen.getByLabelText('Edit object')).toBeInTheDocument();
  });

  it('should hide the create component button while several vectors are selected', () => {
    // mock
    store.dispatch(setSelection(['header-vector-a', 'header-vector-b']));

    // before
    renderVectorHeader();

    // result
    expect(screen.queryByLabelText('Create component')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Edit object')).not.toBeInTheDocument();
  });

  it('should offer Edit objects in the more actions menu while several vectors are selected', () => {
    // mock
    store.dispatch(setSelection(['header-vector-a', 'header-vector-b']));

    // before
    renderVectorHeader();

    // action
    fireEvent.click(screen.getByLabelText('More actions'));

    // result
    expect(screen.getByText('Edit objects')).toBeInTheDocument();
  });
});
