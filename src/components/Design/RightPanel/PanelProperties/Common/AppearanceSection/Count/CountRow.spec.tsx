import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import CountRow from './CountRow';
import { TooltipProvider } from 'shared';

// store
import { store } from 'store';

describe('CountRow behaviors', () => {
  it('should render the Count field', () => {
    // before
    render(
      <Provider store={store}>
        <TooltipProvider>
          <CountRow />
        </TooltipProvider>
      </Provider>,
    );

    // result
    expect(screen.getByText('Count')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Count' })).toHaveValue('0');
  });
});
