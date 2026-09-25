import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import EllipseCornerRadiusInput from './EllipseCornerRadiusInput';
import { TooltipProvider } from 'shared';

// store
import { store } from 'store';

describe('EllipseCornerRadiusInput behaviors', () => {
  it('should render the corner radius field', () => {
    // before
    render(
      <Provider store={store}>
        <TooltipProvider>
          <EllipseCornerRadiusInput />
        </TooltipProvider>
      </Provider>,
    );

    // result
    expect(screen.getByRole('textbox', { name: 'Corner radius' })).toHaveValue('0');
  });
});
