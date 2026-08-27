import { render, screen } from '@testing-library/react';

// components
import ColorResult from './ColorResult';

// others
import { SAMPLE_GRID_MIDDLE_INDEX } from '../constants';

describe('ColorResult snapshots', () => {
  it('should render the sampled center color as a hex value', () => {
    // mock
    const colors = Array.from({ length: 49 }, () => ({ a: 255, b: 0, g: 0, r: 0 }));

    colors[SAMPLE_GRID_MIDDLE_INDEX] = { a: 255, b: 0, g: 128, r: 255 };

    // before
    render(<ColorResult colors={colors} />);

    // result
    expect(screen.getByText('#ff8000')).toBeInTheDocument();
  });

  it('should fall back to black when no colors have been sampled yet', () => {
    // before
    render(<ColorResult colors={[]} />);

    // result
    expect(screen.getByText('#000000')).toBeInTheDocument();
  });
});
