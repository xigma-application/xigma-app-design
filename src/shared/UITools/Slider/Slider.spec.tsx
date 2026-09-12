import { render, screen } from '@testing-library/react';

// components
import Slider from './Slider';

describe('Slider snapshots', () => {
  it('should render the track positioned from value', () => {
    // before
    const { asFragment } = render(<Slider max={100} min={0} onChange={vi.fn()} value={50} />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render the legends row below the track when a mark carries a label', () => {
    // before
    const { asFragment } = render(<Slider marks={[{ label: 'iOS', value: 60 }]} max={100} min={0} onChange={vi.fn()} value={0} />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('Slider behaviors', () => {
  it('should render a slider role', () => {
    // before
    render(<Slider max={100} min={0} onChange={vi.fn()} value={0} />);

    // result
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  it('should render no legends row when no mark carries a label', () => {
    // before
    const { container } = render(<Slider marks={[{ value: 60 }]} max={100} min={0} onChange={vi.fn()} value={0} />);

    // result
    expect(container.querySelector('[class*="SliderLegends"]')).toBeNull();
    expect(container.querySelector('[class*="SliderTrack__mark"]')).not.toBeNull();
  });

  it('should render no legends row by default, with no marks given', () => {
    // before
    const { container } = render(<Slider max={100} min={0} onChange={vi.fn()} value={0} />);

    // result
    expect(container.querySelector('[class*="SliderLegends"]')).toBeNull();
  });

  it('should render the legends row and its label text once a mark carries one', () => {
    // before
    render(<Slider marks={[{ label: 'iOS', value: 60 }]} max={100} min={0} onChange={vi.fn()} value={0} />);

    // result
    expect(screen.getByText('iOS')).toBeInTheDocument();
  });

  it('should report a value derived from the pointer position within an arbitrary min/max range', () => {
    // mock
    const onChange = vi.fn();

    // before
    render(<Slider max={200} min={100} onChange={onChange} value={100} />);
    const track = screen.getByRole('slider') as HTMLDivElement;

    vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({ height: 24, left: 0, top: 0, width: 100 } as DOMRect);

    // action — a quarter of the way across a [100, 200] range lands on 125
    track.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 25, clientY: 0, pointerId: 1 }));

    // result
    expect(onChange).toHaveBeenCalledWith(125);
  });

  it('should report onDragStart on pointer down and onDragEnd on pointer up', () => {
    // mock
    const onDragEnd = vi.fn();
    const onDragStart = vi.fn();

    // before
    render(<Slider max={100} min={0} onChange={vi.fn()} onDragEnd={onDragEnd} onDragStart={onDragStart} value={0} />);
    const track = screen.getByRole('slider') as HTMLDivElement;

    vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({ height: 24, left: 0, top: 0, width: 100 } as DOMRect);

    // action
    track.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 25, clientY: 0, pointerId: 1 }));
    track.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1 }));

    // result
    expect(onDragStart).toHaveBeenCalledTimes(1);
    expect(onDragEnd).toHaveBeenCalledTimes(1);
  });

  it('should ignore pointer move while no button is pressed', () => {
    // mock
    const onChange = vi.fn();

    // before
    render(<Slider max={100} min={0} onChange={onChange} value={0} />);
    const track = screen.getByRole('slider') as HTMLDivElement;

    vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({ height: 24, left: 0, top: 0, width: 100 } as DOMRect);

    // action
    track.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, buttons: 0, clientX: 50, clientY: 0, pointerId: 1 }));

    // result
    expect(onChange).not.toHaveBeenCalled();
  });

  it('should report a value on pointer move while the button is held', () => {
    // mock
    const onChange = vi.fn();

    // before
    render(<Slider max={100} min={0} onChange={onChange} value={0} />);
    const track = screen.getByRole('slider') as HTMLDivElement;

    vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({ height: 24, left: 0, top: 0, width: 100 } as DOMRect);

    // action
    track.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, buttons: 1, clientX: 75, clientY: 0, pointerId: 1 }));

    // result
    expect(onChange).toHaveBeenCalledWith(75);
  });
});
