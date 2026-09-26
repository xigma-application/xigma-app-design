import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import Vector from './Vector';
import { TooltipProvider } from 'shared';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// store
import { addNodes, setSelection } from 'store/design/slice';
import { store } from 'store';

// utils
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';

const renderVector = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <CanvasRefsProvider>
        <TooltipProvider>
          <Vector />
        </TooltipProvider>
      </CanvasRefsProvider>
    </Provider>,
  );

beforeAll(() => {
  store.dispatch(addNodes({ nodes: [makeSquareVector({ id: 'panel-vector' })], rootIds: ['panel-vector'] }));
  store.dispatch(setSelection(['panel-vector']));
});

describe('Vector snapshots', () => {
  it('should render the header, position, layout, appearance, fill and export', () => {
    // before
    const { asFragment } = renderVector();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('Vector behaviors', () => {
  it('should render the Vector path label, the Position and Layout sections and Export', () => {
    // before
    renderVector();

    // result
    expect(screen.getByText('Vector path')).toBeInTheDocument();
    expect(screen.getAllByText('Position').length).toBeGreaterThan(0);
    expect(screen.getByText('Layout')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
  });

  it('should show the spacing between several selected vectors', () => {
    // mock
    const square = makeSquareVector({ id: 'spaced-vector' });
    const vertices = Object.fromEntries(Object.values(square.vertices).map((vertex) => [vertex.id, { ...vertex, x: vertex.x + 300 }]));

    store.dispatch(addNodes({ nodes: [{ ...square, vertices }], rootIds: [square.id] }));
    store.dispatch(setSelection(['panel-vector', square.id]));

    // before
    renderVector();

    // result
    expect(screen.getByText('Spacing')).toBeInTheDocument();
    expect((screen.getByLabelText('Horizontal spacing') as HTMLInputElement).value).toBe('200');
  });
});
