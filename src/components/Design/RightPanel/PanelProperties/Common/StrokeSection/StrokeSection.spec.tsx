import { fireEvent, render, screen } from '@testing-library/react';

// components
import StrokeSection from './StrokeSection';
import { TooltipProvider } from 'shared';

const renderStrokeSection = (): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <StrokeSection />
    </TooltipProvider>,
  );

describe('StrokeSection snapshots', () => {
  it('should render the empty Stroke section with its add and styles buttons', () => {
    // before
    const { asFragment } = renderStrokeSection();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('StrokeSection behaviors', () => {
  it('should label the section "Stroke" and start empty and muted', () => {
    // before
    const { container } = renderStrokeSection();

    // result
    expect(screen.getByText('Stroke')).toBeInTheDocument();
    expect(container.querySelector('[class*="Section--muted"]')).not.toBeNull();
  });

  it('should offer an add button and a styles button that do nothing yet', () => {
    // before
    renderStrokeSection();

    // result
    expect(() => fireEvent.click(screen.getByLabelText('Add stroke'))).not.toThrow();
    expect(screen.getByLabelText('Apply stroke styles and variables')).toBeInTheDocument();
  });
});
