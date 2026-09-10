import { render, screen } from '@testing-library/react';

// components
import RectangleHeader from './RectangleHeader';
import { TooltipProvider } from 'shared';

const renderRectangleHeader = (): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <RectangleHeader />
    </TooltipProvider>,
  );

describe('RectangleHeader snapshots', () => {
  it('should render the Rectangle label with the create component button', () => {
    // before
    const { asFragment } = renderRectangleHeader();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('RectangleHeader behaviors', () => {
  it('should render the Rectangle label', () => {
    // before
    renderRectangleHeader();

    // result
    expect(screen.getByText('Rectangle')).toBeInTheDocument();
  });

  it('should render the create component button and no element type menu', () => {
    // before
    renderRectangleHeader();

    // result
    expect(screen.getByLabelText('Create component')).toBeInTheDocument();
    expect(screen.queryByLabelText('Element type')).not.toBeInTheDocument();
  });
});
