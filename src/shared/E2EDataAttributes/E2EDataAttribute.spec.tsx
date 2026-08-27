import { render } from '@testing-library/react';

// components
import E2EDataAttribute from './E2EDataAttribute';

// types
import { E2EAttribute } from 'types/e2e';

describe('E2EDataAttribute behaviors', () => {
  it('should clone the child with a data-test attribute for the given type and value', () => {
    // before
    const { container } = render(
      <E2EDataAttribute type={E2EAttribute.bypassGlobalShortcuts} value="true">
        <input />
      </E2EDataAttribute>,
    );

    // result
    expect(container.querySelector('input')).toHaveAttribute('data-test-bypass-global-shortcuts', 'true');
  });

  it('should default the value to an empty string when none is given', () => {
    // before
    const { container } = render(
      <E2EDataAttribute type={E2EAttribute.bypassGlobalShortcuts}>
        <input />
      </E2EDataAttribute>,
    );

    // result
    expect(container.querySelector('input')).toHaveAttribute('data-test-bypass-global-shortcuts', '');
  });
});
