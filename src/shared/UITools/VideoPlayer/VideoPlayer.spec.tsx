import { fireEvent, render, screen } from '@testing-library/react';

// components
import VideoPlayer from './VideoPlayer';

const noop = (): void => {};

describe('VideoPlayer snapshots', () => {
  it('should render VideoPlayer', () => {
    // before
    const { asFragment } = render(<VideoPlayer currentTime={0} duration={60} isPlaying={false} onSeek={noop} onTogglePlay={noop} />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('VideoPlayer behaviors', () => {
  it('should show the Play icon and label while paused', () => {
    // before
    render(<VideoPlayer currentTime={0} duration={60} isPlaying={false} onSeek={noop} onTogglePlay={noop} />);

    // result
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();
  });

  it('should show the Pause icon and label while playing', () => {
    // before
    render(<VideoPlayer currentTime={0} duration={60} isPlaying onSeek={noop} onTogglePlay={noop} />);

    // result
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();
  });

  it('should call onTogglePlay when the play/pause button is clicked', () => {
    // mock
    const onTogglePlay = vi.fn();

    // before
    render(<VideoPlayer currentTime={0} duration={60} isPlaying={false} onSeek={noop} onTogglePlay={onTogglePlay} />);

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Play' }));

    // result
    expect(onTogglePlay).toHaveBeenCalled();
  });

  it('should render the seek slider using the no-progress-fill video variant', () => {
    // before
    const { container } = render(<VideoPlayer currentTime={30} duration={60} isPlaying={false} onSeek={noop} onTogglePlay={noop} />);

    // result
    expect(container.querySelector('[class*="SliderTrack--video"]')).not.toBeNull();
    expect(container.querySelector('[class*="SliderTrack__fill"]')).toBeNull();
  });

  it('should show elapsed time, counting up as currentTime advances', () => {
    // before
    const { rerender } = render(<VideoPlayer currentTime={0} duration={60} isPlaying={false} onSeek={noop} onTogglePlay={noop} />);

    // result
    expect(screen.getByText('00:00')).toBeInTheDocument();

    // action
    rerender(<VideoPlayer currentTime={45} duration={60} isPlaying={false} onSeek={noop} onTogglePlay={noop} />);

    // result
    expect(screen.getByText('00:45')).toBeInTheDocument();
  });

  it('should call onSeek with a value derived from the pointer position when the track is clicked', () => {
    // mock
    const onSeek = vi.fn();

    // before
    render(<VideoPlayer currentTime={0} duration={60} isPlaying={false} onSeek={onSeek} onTogglePlay={noop} />);
    const track = screen.getByRole('slider', { name: 'Seek' });

    vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({ height: 0, left: 0, top: 0, width: 100 } as DOMRect);

    // action
    fireEvent.pointerDown(track, { clientX: 50, pointerId: 1 });

    // result
    expect(onSeek).toHaveBeenCalledWith(30);
  });

  it('should call onSeekStart and onSeekEnd around a drag', () => {
    // mock
    const onSeekStart = vi.fn();
    const onSeekEnd = vi.fn();

    // before
    render(
      <VideoPlayer
        currentTime={0}
        duration={60}
        isPlaying={false}
        onSeek={noop}
        onSeekEnd={onSeekEnd}
        onSeekStart={onSeekStart}
        onTogglePlay={noop}
      />,
    );
    const track = screen.getByRole('slider', { name: 'Seek' });

    vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({ height: 0, left: 0, top: 0, width: 100 } as DOMRect);
    track.setPointerCapture = vi.fn();
    track.releasePointerCapture = vi.fn();

    // action
    fireEvent.pointerDown(track, { clientX: 0, pointerId: 1 });

    // result
    expect(onSeekStart).toHaveBeenCalled();

    // action
    fireEvent.pointerUp(track, { pointerId: 1 });

    // result
    expect(onSeekEnd).toHaveBeenCalled();
  });

  it('should fall back to English default aria labels when none are given', () => {
    // before
    render(<VideoPlayer currentTime={0} duration={60} isPlaying={false} onSeek={noop} onTogglePlay={noop} />);

    // result
    expect(screen.getByRole('slider', { name: 'Seek' })).toBeInTheDocument();
  });

  it('should use given aria labels over the defaults', () => {
    // before
    render(
      <VideoPlayer
        currentTime={0}
        duration={60}
        isPlaying={false}
        onSeek={noop}
        onTogglePlay={noop}
        pauseAriaLabel="Wstrzymaj"
        playAriaLabel="Odtwórz"
        seekAriaLabel="Przewiń"
      />,
    );

    // result
    expect(screen.getByRole('button', { name: 'Odtwórz' })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: 'Przewiń' })).toBeInTheDocument();
  });
});
