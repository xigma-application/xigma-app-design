import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import EllipseHeader from './EllipseHeader';
import { TooltipProvider } from 'shared';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// store
import { addNodes, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode } from 'types/design/types';

const renderEllipseHeader = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <CanvasRefsProvider>
        <TooltipProvider>
          <EllipseHeader />
        </TooltipProvider>
      </CanvasRefsProvider>
    </Provider>,
  );

const makeEllipse = (id: string): TEllipseNode => ({
  fill: '#d9d9d9',
  height: 20,
  id,
  name: id,
  parentId: null,
  rotation: 0,
  type: NodeType.ellipse,
  width: 20,
  x: 0,
  y: 0,
});

beforeAll(() => {
  store.dispatch(
    addNodes({
      nodes: [
        makeEllipse('ellipseHeaderA'),
        makeEllipse('ellipseHeaderB'),
        { ...makeEllipse('ellipseHeaderNested'), parentId: 'ellipseHeaderB' },
      ],
      rootIds: ['ellipseHeaderA', 'ellipseHeaderB'],
    }),
  );
});

beforeEach(() => {
  store.dispatch(setSelection([]));
});

describe('EllipseHeader snapshots', () => {
  it('should render the Ellipse label with the create component button', () => {
    // before
    const { asFragment } = renderEllipseHeader();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('EllipseHeader behaviors', () => {
  it('should render the Ellipse label', () => {
    // before
    renderEllipseHeader();

    // result
    expect(screen.getByText('Ellipse')).toBeInTheDocument();
  });

  it('should render the create component button and no element type menu', () => {
    // before
    renderEllipseHeader();

    // result
    expect(screen.getByLabelText('Create component')).toBeInTheDocument();
    expect(screen.queryByLabelText('Element type')).not.toBeInTheDocument();
  });

  it('should swap Create component and Edit object for the more actions menu while several ellipses are selected', () => {
    // mock
    store.dispatch(setSelection(['ellipseHeaderA']));

    // before
    const { unmount } = renderEllipseHeader();

    // result
    expect(screen.queryByLabelText('More actions')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Create component')).toBeInTheDocument();
    expect(screen.getByLabelText('Edit object')).toBeInTheDocument();

    // action
    unmount();
    store.dispatch(setSelection(['ellipseHeaderA', 'ellipseHeaderB']));
    renderEllipseHeader();

    // result
    expect(screen.getByLabelText('More actions')).toBeInTheDocument();
    expect(screen.queryByLabelText('Create component')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Edit object')).not.toBeInTheDocument();
  });

  it('should keep the header buttons while ellipses from different parents are selected', () => {
    // mock
    store.dispatch(setSelection(['ellipseHeaderA', 'ellipseHeaderNested']));

    // before
    renderEllipseHeader();

    // result
    expect(screen.getByLabelText('More actions')).toBeInTheDocument();
    expect(screen.getByLabelText('Use as mask')).toBeInTheDocument();
    expect(screen.getByLabelText('Boolean operations')).toBeInTheDocument();
  });
});
