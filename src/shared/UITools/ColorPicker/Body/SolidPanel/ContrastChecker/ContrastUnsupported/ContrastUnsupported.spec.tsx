import { fireEvent, render, screen } from '@testing-library/react';

// components
import ContrastUnsupported from './ContrastUnsupported';
import { TooltipProvider } from 'shared';

const renderContrastUnsupported = (reason: 'foreground'): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <ContrastUnsupported reason={reason} />
    </TooltipProvider>,
  );

describe('ContrastUnsupported', () => {
  it('should explain that the foreground has a blend mode', () => {
    // before
    renderContrastUnsupported('foreground');

    // result
    expect(screen.getByText('Foreground has blend mode')).toBeInTheDocument();
  });

  it('should show the "simple foregrounds" tooltip on hover', async () => {
    // before
    renderContrastUnsupported('foreground');

    // action
    fireEvent.focus(screen.getByText('Foreground has blend mode'));
    fireEvent.pointerMove(screen.getByText('Foreground has blend mode'));

    // result
    expect(await screen.findAllByText('Only supported for simple foregrounds', {}, { timeout: 2000 })).not.toHaveLength(0);
  });
});
