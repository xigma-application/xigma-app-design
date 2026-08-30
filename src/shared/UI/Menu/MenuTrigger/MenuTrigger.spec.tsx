import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';

// components
import MenuTrigger from './MenuTrigger';

const renderInMenu = (children: ReactNode): ReturnType<typeof render> =>
  render(<DropdownMenuPrimitive.Root>{children}</DropdownMenuPrimitive.Root>);

describe('MenuTrigger', () => {
  it('should render the given trigger content as a real, focusable trigger when there is no anchorRef', () => {
    // before
    renderInMenu(<MenuTrigger trigger={<span>Open</span>} triggerAriaLabel="Open menu" />);

    // result
    expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument();
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('should render an inert, positioned trigger portaled to the document body when anchorRef is given', () => {
    // mock
    const anchorRef = { current: { getBoundingClientRect: (): DOMRect => new DOMRect(10, 20, 0, 0) } };

    // before
    const { container } = renderInMenu(<MenuTrigger anchorRef={anchorRef} />);

    // result — nothing rendered inline where MenuTrigger was mounted
    expect(container).toBeEmptyDOMElement();

    // result — the inert trigger landed directly on <body>, positioned at the anchor's rect
    const trigger = document.body.querySelector(':scope > [aria-hidden]')!;
    expect(trigger).toHaveStyle({ left: '10px', position: 'fixed', top: '20px' });
    expect(trigger).toHaveAttribute('tabindex', '-1');
  });
});
