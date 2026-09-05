import { render } from '@testing-library/react';

// components
import OptionIndicators from './OptionIndicators';

// types
import { AlignmentLayout } from 'types/design/enums';

describe('OptionIndicators', () => {
  it('should render three flat indicators when not wrapping', () => {
    // before
    const { container } = render(
      <OptionIndicators alignment={AlignmentLayout.topLeft} isHighlighted={false} isSelected={false} isWrap={false} />,
    );

    // result
    expect(container.querySelectorAll('[class*="AlignmentOption__indicator"]')).toHaveLength(3);
    expect(container.querySelectorAll('[class*="wrap-row"]')).toHaveLength(0);
  });

  it('should mark every flat indicator as highlighted and selected when both flags are set', () => {
    // before
    const { container } = render(<OptionIndicators alignment={AlignmentLayout.topLeft} isHighlighted isSelected isWrap={false} />);

    // result
    expect(container.querySelectorAll('[class*="indicator--highlighted"]')).toHaveLength(3);
    expect(container.querySelectorAll('[class*="indicator--selected"]')).toHaveLength(3);
  });

  it('should render a 3-then-2 two-row layout, left-aligned for a left-column alignment, when wrapping', () => {
    // before
    const { container } = render(<OptionIndicators alignment={AlignmentLayout.topLeft} isHighlighted={false} isSelected={false} isWrap />);

    // result
    const rows = container.querySelectorAll('[class*="wrap-row"]');
    expect(rows).toHaveLength(2);
    expect(rows[0].querySelectorAll('[class*="AlignmentOption__indicator"]')).toHaveLength(3);
    expect(rows[1].querySelectorAll('[class*="AlignmentOption__indicator"]')).toHaveLength(2);
    expect(rows[0]).toHaveStyle({ justifyContent: 'flex-start' });
    expect(rows[1]).toHaveStyle({ justifyContent: 'flex-start' });
  });

  it('should center both wrap rows for a center-column alignment', () => {
    // before
    const { container } = render(<OptionIndicators alignment={AlignmentLayout.center} isHighlighted={false} isSelected={false} isWrap />);

    // result
    const rows = container.querySelectorAll('[class*="wrap-row"]');
    expect(rows[0]).toHaveStyle({ justifyContent: 'center' });
    expect(rows[1]).toHaveStyle({ justifyContent: 'center' });
  });

  it('should right-align both wrap rows for a right-column alignment', () => {
    // before
    const { container } = render(
      <OptionIndicators alignment={AlignmentLayout.bottomRight} isHighlighted={false} isSelected={false} isWrap />,
    );

    // result
    const rows = container.querySelectorAll('[class*="wrap-row"]');
    expect(rows[0]).toHaveStyle({ justifyContent: 'flex-end' });
    expect(rows[1]).toHaveStyle({ justifyContent: 'flex-end' });
  });
});
