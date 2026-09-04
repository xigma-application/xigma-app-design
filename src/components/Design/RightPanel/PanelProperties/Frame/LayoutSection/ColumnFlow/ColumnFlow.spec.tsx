import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import ColumnFlow from './ColumnFlow';
import { TooltipProvider } from 'shared';

// store
import { store } from 'store';

const renderColumnFlow = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <ColumnFlow />
      </TooltipProvider>
    </Provider>,
  );

describe('ColumnFlow snapshots', () => {
  it('should render the flow toggle buttons', () => {
    // before
    const { asFragment } = renderColumnFlow();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('ColumnFlow behaviors', () => {
  it('should render the row label', () => {
    // before
    renderColumnFlow();

    // result
    expect(screen.getByText('Flow')).toBeInTheDocument();
  });

  it('should select "Free form" by default', () => {
    // before
    renderColumnFlow();

    // result
    expect(screen.getByLabelText('Free form')).toHaveAttribute('aria-pressed', 'true');
  });

  it('should select the clicked flow option', () => {
    // before
    renderColumnFlow();

    // action
    fireEvent.click(screen.getByLabelText('Vertical'));

    // result
    expect(screen.getByLabelText('Vertical')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('Free form')).toHaveAttribute('aria-pressed', 'false');
  });
});
