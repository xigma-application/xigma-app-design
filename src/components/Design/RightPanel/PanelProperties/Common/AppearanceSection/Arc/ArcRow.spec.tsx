import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import ArcRow from './ArcRow';
import { TooltipProvider } from 'shared';

// store
import { store } from 'store';

describe('ArcRow behaviors', () => {
  it('should show the Arc label with start, sweep and ratio fields joined together', () => {
    // before
    render(
      <Provider store={store}>
        <TooltipProvider>
          <ArcRow />
        </TooltipProvider>
      </Provider>,
    );

    // result
    expect(screen.getByText('Arc')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Start' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Sweep' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Ratio' })).toBeInTheDocument();
  });
});
