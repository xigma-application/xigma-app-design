import { render } from '@testing-library/react';

// components
import HueSlider from './HueSlider';

describe('HueSlider snapshots', () => {
  it('should render HueSlider with the thumb positioned from hue', () => {
    // before
    const { asFragment } = render(<HueSlider hue={180} onChange={vi.fn()} />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('HueSlider behaviors', () => {
  it('should report a hue change on pointer down', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { container } = render(<HueSlider hue={0} onChange={onChange} />);
    const track = container.firstChild as HTMLDivElement;

    vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({ height: 16, left: 0, top: 0, width: 100 } as DOMRect);

    // action
    track.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 50, clientY: 0, pointerId: 1 }));

    // result
    expect(onChange).toHaveBeenCalledWith({ h: 180 });
  });

  it('should report onDragStart on pointer down and onDragEnd on pointer up', () => {
    // mock
    const onDragEnd = vi.fn();
    const onDragStart = vi.fn();

    // before
    const { container } = render(<HueSlider hue={0} onChange={vi.fn()} onDragEnd={onDragEnd} onDragStart={onDragStart} />);
    const track = container.firstChild as HTMLDivElement;

    vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({ height: 16, left: 0, top: 0, width: 100 } as DOMRect);

    // action
    track.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 50, clientY: 0, pointerId: 1 }));
    track.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1 }));

    // result
    expect(onDragStart).toHaveBeenCalledTimes(1);
    expect(onDragEnd).toHaveBeenCalledTimes(1);
  });
});
