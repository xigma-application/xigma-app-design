import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import ShapeCornerRadiusInput from './ShapeCornerRadiusInput';
import { TooltipProvider } from 'shared';

// store
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

describe('ShapeCornerRadiusInput behaviors', () => {
  it('should render the corner radius field', () => {
    // before
    render(
      <Provider store={store}>
        <TooltipProvider>
          <ShapeCornerRadiusInput type={NodeType.ellipse} />
        </TooltipProvider>
      </Provider>,
    );

    // result
    expect(screen.getByRole('textbox', { name: 'Corner radius' })).toHaveValue('0');
    expect(screen.getByRole('textbox', { name: 'Corner radius' })).toBeDisabled();
  });
});
