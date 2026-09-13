import { fireEvent, render, screen } from '@testing-library/react';

// components
import GradientActions from './GradientActions';
import { TooltipProvider } from 'shared';

const renderGradientActions = (
  onFlip = vi.fn(),
  onRotate = vi.fn(),
  onTypeChange = vi.fn(),
  type: Parameters<typeof GradientActions>[0]['type'] = 'gradient-linear',
): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <GradientActions onFlip={onFlip} onRotate={onRotate} onTypeChange={onTypeChange} type={type} />
    </TooltipProvider>,
  );

describe('GradientActions snapshots', () => {
  it('should render the type dropdown and the flip/rotate buttons', () => {
    // before
    const { asFragment } = renderGradientActions();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('GradientActions behaviors', () => {
  it('should show all four gradient type options', () => {
    // before
    renderGradientActions();
    fireEvent.click(screen.getByText('Linear'));

    // result
    expect(screen.getByText('Radial')).toBeInTheDocument();
    expect(screen.getByText('Angular')).toBeInTheDocument();
    expect(screen.getByText('Diamond')).toBeInTheDocument();
  });

  it('should call onTypeChange when a different type is selected', () => {
    // mock
    const onTypeChange = vi.fn();

    // before
    renderGradientActions(vi.fn(), vi.fn(), onTypeChange);
    fireEvent.click(screen.getByText('Linear'));

    // action
    fireEvent.click(screen.getByText('Radial'));

    // result
    expect(onTypeChange).toHaveBeenCalledWith('gradient-radial');
  });

  it('should call onFlip when the flip button is clicked', () => {
    // mock
    const onFlip = vi.fn();

    // before
    renderGradientActions(onFlip);

    // action
    fireEvent.click(screen.getByLabelText('Flip gradient'));

    // result
    expect(onFlip).toHaveBeenCalled();
  });

  it('should call onRotate when the rotate button is clicked', () => {
    // mock
    const onRotate = vi.fn();

    // before
    renderGradientActions(vi.fn(), onRotate);

    // action
    fireEvent.click(screen.getByLabelText('Rotate gradient'));

    // result
    expect(onRotate).toHaveBeenCalled();
  });

  it('should show the flip tooltip on focus', async () => {
    // before
    renderGradientActions();

    // action
    fireEvent.focus(screen.getByLabelText('Flip gradient'));

    // result
    expect(await screen.findAllByText('Flip gradient', {}, { timeout: 2000 })).not.toHaveLength(0);
  });

  it('should show the rotate tooltip on focus', async () => {
    // before
    renderGradientActions();

    // action
    fireEvent.focus(screen.getByLabelText('Rotate gradient'));

    // result
    expect(await screen.findAllByText('Rotate gradient', {}, { timeout: 2000 })).not.toHaveLength(0);
  });
});
