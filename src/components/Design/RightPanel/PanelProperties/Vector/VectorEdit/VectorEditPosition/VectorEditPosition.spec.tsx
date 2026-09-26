import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import VectorEditPosition from './VectorEditPosition';
import { TooltipProvider } from 'shared';

// store
import { store } from 'store';

const renderVectorEditPosition = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <VectorEditPosition />
      </TooltipProvider>
    </Provider>,
  );

describe('VectorEditPosition snapshots', () => {
  it('should render the X and Y fields', () => {
    // before
    const { asFragment } = renderVectorEditPosition();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('VectorEditPosition behaviors', () => {
  it('should render empty disabled X and Y fields while no points are selected', () => {
    // before
    renderVectorEditPosition();

    // find
    const x = screen.getByRole('textbox', { name: 'X position' });
    const y = screen.getByRole('textbox', { name: 'Y position' });

    // result
    expect(x).toHaveValue('');
    expect(x).toBeDisabled();
    expect(y).toHaveValue('');
    expect(y).toBeDisabled();
  });
});
