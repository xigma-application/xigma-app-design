import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import RatioField from './RatioField';
import { TooltipProvider } from 'shared';

// store
import { store } from 'store';

describe('RatioField behaviors', () => {
  it('should render the Ratio field', () => {
    // before
    render(
      <Provider store={store}>
        <TooltipProvider>
          <RatioField />
        </TooltipProvider>
      </Provider>,
    );

    // result
    expect(screen.getByRole('textbox', { name: 'Ratio' })).toHaveValue('0%');
  });
});
