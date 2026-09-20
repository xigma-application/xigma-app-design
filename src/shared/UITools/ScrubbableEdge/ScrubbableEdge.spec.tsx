import { fireEvent, render } from '@testing-library/react';

// components
import ScrubbableEdge from './ScrubbableEdge';

describe('ScrubbableEdge', () => {
  it('should report the start and the end of a drag through the scrubber events', () => {
    // mock
    const onDragEnd = vi.fn();
    const onDragStart = vi.fn();
    const { container } = render(
      <ScrubbableEdge max={100} min={0} onChange={vi.fn()} onDragEnd={onDragEnd} onDragStart={onDragStart} value={10} />,
    );
    const scrubber = container.firstElementChild as HTMLElement;

    // action
    fireEvent.mouseDown(scrubber, { clientX: 10, clientY: 10 });
    fireEvent.mouseUp(scrubber);

    // result
    expect(onDragStart).toHaveBeenCalledTimes(1);
    expect(onDragEnd).toHaveBeenCalledTimes(1);
  });
});
