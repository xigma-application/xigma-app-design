import { render } from '@testing-library/react';

// components
import GridTrackDropIndicator, { GRID_TRACK_ROW_STEP } from './GridTrackDropIndicator';

describe('GridTrackDropIndicator', () => {
  it('should render a single absolutely-positioned indicator element', () => {
    const { container } = render(<GridTrackDropIndicator index={0} />);
    const element = container.firstChild as HTMLElement;

    expect(element).toBeInstanceOf(HTMLDivElement);
    expect(element.style.transform).toBe('translateY(0px)');
  });

  it('should offset the indicator by the row step per index', () => {
    const { container } = render(<GridTrackDropIndicator index={3} />);
    const element = container.firstChild as HTMLElement;

    expect(element.style.transform).toBe(`translateY(${3 * GRID_TRACK_ROW_STEP}px)`);
  });
});
