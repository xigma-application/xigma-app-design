import { fireEvent, render, screen } from '@testing-library/react';

// components
import AutoLayoutPaddingValueInput from '../AutoLayoutPaddingValueInput';

describe('AutoLayoutPaddingValueInput', () => {
  it('should render the icon and the initial value, positioned at the given screen point', () => {
    // before
    render(
      <AutoLayoutPaddingValueInput
        centerX={140}
        centerY={132}
        iconName="PaddingT"
        initialValue={12}
        onCancel={vi.fn()}
        onCommit={vi.fn()}
      />,
    );
    const input = screen.getByRole<HTMLInputElement>('textbox');

    // result
    expect(input).toHaveValue('12');
    expect(input.parentElement).toHaveStyle({ left: '140px', top: '132px' });
  });

  it('should not let a pointerdown on the popup reach the canvas beneath it', () => {
    // mock
    const onPointerDownOnAncestor = vi.fn();

    // before
    render(
      <div onPointerDown={onPointerDownOnAncestor}>
        <AutoLayoutPaddingValueInput centerX={0} centerY={0} iconName="PaddingT" initialValue={12} onCancel={vi.fn()} onCommit={vi.fn()} />
      </div>,
    );

    fireEvent.pointerDown(screen.getByRole('textbox').parentElement as Element);

    // result
    expect(onPointerDownOnAncestor).not.toHaveBeenCalled();
  });

  it('should commit the typed value on Enter', () => {
    // mock
    const onCommit = vi.fn();

    // before
    render(
      <AutoLayoutPaddingValueInput centerX={0} centerY={0} iconName="PaddingT" initialValue={12} onCancel={vi.fn()} onCommit={onCommit} />,
    );
    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: '40' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    // result
    expect(onCommit).toHaveBeenCalledWith('40');
  });

  it('should cancel on Escape', () => {
    // mock
    const onCancel = vi.fn();

    // before
    render(
      <AutoLayoutPaddingValueInput centerX={0} centerY={0} iconName="PaddingT" initialValue={12} onCancel={onCancel} onCommit={vi.fn()} />,
    );

    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' });

    // result
    expect(onCancel).toHaveBeenCalled();
  });

  it('should commit the typed value on blur', () => {
    // mock
    const onCommit = vi.fn();

    // before
    render(
      <AutoLayoutPaddingValueInput centerX={0} centerY={0} iconName="PaddingT" initialValue={12} onCancel={vi.fn()} onCommit={onCommit} />,
    );
    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: '40' } });
    fireEvent.blur(input);

    // result
    expect(onCommit).toHaveBeenCalledWith('40');
  });
});
