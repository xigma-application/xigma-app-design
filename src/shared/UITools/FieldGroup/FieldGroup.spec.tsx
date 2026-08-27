import { render } from '@testing-library/react';

// components
import FieldGroup from './FieldGroup';

describe('FieldGroup snapshots', () => {
  it('should render FieldGroup wrapping its children in one bordered box', () => {
    // before
    const { asFragment } = render(
      <FieldGroup>
        <input defaultValue="hex" />
        <input defaultValue="alpha" />
      </FieldGroup>,
    );

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});
