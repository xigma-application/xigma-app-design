import { render } from '@testing-library/react';

// components
import SaturationMap from './SaturationMap';

describe('SaturationMap snapshots', () => {
  it('should render SaturationMap with the thumb positioned from saturation/value', () => {
    // before
    const { asFragment } = render(<SaturationMap hsv={{ h: 0, s: 100, v: 100 }} onChange={vi.fn()} />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('SaturationMap behaviors', () => {
  it('should report a saturation/value change on pointer down', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { container } = render(<SaturationMap hsv={{ h: 0, s: 0, v: 0 }} onChange={onChange} />);
    const track = container.querySelector('[class*="SaturationMap__input"]') as HTMLDivElement;

    vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({ height: 100, left: 0, top: 0, width: 100 } as DOMRect);

    // action
    track.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 25, clientY: 25, pointerId: 1 }));

    // result
    expect(onChange).toHaveBeenCalledWith({ s: 25, v: 75 });
  });

  it('should report onDragStart on pointer down and onDragEnd on pointer up', () => {
    // mock
    const onDragEnd = vi.fn();
    const onDragStart = vi.fn();

    // before
    const { container } = render(
      <SaturationMap hsv={{ h: 0, s: 0, v: 0 }} onChange={vi.fn()} onDragEnd={onDragEnd} onDragStart={onDragStart} />,
    );
    const track = container.querySelector('[class*="SaturationMap__input"]') as HTMLDivElement;

    vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({ height: 100, left: 0, top: 0, width: 100 } as DOMRect);

    // action
    track.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 25, clientY: 25, pointerId: 1 }));
    track.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1 }));

    // result
    expect(onDragStart).toHaveBeenCalledTimes(1);
    expect(onDragEnd).toHaveBeenCalledTimes(1);
  });
});
