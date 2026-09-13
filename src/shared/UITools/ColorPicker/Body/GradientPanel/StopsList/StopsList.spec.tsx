import { fireEvent, render, screen } from '@testing-library/react';

// components
import StopsList from './StopsList';
import { TooltipProvider } from 'shared';

// types
import { TEditableGradientStop } from '../types';

const STOPS: TEditableGradientStop[] = [
  { color: '#ffffff', id: 'stop-1', opacity: 100, position: 0 },
  { color: '#000000', id: 'stop-2', opacity: 100, position: 1 },
];

const renderStopsList = (overrides: Partial<Parameters<typeof StopsList>[0]> = {}): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <StopsList
        canRemoveStop={false}
        onAddStop={vi.fn()}
        onRemoveStop={vi.fn()}
        onSelectStop={vi.fn()}
        onSetStopColor={vi.fn()}
        onSetStopPosition={vi.fn()}
        selectedStopId={null}
        stops={STOPS}
        {...overrides}
      />
    </TooltipProvider>,
  );

describe('StopsList behaviors', () => {
  it('should render one row per stop', () => {
    // before
    renderStopsList();

    // result
    expect(screen.getAllByLabelText('Stop color')).toHaveLength(2);
  });

  it('should add a stop at the midpoint when the add button is clicked', () => {
    // mock
    const onAddStop = vi.fn();

    // before
    renderStopsList({ onAddStop });

    // action
    fireEvent.click(screen.getByLabelText('Add stop'));

    // result
    expect(onAddStop).toHaveBeenCalledWith(0.5);
  });

  it('should open the full color picker for the clicked stop', () => {
    // before
    renderStopsList();

    // action
    fireEvent.click(screen.getAllByLabelText('Stop color')[0]);

    // result
    expect(screen.getByText('Custom')).toBeInTheDocument();
  });

  it('should select a stop when its row is clicked', () => {
    // mock
    const onSelectStop = vi.fn();

    // before
    renderStopsList({ onSelectStop });

    // action
    fireEvent.click(screen.getByDisplayValue('ffffff'));

    // result
    expect(onSelectStop).toHaveBeenCalledWith('stop-1');
  });

  it('should update a stop position via its row', () => {
    // mock
    const onSetStopPosition = vi.fn();

    // before
    renderStopsList({ onSetStopPosition });
    const input = screen.getAllByLabelText('Stop position')[1];

    // action
    fireEvent.change(input, { target: { value: '75' } });
    fireEvent.blur(input);

    // result
    expect(onSetStopPosition).toHaveBeenCalledWith('stop-2', 0.75);
  });

  it('should update a stop color via its row', () => {
    // mock
    const onSetStopColor = vi.fn();

    // before
    renderStopsList({ onSetStopColor });
    const input = screen.getAllByDisplayValue('ffffff')[0];

    // action
    fireEvent.change(input, { target: { value: '00ff00' } });
    fireEvent.blur(input);

    // result
    expect(onSetStopColor).toHaveBeenCalledWith('stop-1', { alpha: 100, hex: '#00ff00' });
  });

  it('should remove a stop via its row once removal is allowed', () => {
    // mock
    const onRemoveStop = vi.fn();

    // before
    renderStopsList({ canRemoveStop: true, onRemoveStop });

    // action
    fireEvent.click(screen.getAllByLabelText('Remove stop')[1]);

    // result
    expect(onRemoveStop).toHaveBeenCalledWith('stop-2');
  });

  it('should disable removal for every row when below the minimum stop count', () => {
    // before
    renderStopsList({ canRemoveStop: false });

    // result
    screen.getAllByLabelText('Remove stop').forEach((button) => expect(button).toBeDisabled());
  });

  it('should show the add-stop tooltip on focus', async () => {
    // before
    renderStopsList();

    // action
    fireEvent.focus(screen.getByLabelText('Add stop'));

    // result
    expect(await screen.findAllByText('Add stop', {}, { timeout: 2000 })).not.toHaveLength(0);
  });
});
