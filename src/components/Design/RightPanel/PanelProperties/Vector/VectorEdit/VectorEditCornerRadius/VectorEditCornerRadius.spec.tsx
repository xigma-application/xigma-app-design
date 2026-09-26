import { act, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import VectorEditCornerRadius from './VectorEditCornerRadius';
import { TooltipProvider } from 'shared';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// store
import { addNodes, setSelection, setVectorEditingNodeIds, setVectorPointSelection } from 'store/design/slice';
import { store } from 'store';

// utils
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';

const renderVectorEditCornerRadius = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <CanvasRefsProvider>
        <TooltipProvider>
          <VectorEditCornerRadius />
        </TooltipProvider>
      </CanvasRefsProvider>
    </Provider>,
  );

const vector = makeSquareVector({ cornerRadius: 3, id: 'corner-edit-vector' });

beforeAll(() => {
  store.dispatch(addNodes({ nodes: [vector], rootIds: [vector.id] }));
  store.dispatch(setSelection([vector.id]));
  store.dispatch(setVectorEditingNodeIds([vector.id]));
});

describe('VectorEditCornerRadius snapshots', () => {
  it('should render the corner radius of the whole vector', () => {
    // before
    const { asFragment } = renderVectorEditCornerRadius();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('VectorEditCornerRadius behaviors', () => {
  it('should show the radius of the whole vector and then of the selected point', () => {
    // before
    renderVectorEditCornerRadius();

    // result
    expect(screen.getByRole('textbox', { name: 'Corner radius' })).toHaveValue('3');

    // action
    act(() => {
      store.dispatch(setVectorPointSelection({ segmentIds: [], vertexIds: [Object.keys(vector.vertices)[0]] }));
    });

    // result
    expect(screen.getByRole('textbox', { name: 'Corner radius' })).toHaveValue('3');
  });
});
