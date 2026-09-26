import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import VectorDimensions from './VectorDimensions';
import { TooltipProvider } from 'shared';

// store
import { addNodes, setSelection } from 'store/design/slice';
import { store } from 'store';

// utils
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';

const renderVectorDimensions = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <VectorDimensions />
      </TooltipProvider>
    </Provider>,
  );

beforeAll(() => {
  store.dispatch(addNodes({ nodes: [makeSquareVector({ id: 'dimensions-component-vector' })], rootIds: ['dimensions-component-vector'] }));
  store.dispatch(setSelection(['dimensions-component-vector']));
});

describe('VectorDimensions snapshots', () => {
  it('should render the width, the height and the aspect ratio lock', () => {
    // before
    const { asFragment } = renderVectorDimensions();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('VectorDimensions behaviors', () => {
  it('should show the vector width and height', () => {
    // before
    renderVectorDimensions();

    // result
    expect(screen.getByLabelText('Width')).toHaveValue(100);
    expect(screen.getByLabelText('Height')).toHaveValue(100);
  });
});
