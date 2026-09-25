import { ReactElement, ReactNode } from 'react';
import { render, screen } from '@testing-library/react';

// components
import ImageEditMoreDropdown from './ImageEditMoreDropdown';

vi.mock('../../ToolbarDropdown/ToolbarDropdown', () => ({
  default: ({ children, option, placeholderLabel, triggerAriaLabel }: Record<string, unknown>): ReactElement => (
    <div aria-label={triggerAriaLabel as string} data-option={String(option)}>
      {placeholderLabel as string}
      {children as ReactNode}
    </div>
  ),
}));
vi.mock('./ImageEditMoreDropdownItems/ImageEditMoreDropdownItems', () => ({ default: (): ReactElement => <span>items</span> }));

describe('ImageEditMoreDropdown behaviors', () => {
  it('should show a More dropdown without a selected option, holding the extra image tools', () => {
    // before
    render(<ImageEditMoreDropdown />);

    // find
    const dropdown = screen.getByLabelText('More');

    // result
    expect(dropdown).toHaveAttribute('data-option', 'null');
    expect(dropdown).toHaveTextContent('Moreitems');
  });
});
