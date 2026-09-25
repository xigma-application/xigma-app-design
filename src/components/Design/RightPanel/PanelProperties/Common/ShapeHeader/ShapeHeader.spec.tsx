import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import ShapeHeader from './ShapeHeader';
import { TooltipProvider } from 'shared';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// store
import { addNodes, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TPolygonNode } from 'types/design/types';

const renderShapeHeader = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <CanvasRefsProvider>
        <TooltipProvider>
          <ShapeHeader e2eValue="polygon" label="Polygon" />
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

describe('ShapeHeader snapshots', () => {
  it('should render the given label with the create component button', () => {
    // before
    const { asFragment } = renderShapeHeader();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('ShapeHeader behaviors', () => {
  it('should render the given label', () => {
    // before
    renderShapeHeader();

    // result
    expect(screen.getByText('Polygon')).toBeInTheDocument();
  });

  it('should render the create component button and no element type menu', () => {
    // before
    renderShapeHeader();

    // result
    expect(screen.getByLabelText('Create component')).toBeInTheDocument();
    expect(screen.queryByLabelText('Element type')).not.toBeInTheDocument();
  });

  it('should swap Create component and the shape menu for the more actions menu while several polygons are selected', () => {
    // mock
    store.dispatch(setSelection(['polygonHeaderA']));

    // before
    const { unmount } = renderShapeHeader();

    // result
    expect(screen.getByLabelText('More actions')).toBeInTheDocument();
    expect(screen.getByLabelText('Create component')).toBeInTheDocument();

    // action
    unmount();
    store.dispatch(setSelection(['polygonHeaderA', 'polygonHeaderB']));
    renderShapeHeader();

    // result
    expect(screen.getByLabelText('More actions')).toBeInTheDocument();
    expect(screen.queryByLabelText('Create component')).not.toBeInTheDocument();
  });

  it('should keep the header buttons while polygons from different parents are selected', () => {
    // mock
    store.dispatch(setSelection(['polygonHeaderA', 'polygonHeaderNested']));

    // before
    renderShapeHeader();

    // result
    expect(screen.getByLabelText('More actions')).toBeInTheDocument();
    expect(screen.getByLabelText('Use as mask')).toBeInTheDocument();
    expect(screen.getByLabelText('Boolean operations')).toBeInTheDocument();
  });
});
