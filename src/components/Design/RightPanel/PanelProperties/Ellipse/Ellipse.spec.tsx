import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import Ellipse from './Ellipse';
import { TooltipProvider } from 'shared';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// store
import { store } from 'store';

const renderEllipse = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <CanvasRefsProvider>
        <TooltipProvider>
          <Ellipse />
        </TooltipProvider>
      </CanvasRefsProvider>
    </Provider>,
  );

describe('Ellipse snapshots', () => {
  it('should render the header, position, layout, appearance with the arc and export', () => {
    // before
    const { asFragment } = renderEllipse();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('Ellipse behaviors', () => {
  it('should render the Ellipse label and the Layout section', () => {
    // before
    renderEllipse();

    // result
    expect(screen.getByText('Ellipse')).toBeInTheDocument();
    expect(screen.getByText('Layout')).toBeInTheDocument();
  });

  it('should show the corner radius and Arc rows in Appearance without blend mode', () => {
    // before
    renderEllipse();

    // result
    expect(screen.getByText('Appearance')).toBeInTheDocument();
    expect(screen.getByText('Arc')).toBeInTheDocument();
    expect(screen.getByText('Corner radius')).toBeInTheDocument();
    expect(screen.queryByLabelText('Apply blend mode')).not.toBeInTheDocument();
  });
});
