import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import { ColumnAlignmentLayoutButtonIcons } from '../ColumnAlignmentLayoutButtonIcons';
import { TooltipProvider } from 'shared';

// store
import { store } from 'store';

describe('ColumnAlignmentLayoutButtonIcons', () => {
  it('should return exactly one button icon element', () => {
    // action
    const buttonsIcon = ColumnAlignmentLayoutButtonIcons();

    // result
    expect(buttonsIcon).toHaveLength(1);
  });

  it('should render the auto layout settings trigger', () => {
    // before
    render(
      <Provider store={store}>
        <TooltipProvider>{ColumnAlignmentLayoutButtonIcons()}</TooltipProvider>
      </Provider>,
    );

    // result
    expect(screen.getByLabelText('Properties')).toBeInTheDocument();
  });
});
