import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import SectionHeader from './SectionHeader';
import { TooltipProvider } from 'shared';

// store
import { store } from 'store';

const renderComponent = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <SectionHeader />
      </TooltipProvider>
    </Provider>,
  );

describe('SectionHeader behaviors', () => {
  it('should render the Section label with its type menu and the dev status button', () => {
    // before
    renderComponent();

    // result
    expect(screen.getByText('Section')).toBeInTheDocument();
    expect(screen.getByLabelText('Element type')).toBeInTheDocument();
    expect(screen.getByLabelText('Toggle ready for dev status')).toBeInTheDocument();
  });
});
