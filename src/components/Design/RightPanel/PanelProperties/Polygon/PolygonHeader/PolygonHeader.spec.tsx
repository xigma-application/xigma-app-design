import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import PolygonHeader from './PolygonHeader';
import { TooltipProvider } from 'shared';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// store
import { addNodes, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TPolygonNode } from 'types/design/types';

const renderPolygonHeader = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <CanvasRefsProvider>
        <TooltipProvider>
          <PolygonHeader />
        </TooltipProvider>
      </CanvasRefsProvider>
    </Provider>,
  );

const makePolygon = (id: string): TPolygonNode => ({
  fills: [{ color: '#d9d9d9', opacity: 100, type: 'solid' }],
  flipX: false,
  flipY: false,
  height: 20,
  id,
  name: id,
  parentId: null,
  rotation: 0,
  sides: 3,
  type: NodeType.polygon,
  width: 20,
  x: 0,
  y: 0,
});

beforeAll(() => {
  store.dispatch(
    addNodes({
      nodes: [
        makePolygon('polygonHeaderA'),
        makePolygon('polygonHeaderB'),
        { ...makePolygon('polygonHeaderNested'), parentId: 'polygonHeaderB' },
      ],
      rootIds: ['polygonHeaderA', 'polygonHeaderB'],
    }),
  );
});

beforeEach(() => {
  store.dispatch(setSelection([]));
});

describe('PolygonHeader snapshots', () => {
  it('should render the Polygon label with the create component button', () => {
    // before
    const { asFragment } = renderPolygonHeader();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('PolygonHeader behaviors', () => {
  it('should render the Polygon label', () => {
    // before
    renderPolygonHeader();

    // result
    expect(screen.getByText('Polygon')).toBeInTheDocument();
  });

  it('should render the create component button and no element type menu', () => {
    // before
    renderPolygonHeader();

    // result
    expect(screen.getByLabelText('Create component')).toBeInTheDocument();
    expect(screen.queryByLabelText('Element type')).not.toBeInTheDocument();
  });

  it('should swap Create component and the shape menu for the more actions menu while several polygons are selected', () => {
    // mock
    store.dispatch(setSelection(['polygonHeaderA']));

    // before
    const { unmount } = renderPolygonHeader();

    // result
    expect(screen.getByLabelText('More actions')).toBeInTheDocument();
    expect(screen.getByLabelText('Create component')).toBeInTheDocument();

    // action
    unmount();
    store.dispatch(setSelection(['polygonHeaderA', 'polygonHeaderB']));
    renderPolygonHeader();

    // result
    expect(screen.getByLabelText('More actions')).toBeInTheDocument();
    expect(screen.queryByLabelText('Create component')).not.toBeInTheDocument();
  });

  it('should keep the header buttons while polygons from different parents are selected', () => {
    // mock
    store.dispatch(setSelection(['polygonHeaderA', 'polygonHeaderNested']));

    // before
    renderPolygonHeader();

    // result
    expect(screen.getByLabelText('More actions')).toBeInTheDocument();
    expect(screen.getByLabelText('Use as mask')).toBeInTheDocument();
    expect(screen.getByLabelText('Boolean operations')).toBeInTheDocument();
  });
});
