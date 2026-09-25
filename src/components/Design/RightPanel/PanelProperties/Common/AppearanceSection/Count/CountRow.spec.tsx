import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import CountRow from './CountRow';
import { TooltipProvider } from 'shared';

// store
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TCountNodeType } from './types';

const renderCountRow = (type: TCountNodeType): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <CountRow type={type} />
      </TooltipProvider>
    </Provider>,
  );

describe('CountRow behaviors', () => {
  it('should render the Count field alone for polygons', () => {
    // before
    renderCountRow(NodeType.polygon);

    // result
    expect(screen.getByText('Count')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Count' })).toHaveValue('0');
    expect(screen.queryByText('Ratio')).not.toBeInTheDocument();
  });

  it('should render the Count and Ratio fields for stars', () => {
    // before
    renderCountRow(NodeType.star);

    // result
    expect(screen.getByRole('textbox', { name: 'Count' })).toBeInTheDocument();
    expect(screen.getByText('Ratio')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Ratio' })).toHaveValue('0%');
  });
});
