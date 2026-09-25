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

  it('should show the corner radius and Arc rows in Appearance, then Fill, Stroke and Effects', () => {
    // before
    renderEllipse();

    // result
    expect(screen.getByText('Appearance')).toBeInTheDocument();
    expect(screen.getByText('Arc')).toBeInTheDocument();
    expect(screen.getByText('Corner radius')).toBeInTheDocument();
    expect(screen.getByLabelText('Apply blend mode')).toBeInTheDocument();
    expect(screen.getByText('Fill')).toBeInTheDocument();
    expect(screen.getByText('Stroke')).toBeInTheDocument();
    expect(screen.getByText('Effects')).toBeInTheDocument();
  });
});
