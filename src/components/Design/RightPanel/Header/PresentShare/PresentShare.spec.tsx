import { render, screen } from '@testing-library/react';

// components
import PresentShare from './PresentShare';
import { TooltipProvider } from 'shared';

const renderPresentShare = (): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <PresentShare />
    </TooltipProvider>,
  );

describe('PresentShare snapshots', () => {
  it('should render PresentShare', () => {
    // before
    const { asFragment } = renderPresentShare();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('PresentShare behaviors', () => {
  it('should expose an accessible label on the present button', () => {
    // before
    renderPresentShare();

    // result
    expect(screen.getByRole('button', { name: 'Present' })).toBeInTheDocument();
  });

  it('should expose an accessible label on the present-options trigger', () => {
    // before
    renderPresentShare();

    // result
    expect(screen.getByRole('button', { name: 'Present options' })).toBeInTheDocument();
  });

  it('should show the share button label', () => {
    // before
    renderPresentShare();

    // result
    expect(screen.getByText('Share')).toBeInTheDocument();
  });
});
