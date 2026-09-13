import { fireEvent, render, screen } from '@testing-library/react';

// components
import GradientPanel from './GradientPanel';
import { TooltipProvider } from 'shared';

// hooks
import { useGradientPanel } from './hooks/useGradientPanel/useGradientPanel';

const GradientPanelHarness = (): ReturnType<typeof GradientPanel> => {
  const gradientPanel = useGradientPanel();

  return <GradientPanel gradientPanel={gradientPanel} />;
};

const renderGradientPanel = (): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <GradientPanelHarness />
    </TooltipProvider>,
  );

describe('GradientPanel snapshots', () => {
  it('should render the default two-stop gradient', () => {
    // before
    const { asFragment } = renderGradientPanel();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('GradientPanel behaviors', () => {
  it('should show the Linear type option and the default stop colors', () => {
    // before
    renderGradientPanel();

    // result
    expect(screen.getByText('Linear')).toBeInTheDocument();
    expect(screen.getByDisplayValue('d9d9d9')).toBeInTheDocument();
    expect(screen.getByDisplayValue('737373')).toBeInTheDocument();
  });

  it('should mirror the stop order when Flip gradient is clicked', () => {
    // before
    renderGradientPanel();

    const hexValuesBefore = screen.getAllByDisplayValue(/^[0-9a-f]{6}$/i).map((input) => (input as HTMLInputElement).value);

    // action
    fireEvent.click(screen.getByLabelText('Flip gradient'));

    // result
    const hexValuesAfter = screen.getAllByDisplayValue(/^[0-9a-f]{6}$/i).map((input) => (input as HTMLInputElement).value);

    expect(hexValuesAfter).toEqual([...hexValuesBefore].reverse());
  });

  it('should add a new row when the add-stop button is clicked', () => {
    // before
    renderGradientPanel();

    // action
    fireEvent.click(screen.getByLabelText('Add stop'));

    // result
    expect(screen.getAllByLabelText('Stop color')).toHaveLength(3);
  });

  it('should disable stop removal until a third stop is added', () => {
    // before
    renderGradientPanel();

    // result
    screen.getAllByLabelText('Remove stop').forEach((button) => expect(button).toBeDisabled());

    // action
    fireEvent.click(screen.getByLabelText('Add stop'));

    // result
    screen.getAllByLabelText('Remove stop').forEach((button) => expect(button).not.toBeDisabled());
  });
});
