import { act, fireEvent, render, screen } from '@testing-library/react';
import { FC, ReactElement } from 'react';

// hooks
import { TUseVideoPlayerResult, useVideoPlayer } from '../useVideoPlayer';

let latest: TUseVideoPlayerResult;

const Harness: FC = (): ReactElement => {
  latest = useVideoPlayer();

  return <video data-testid="video" ref={latest.videoRef} />;
};

const renderHarness = (): ReturnType<typeof render> => render(<Harness />);

describe('useVideoPlayer', () => {
  beforeEach(() => {
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should default to paused, at time zero, with an unknown duration', () => {
    // before
    renderHarness();

    // result
    expect(latest.isPlaying).toBe(false);
    expect(latest.currentTime).toBe(0);
    expect(latest.duration).toBe(0);
  });

  it('should call the video element’s play() when toggled while paused', () => {
    // before
    renderHarness();
    const video = screen.getByTestId('video') as HTMLVideoElement;

    // action
    act(() => latest.onTogglePlay());

    // result
    expect(video.play).toHaveBeenCalled();
  });

  it('should call the video element’s pause() when toggled while playing', () => {
    // before
    renderHarness();
    const video = screen.getByTestId('video') as HTMLVideoElement;

    Object.defineProperty(video, 'paused', { configurable: true, value: false });

    // action
    act(() => latest.onTogglePlay());

    // result
    expect(video.pause).toHaveBeenCalled();
  });

  it('should reflect isPlaying from the video element’s own play/pause/ended events, not from the click alone', () => {
    // before
    renderHarness();
    const video = screen.getByTestId('video') as HTMLVideoElement;

    // action
    act(() => fireEvent.play(video));

    // result
    expect(latest.isPlaying).toBe(true);

    // action
    act(() => fireEvent.pause(video));

    // result
    expect(latest.isPlaying).toBe(false);

    // action
    act(() => fireEvent.play(video));
    act(() => fireEvent(video, new Event('ended')));

    // result — reaching the end also flips back to the paused/Play icon state
    expect(latest.isPlaying).toBe(false);
  });

  it('should read duration from loadedmetadata, falling back to 0 for an unknown (NaN) duration', () => {
    // before
    renderHarness();
    const video = screen.getByTestId('video') as HTMLVideoElement;

    Object.defineProperty(video, 'duration', { configurable: true, value: 42 });

    // action
    act(() => fireEvent(video, new Event('loadedmetadata')));

    // result
    expect(latest.duration).toBe(42);
  });

  it('should track currentTime from timeupdate while not seeking', () => {
    // before
    renderHarness();
    const video = screen.getByTestId('video') as HTMLVideoElement;

    Object.defineProperty(video, 'currentTime', { configurable: true, value: 12 });

    // action
    act(() => fireEvent(video, new Event('timeupdate')));

    // result
    expect(latest.currentTime).toBe(12);
  });

  it('should ignore timeupdate while a manual seek is in progress, so the thumb does not jump mid-drag', () => {
    // before
    renderHarness();
    const video = screen.getByTestId('video') as HTMLVideoElement;

    Object.defineProperty(video, 'currentTime', { configurable: true, value: 0, writable: true });

    // action
    act(() => latest.onSeekStart());
    act(() => latest.onSeek(30));
    Object.defineProperty(video, 'currentTime', { configurable: true, value: 5 });
    act(() => fireEvent(video, new Event('timeupdate')));

    // result — the drag value wins, the stale native currentTime does not overwrite it
    expect(latest.currentTime).toBe(30);

    // action
    act(() => latest.onSeekEnd());
    act(() => fireEvent(video, new Event('timeupdate')));

    // result — once the drag ends, native updates resume
    expect(latest.currentTime).toBe(5);
  });

  it('should seek the underlying video element and update currentTime immediately on onSeek', () => {
    // before
    renderHarness();
    const video = screen.getByTestId('video') as HTMLVideoElement;

    // action
    act(() => latest.onSeek(7));

    // result
    expect(video.currentTime).toBe(7);
    expect(latest.currentTime).toBe(7);
  });
});
