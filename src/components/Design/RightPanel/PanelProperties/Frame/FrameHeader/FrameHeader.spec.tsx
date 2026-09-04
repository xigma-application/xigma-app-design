import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import FrameHeader from './FrameHeader';
import { TooltipProvider } from 'shared';

// store
import { store } from 'store';

const renderFrameHeader = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <FrameHeader />
      </TooltipProvider>
    </Provider>,
  );

describe('FrameHeader snapshots', () => {
  it('should render the Frame label with its trailing buttons', () => {
    // before
    const { asFragment } = renderFrameHeader();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('FrameHeader behaviors', () => {
  it('should render the Frame label', () => {
    // before
    renderFrameHeader();

    // result
    expect(screen.getByText('Frame')).toBeInTheDocument();
  });

  it('should render the html tag, component, and mask buttons', () => {
    // before
    renderFrameHeader();

    // result
    expect(screen.getByLabelText('Toggle ready for dev status')).toBeInTheDocument();
    expect(screen.getByLabelText('Create component')).toBeInTheDocument();
    expect(screen.getByLabelText('Use as mask')).toBeInTheDocument();
  });
});
