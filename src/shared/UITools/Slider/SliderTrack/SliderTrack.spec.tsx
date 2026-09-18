import { render, screen } from '@testing-library/react';

// components
import SliderTrack from './SliderTrack';

const noop = (): void => {};

describe('SliderTrack snapshots', () => {
  it('should render the rail, fill, marks, and thumb positioned from value', () => {
    // before
    const { asFragment } = render(
      <SliderTrack
        marks={[{ value: 60 }]}
        max={100}
        min={0}
        onPointerDown={noop}
        onPointerMove={noop}
        onPointerUp={noop}
        trackRef={{ current: null }}
        value={50}
      />,
    );

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('SliderTrack behaviors', () => {
  it('should render one mark dot per given mark', () => {
    // before
    const { container } = render(
      <SliderTrack
        marks={[{ value: 30 }, { value: 60 }]}
        max={100}
        min={0}
        onPointerDown={noop}
        onPointerMove={noop}
        onPointerUp={noop}
        trackRef={{ current: null }}
        value={0}
      />,
    );

    // result
    expect(container.querySelectorAll('[class*="SliderTrack__mark"]')).toHaveLength(2);
  });

  it('should render no marks by default', () => {
    // before
    const { container } = render(
      <SliderTrack
        marks={[]}
        max={100}
        min={0}
        onPointerDown={noop}
        onPointerMove={noop}
        onPointerUp={noop}
        trackRef={{ current: null }}
        value={0}
      />,
    );

    // result
    expect(container.querySelector('[class*="SliderTrack__mark"]')).toBeNull();
  });

  it('should not mark the thumb active when the value is at its minimum', () => {
    // before
    const { container } = render(
      <SliderTrack
        marks={[]}
        max={100}
        min={0}
        onPointerDown={noop}
        onPointerMove={noop}
        onPointerUp={noop}
        trackRef={{ current: null }}
        value={0}
      />,
    );

    // result
    expect(container.querySelector('[class*="SliderTrack__thumb--active"]')).toBeNull();
  });

  it('should mark the thumb active once the value moves off its minimum', () => {
    // before
    const { container } = render(
      <SliderTrack
        marks={[]}
        max={100}
        min={0}
        onPointerDown={noop}
        onPointerMove={noop}
        onPointerUp={noop}
        trackRef={{ current: null }}
        value={1}
      />,
    );

    // result
    expect(container.querySelector('[class*="SliderTrack__thumb--active"]')).not.toBeNull();
  });

  it('should render no base dot by default (baseValue defaults to min)', () => {
    // before
    const { container } = render(
      <SliderTrack
        marks={[]}
        max={100}
        min={-100}
        onPointerDown={noop}
        onPointerMove={noop}
        onPointerUp={noop}
        trackRef={{ current: null }}
        value={0}
      />,
    );

    // result
    expect(container.querySelector('[class*="SliderTrack__baseDot"]')).toBeNull();
  });

  it('should render a base dot at baseValue once it differs from min', () => {
    // before
    const { container } = render(
      <SliderTrack
        baseValue={0}
        marks={[]}
        max={100}
        min={-100}
        onPointerDown={noop}
        onPointerMove={noop}
        onPointerUp={noop}
        trackRef={{ current: null }}
        value={0}
      />,
    );

    // result
    expect(container.querySelector('[class*="SliderTrack__baseDot"]')).not.toBeNull();
  });

  it('should not mark the thumb active while the value sits exactly on a non-min baseValue', () => {
    // before — the handle returns to its neutral/inactive look once back at the base point
    const { container } = render(
      <SliderTrack
        baseValue={0}
        marks={[]}
        max={100}
        min={-100}
        onPointerDown={noop}
        onPointerMove={noop}
        onPointerUp={noop}
        trackRef={{ current: null }}
        value={0}
      />,
    );

    // result
    expect(container.querySelector('[class*="SliderTrack__thumb--active"]')).toBeNull();
  });

  it('should mark the thumb active once the value moves off a non-min baseValue', () => {
    // before
    const { container } = render(
      <SliderTrack
        baseValue={0}
        marks={[]}
        max={100}
        min={-100}
        onPointerDown={noop}
        onPointerMove={noop}
        onPointerUp={noop}
        trackRef={{ current: null }}
        value={20}
      />,
    );

    // result
    expect(container.querySelector('[class*="SliderTrack__thumb--active"]')).not.toBeNull();
  });

  it('should fill from the base point toward the value on either side of it', () => {
    // before — dragging left of a centered base point (0 in a [-100,100] range) fills leftward
    const { container } = render(
      <SliderTrack
        baseValue={0}
        marks={[]}
        max={100}
        min={-100}
        onPointerDown={noop}
        onPointerMove={noop}
        onPointerUp={noop}
        trackRef={{ current: null }}
        value={-50}
      />,
    );
    const fill = container.querySelector('[class*="SliderTrack__fill"]') as HTMLElement;

    // result — fill's left edge sits at the (lower) thumb position, not at the track's own start
    expect(fill.style.left).not.toBe('0px');
    expect(fill.style.width).toBe('');
  });

  it('should expose its aria attributes from the given range and value', () => {
    // before
    render(
      <SliderTrack
        ariaLabel="Corner smoothing"
        marks={[]}
        max={100}
        min={0}
        onPointerDown={noop}
        onPointerMove={noop}
        onPointerUp={noop}
        trackRef={{ current: null }}
        value={30}
      />,
    );

    // result
    const track = screen.getByRole('slider', { name: 'Corner smoothing' });

    expect(track).toHaveAttribute('aria-valuemin', '0');
    expect(track).toHaveAttribute('aria-valuemax', '100');
    expect(track).toHaveAttribute('aria-valuenow', '30');
  });

  it('should not apply the compact modifier by default', () => {
    // before
    const { container } = render(
      <SliderTrack
        marks={[]}
        max={100}
        min={0}
        onPointerDown={noop}
        onPointerMove={noop}
        onPointerUp={noop}
        trackRef={{ current: null }}
        value={0}
      />,
    );

    // result
    expect(container.querySelector('[class*="SliderTrack--compact"]')).toBeNull();
  });

  it('should apply the compact modifier and use the smaller thumb radius when variant is compact', () => {
    // before
    const { container } = render(
      <SliderTrack
        marks={[]}
        max={100}
        min={0}
        onPointerDown={noop}
        onPointerMove={noop}
        onPointerUp={noop}
        trackRef={{ current: null }}
        value={50}
        variant="compact"
      />,
    );
    const thumb = container.querySelector('[class*="SliderTrack__thumb"]') as HTMLElement;

    // result — the compact class is present, and the thumb offset uses the 6px compact radius
    // (getThumbOffset(0.5, 6) === "calc(6px + 0.5 * (100% - 12px))"), not the default 8px radius
    expect(container.querySelector('[class*="SliderTrack--compact"]')).not.toBeNull();
    expect(thumb.style.left).toBe('calc(6px + 0.5 * (100% - 12px))');
  });

  it('should apply the video modifier and use the video thumb radius, so the thumb sits flush inside the rail', () => {
    // before
    const { container } = render(
      <SliderTrack
        marks={[]}
        max={100}
        min={0}
        onPointerDown={noop}
        onPointerMove={noop}
        onPointerUp={noop}
        trackRef={{ current: null }}
        value={50}
        variant="video"
      />,
    );
    const thumb = container.querySelector('[class*="SliderTrack__thumb"]') as HTMLElement;

    // result
    expect(container.querySelector('[class*="SliderTrack--video"]')).not.toBeNull();
    expect(thumb.style.left).toBe('calc(7px + 0.5 * (100% - 14px))');
  });

  it('should render no progress fill for the video variant, so the whole track keeps one uniform background', () => {
    // before
    const { container } = render(
      <SliderTrack
        marks={[]}
        max={100}
        min={0}
        onPointerDown={noop}
        onPointerMove={noop}
        onPointerUp={noop}
        trackRef={{ current: null }}
        value={50}
        variant="video"
      />,
    );

    // result
    expect(container.querySelector('[class*="SliderTrack__fill"]')).toBeNull();
  });

  it('should never mark the video-variant thumb active, even off its minimum, since there is no progress color to match', () => {
    // before
    const { container } = render(
      <SliderTrack
        marks={[]}
        max={100}
        min={0}
        onPointerDown={noop}
        onPointerMove={noop}
        onPointerUp={noop}
        trackRef={{ current: null }}
        value={50}
        variant="video"
      />,
    );

    // result
    expect(container.querySelector('[class*="SliderTrack__thumb--active"]')).toBeNull();
  });

  it('should call the given pointer handlers', () => {
    // mock
    const onPointerDown = vi.fn();
    const onPointerMove = vi.fn();
    const onPointerUp = vi.fn();

    // before
    render(
      <SliderTrack
        marks={[]}
        max={100}
        min={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        trackRef={{ current: null }}
        value={0}
      />,
    );
    const track = screen.getByRole('slider');

    // action
    track.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1 }));
    track.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerId: 1 }));
    track.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1 }));

    // result
    expect(onPointerDown).toHaveBeenCalledTimes(1);
    expect(onPointerMove).toHaveBeenCalledTimes(1);
    expect(onPointerUp).toHaveBeenCalledTimes(1);
  });
});
