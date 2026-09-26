import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import VectorEditAlignment from './VectorEditAlignment';
import { TooltipProvider } from 'shared';

// store
import { store } from 'store';

const renderVectorEditAlignment = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <VectorEditAlignment />
      </TooltipProvider>
    </Provider>,
  );

describe('VectorEditAlignment snapshots', () => {
  it('should render the alignment buttons and the more actions button', () => {
    // before
    const { asFragment } = renderVectorEditAlignment();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('VectorEditAlignment behaviors', () => {
  it('should disable every alignment button and the more actions button while no points are selected', () => {
    // before
    renderVectorEditAlignment();

    // result
    expect(screen.getAllByRole('button')).toHaveLength(7);
    screen.getAllByRole('button').forEach((button) => expect(button).toBeDisabled());
  });
});
