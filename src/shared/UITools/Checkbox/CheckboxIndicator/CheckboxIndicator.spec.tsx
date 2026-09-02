import { render } from '@testing-library/react';

// components
import CheckboxIndicator from './CheckboxIndicator';

describe('CheckboxIndicator', () => {
  it('should render unchecked with no icon', () => {
    // before
    const { container } = render(<CheckboxIndicator value={false} />);

    // result
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });

  it('should render checked with the checkbox icon', () => {
    // before
    const { container } = render(<CheckboxIndicator value />);

    // result
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render mixed with the mixed icon even when value is false', () => {
    // before
    const { container } = render(<CheckboxIndicator isMixed value={false} />);

    // result
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
