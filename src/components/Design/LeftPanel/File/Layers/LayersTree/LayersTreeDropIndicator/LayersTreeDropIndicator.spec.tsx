import { render } from '@testing-library/react';

// components
import LayersTreeDropIndicator from './LayersTreeDropIndicator';

// others
import { LAYERS_TREE_DROP_INDICATOR_ICON_OFFSET_PX } from './constants';

describe('LayersTreeDropIndicator', () => {
  it('should render the line element, with the dot drawn as its ::after pseudo-element', () => {
    // before
    const { container } = render(<LayersTreeDropIndicator />);

    // result
    expect(container.querySelector('[class*="LayersTreeDropIndicator"]')).toBeInTheDocument();
  });

  it('should default to depth 0 when no depth is given', () => {
    // before
    const { container } = render(<LayersTreeDropIndicator />);
    const indicator = container.querySelector('[class*="LayersTreeDropIndicator"]') as HTMLElement;

    // result
    expect(indicator.style.marginLeft).toBe(`${LAYERS_TREE_DROP_INDICATOR_ICON_OFFSET_PX}px`);
  });

  it('should shift the indicator right by the same constant amount for each additional nesting level', () => {
    // before
    const { container: atDepthOne } = render(<LayersTreeDropIndicator depth={1} />);
    const { container: atDepthTwo } = render(<LayersTreeDropIndicator depth={2} />);
    const indicatorAtDepthOne = atDepthOne.querySelector('[class*="LayersTreeDropIndicator"]') as HTMLElement;
    const indicatorAtDepthTwo = atDepthTwo.querySelector('[class*="LayersTreeDropIndicator"]') as HTMLElement;

    // result
    const marginAtDepthOne = Number(indicatorAtDepthOne.style.marginLeft.replace('px', ''));
    const marginAtDepthTwo = Number(indicatorAtDepthTwo.style.marginLeft.replace('px', ''));
    const marginAtDepthZero = LAYERS_TREE_DROP_INDICATOR_ICON_OFFSET_PX;

    expect(marginAtDepthOne - marginAtDepthZero).toBe(marginAtDepthTwo - marginAtDepthOne);
  });
});
