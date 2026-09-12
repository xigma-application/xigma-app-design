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
