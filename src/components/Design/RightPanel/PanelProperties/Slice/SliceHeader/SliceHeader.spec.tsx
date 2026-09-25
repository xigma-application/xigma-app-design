import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import SliceHeader from './SliceHeader';
import { TooltipProvider } from 'shared';

// store
import { store } from 'store';

describe('SliceHeader behaviors', () => {
  it('should render the Slice label with the component button and no type menu', () => {
    // before
    render(
      <Provider store={store}>
        <TooltipProvider>
          <SliceHeader />
        </TooltipProvider>
      </Provider>,
    );

    // result
    expect(screen.getByText('Slice')).toBeInTheDocument();
    expect(screen.getByLabelText('Create component')).toBeInTheDocument();
    expect(screen.queryByLabelText('Element type')).not.toBeInTheDocument();
  });
});
