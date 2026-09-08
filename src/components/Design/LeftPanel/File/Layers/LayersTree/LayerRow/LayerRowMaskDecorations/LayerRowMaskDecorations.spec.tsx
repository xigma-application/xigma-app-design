import { render, screen } from '@testing-library/react';

// components
import LayerRowMaskDecorations from './LayerRowMaskDecorations';

// types
import { TMaskConnectorLine } from 'store/design/selectors';

describe('LayerRowMaskDecorations', () => {
  it('should render the "Mask" badge for a mask node', () => {
    // before
    render(<LayerRowMaskDecorations isMask />);

    // result
    expect(screen.getByText('Mask')).toBeInTheDocument();
  });

  it('should render nothing for an ordinary node with no connector lines', () => {
    // before
    const { container } = render(<LayerRowMaskDecorations isMask={false} />);

    // result
    expect(container).toBeEmptyDOMElement();
  });

  it('should render the "start" connector line for the first masked row in a chain, unshifted at depthOffset 0', () => {
    // mock
    const lines: TMaskConnectorLine[] = [{ depthOffset: 0, role: 'masked-start' }];

    // before
    const { container } = render(<LayerRowMaskDecorations isMask={false} maskConnectorLines={lines} />);
    const line = container.querySelector<HTMLElement>('[class*="LayerRowMaskDecorations__line--start"]');

    // result
    expect(line).toBeInTheDocument();
    expect(line?.style.left).toBe('');
    expect(container.querySelector('[class*="LayerRowMaskDecorations__line--continue"]')).not.toBeInTheDocument();
    expect(container.querySelector('[class*="LayerRowMaskDecorations__lead"]')).not.toBeInTheDocument();
  });

  it('should render the "continue" connector line (own-chain-member style) for a directly masked row at depthOffset 0', () => {
    // mock
    const lines: TMaskConnectorLine[] = [{ depthOffset: 0, role: 'masked-continue' }];

    // before
    const { container } = render(<LayerRowMaskDecorations isMask={false} maskConnectorLines={lines} />);

    // result
    expect(
      container.querySelector('[class*="LayerRowMaskDecorations__line--continue"]:not([class*="continue-child"])'),
    ).toBeInTheDocument();
    expect(container.querySelector('[class*="LayerRowMaskDecorations__line--start"]')).not.toBeInTheDocument();
    expect(container.querySelector('[class*="LayerRowMaskDecorations__lead"]')).not.toBeInTheDocument();
  });

  it('should render the "continue-child" connector line for an inherited passthrough (depthOffset > 0), pulled back into the anchor’s own column', () => {
    // mock — two nesting levels deeper than the masked-start anchor
    const lines: TMaskConnectorLine[] = [{ depthOffset: 2, role: 'masked-continue' }];

    // before
    const { container } = render(<LayerRowMaskDecorations isMask={false} maskConnectorLines={lines} />);
    const line = container.querySelector<HTMLElement>('[class*="LayerRowMaskDecorations__line--continue-child"]');

    // result — jsdom folds the constant subtraction (26.5 - 2*21) down to a single length; the
    // per-level shift (MASK_CONNECTOR_DEPTH_SHIFT_PX, a live reference to TREE_ITEM_INDENT_PX)
    // exactly cancels the row's own marginLeft:depth*TREE_ITEM_INDENT_PX, landing the line at the
    // anchor's absolute screen column regardless of how deep this row itself is nested
    expect(line).toBeInTheDocument();
    expect(line?.style.left).toBe('calc(-15.5px)');
  });

  it('should render the lead arrowhead for a "mask" row', () => {
    // mock
    const lines: TMaskConnectorLine[] = [{ depthOffset: 0, role: 'mask' }];

    // before
    const { container } = render(<LayerRowMaskDecorations isMask maskConnectorLines={lines} />);

    // result
    expect(container.querySelector('[class*="LayerRowMaskDecorations__lead"]')).toBeInTheDocument();
    expect(container.querySelector('[class*="LayerRowMaskDecorations__line--start"]')).not.toBeInTheDocument();
    expect(container.querySelector('[class*="LayerRowMaskDecorations__line--continue"]')).not.toBeInTheDocument();
    expect(screen.getByText('Mask')).toBeInTheDocument();
  });

  it('should render nothing for an unrecognized connector line role', () => {
    // mock
    const lines = [{ depthOffset: 0, role: 'unknown' }] as unknown as TMaskConnectorLine[];

    // before
    const { container } = render(<LayerRowMaskDecorations isMask={false} maskConnectorLines={lines} />);

    // result
    expect(container).toBeEmptyDOMElement();
  });

  it('should render both an own-scope line and an inherited passthrough line at once, for a row that is masked content of an outer chain while also owning a nested mask scope', () => {
    // mock — same shape selectMaskConnectorRoleById produces for a masked-start row of an inner
    // mask group that itself sits inside an outer chain
    const lines: TMaskConnectorLine[] = [
      { depthOffset: 0, role: 'masked-start' },
      { depthOffset: 1, role: 'masked-continue' },
    ];

    // before
    const { container } = render(<LayerRowMaskDecorations isMask={false} maskConnectorLines={lines} />);

    // result — one own-column "start" line, plus one shifted "continue-child" passthrough line
    expect(container.querySelector('[class*="LayerRowMaskDecorations__line--start"]')).toBeInTheDocument();

    const passthrough = container.querySelector<HTMLElement>('[class*="LayerRowMaskDecorations__line--continue-child"]');
    expect(passthrough).toBeInTheDocument();
    expect(passthrough?.style.left).toBe('calc(5.5px)');
  });
});
