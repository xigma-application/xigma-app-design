import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import VectorEditMirroring from './VectorEditMirroring';
import { TooltipProvider } from 'shared';

// store
import { store } from 'store';

const renderVectorEditMirroring = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <VectorEditMirroring />
      </TooltipProvider>
    </Provider>,
  );

describe('VectorEditMirroring snapshots', () => {
  it('should render the three mirroring options', () => {
    // before
    const { asFragment } = renderVectorEditMirroring();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('VectorEditMirroring behaviors', () => {
  it('should render the mirroring options disabled and unpressed while no points are selected', () => {
    // before
    renderVectorEditMirroring();

    // find
    const options = ['No mirroring', 'Mirror angle', 'Mirror angle and length'].map((name) => screen.getByRole('button', { name }));

    // result
    options.forEach((option) => {
      expect(option).toBeDisabled();
      expect(option).toHaveAttribute('aria-pressed', 'false');
    });
  });
});
