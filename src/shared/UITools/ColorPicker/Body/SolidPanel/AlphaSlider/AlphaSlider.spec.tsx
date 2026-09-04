import { render } from '@testing-library/react';

// components
import AlphaSlider from './AlphaSlider';

describe('AlphaSlider snapshots', () => {
  it('should render AlphaSlider with the thumb positioned from alpha', () => {
    // before
    const { asFragment } = render(<AlphaSlider alpha={50} color="#ff0000" onChange={vi.fn()} />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('AlphaSlider behaviors', () => {
  it('should report an alpha change on pointer down', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { container } = render(<AlphaSlider alpha={0} color="#ff0000" onChange={onChange} />);
    const track = container.firstChild as HTMLDivElement;

    vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({ height: 16, left: 0, top: 0, width: 100 } as DOMRect);

    // action
    track.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 25, clientY: 0, pointerId: 1 }));

    // result
    expect(onChange).toHaveBeenCalledWith(25);
  });

  it('should report onDragStart on pointer down and onDragEnd on pointer up', () => {
    // mock
    const onDragEnd = vi.fn();
    const onDragStart = vi.fn();

    // before
    const { container } = render(
      <AlphaSlider alpha={0} color="#ff0000" onChange={vi.fn()} onDragEnd={onDragEnd} onDragStart={onDragStart} />,
    );
    const track = container.firstChild as HTMLDivElement;

    vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({ height: 16, left: 0, top: 0, width: 100 } as DOMRect);

    // action
    track.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 25, clientY: 0, pointerId: 1 }));
    track.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1 }));

    // result
    expect(onDragStart).toHaveBeenCalledTimes(1);
    expect(onDragEnd).toHaveBeenCalledTimes(1);
  });
});
