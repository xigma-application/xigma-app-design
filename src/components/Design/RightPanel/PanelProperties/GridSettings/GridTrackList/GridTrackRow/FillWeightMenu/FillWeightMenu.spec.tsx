import { fireEvent, render, screen } from '@testing-library/react';

// components
import FillWeightMenu from './FillWeightMenu';

const renderMenu = (props: Partial<Parameters<typeof FillWeightMenu>[0]> = {}): ReturnType<typeof render> =>
  render(<FillWeightMenu onSelect={vi.fn()} value={1} {...props} />);

describe('FillWeightMenu', () => {
  it('should list the fr presets when the trigger is opened', () => {
    renderMenu();

    fireEvent.click(screen.getByRole('button', { name: 'Fill weight presets' }));

    expect(screen.getByText('0.25fr')).toBeInTheDocument();
    expect(screen.getByText('1fr')).toBeInTheDocument();
    expect(screen.getByText('5fr')).toBeInTheDocument();
  });

  it('should report the picked weight as a number', () => {
    const onSelect = vi.fn();

    renderMenu({ onSelect, value: 1 });
    fireEvent.click(screen.getByRole('button', { name: 'Fill weight presets' }));
    fireEvent.click(screen.getByText('2fr'));

    expect(onSelect).toHaveBeenCalledWith(2);
  });
});
