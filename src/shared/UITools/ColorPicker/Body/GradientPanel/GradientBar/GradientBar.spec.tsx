import { render, screen } from '@testing-library/react';

// components
import GradientBar from './GradientBar';

// types
import { TEditableGradientStop } from '../types';

const STOPS: TEditableGradientStop[] = [
  { color: '#ffffff', id: 'stop-1', opacity: 100, position: 0 },
  { color: '#000000', id: 'stop-2', opacity: 100, position: 1 },
];

describe('GradientBar snapshots', () => {
  it('should render a thumb for each stop', () => {
    // before
    const { asFragment } = render(
      <GradientBar onAddStop={vi.fn()} onMoveStop={vi.fn()} onSelectStop={vi.fn()} selectedStopId="stop-1" stops={STOPS} />,
    );

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('GradientBar behaviors', () => {
  it('should render one thumb per stop', () => {
    // before
    render(<GradientBar onAddStop={vi.fn()} onMoveStop={vi.fn()} onSelectStop={vi.fn()} selectedStopId={null} stops={STOPS} />);

    // result
    expect(screen.getAllByLabelText('Stop marker')).toHaveLength(2);
  });

  it('should add a stop when the track background is clicked', () => {
    // mock
    const onAddStop = vi.fn();

    // before
    const { container } = render(
      <GradientBar onAddStop={onAddStop} onMoveStop={vi.fn()} onSelectStop={vi.fn()} selectedStopId={null} stops={STOPS} />,
    );
    const track = container.querySelector('[data-no-drag]') as HTMLDivElement;

    vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({ height: 24, left: 0, top: 0, width: 200 } as DOMRect);

    // action
    track.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 50, pointerId: 1 }));

    // result
    expect(onAddStop).toHaveBeenCalledWith(0.25);
  });

  it('should select a stop, not add one, when a thumb is clicked', () => {
    // mock
    const onAddStop = vi.fn();
    const onSelectStop = vi.fn();

    // before
    render(<GradientBar onAddStop={onAddStop} onMoveStop={vi.fn()} onSelectStop={onSelectStop} selectedStopId={null} stops={STOPS} />);
    const thumb = screen.getAllByLabelText('Stop marker')[0];

    // action
    thumb.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 0, pointerId: 1 }));

    // result
    expect(onSelectStop).toHaveBeenCalledWith('stop-1');
    expect(onAddStop).not.toHaveBeenCalled();
  });

  it('should move the dragged stop while the button is pressed, tracked window-wide so crossing another stop cannot steal it', () => {
    // mock
    const onMoveStop = vi.fn();

    // before
    const { container } = render(
      <GradientBar onAddStop={vi.fn()} onMoveStop={onMoveStop} onSelectStop={vi.fn()} selectedStopId={null} stops={STOPS} />,
    );
    const track = container.querySelector('[data-no-drag]') as HTMLDivElement;

    vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({ height: 24, left: 0, top: 0, width: 200 } as DOMRect);

    const thumb = screen.getAllByLabelText('Stop marker')[1];

    // action — the drag starts on the thumb itself, but is then tracked on window, not the thumb
    thumb.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 200, pointerId: 1 }));
    window.dispatchEvent(new PointerEvent('pointermove', { clientX: 100, pointerId: 1 }));

    // result
    expect(onMoveStop).toHaveBeenCalledWith('stop-2', 0.5);
  });
});
