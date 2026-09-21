import { render, screen } from '@testing-library/react';

// components
import SelectionColorPreview from './SelectionColorPreview';

// types
import { TSelectionColorGroup } from '../../types';

const buildGroup = (color: string): TSelectionColorGroup => ({
  key: color,
  occurrences: [{ index: 0, nodeId: color, property: 'fills' }],
  paint: { color, opacity: 100, type: 'solid' },
  signature: color,
});

describe('SelectionColorPreview', () => {
  it('should render one swatch per group when there are 3 or fewer, with no overflow text', () => {
    // before
    const { container } = render(<SelectionColorPreview groups={[buildGroup('#ff0000'), buildGroup('#00ff00')]} />);

    // result
    expect(container.querySelectorAll('[class*="__swatch"]')).toHaveLength(2);
    expect(container.querySelector('[class*="__overflow"]')).not.toBeInTheDocument();
  });

  it('should cap the swatches at 3 and show how many more colors there are', () => {
    // before
    const { container } = render(
      <SelectionColorPreview groups={[buildGroup('#ff0000'), buildGroup('#00ff00'), buildGroup('#0000ff'), buildGroup('#ffff00')]} />,
    );

    // result
    expect(container.querySelectorAll('[class*="__swatch"]')).toHaveLength(3);
    expect(screen.getByText('+1')).toBeInTheDocument();
  });

  it('should paint each swatch with its group’s color and opacity', () => {
    // before
    const { container } = render(
      <SelectionColorPreview groups={[{ ...buildGroup('#ff0000'), paint: { color: '#ff0000', opacity: 50, type: 'solid' } }]} />,
    );
    const swatch = container.querySelector('[class*="__swatch"]');

    // result
    expect(swatch).toHaveStyle({ backgroundColor: 'rgba(255, 0, 0, 0.5)' });
  });
});
