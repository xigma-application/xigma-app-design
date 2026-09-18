import { fireEvent, render, screen } from '@testing-library/react';
import * as PopoverPrimitive from '@radix-ui/react-popover';

// components
import ContrastSettingsMenu from './ContrastSettingsMenu';

// types
import { ContrastCategory, ContrastLevel } from '../enums';

const renderContrastSettingsMenu = (
  category: ContrastCategory = ContrastCategory.auto,
  level: ContrastLevel = ContrastLevel.aa,
  canShowAAA = false,
  onSelectCategory: TFunc<[ContrastCategory]> = vi.fn(),
  onSelectLevel: TFunc<[ContrastLevel]> = vi.fn(),
): ReturnType<typeof render> =>
  render(
    <PopoverPrimitive.Root open>
      <ContrastSettingsMenu
        canShowAAA={canShowAAA}
        category={category}
        level={level}
        onSelectCategory={onSelectCategory}
        onSelectLevel={onSelectLevel}
      />
    </PopoverPrimitive.Root>,
  );

describe('ContrastSettingsMenu', () => {
  it('should list every category and level option', () => {
    // before
    renderContrastSettingsMenu();

    // result
    expect(screen.getByText('Auto')).toBeInTheDocument();
    expect(screen.getByText('Large text')).toBeInTheDocument();
    expect(screen.getByText('Normal text')).toBeInTheDocument();
    expect(screen.getByText('Graphics')).toBeInTheDocument();
    expect(screen.getByText('AA')).toBeInTheDocument();
    expect(screen.getByText('AAA')).toBeInTheDocument();
  });

  it('should call onSelectCategory with the clicked category', () => {
    // mock
    const onSelectCategory = vi.fn();

    // before
    renderContrastSettingsMenu(ContrastCategory.auto, ContrastLevel.aa, false, onSelectCategory);

    // action
    fireEvent.click(screen.getByText('Graphics'));

    // result
    expect(onSelectCategory).toHaveBeenCalledWith(ContrastCategory.graphics);
  });

  it('should call onSelectLevel with the clicked level', () => {
    // mock
    const onSelectLevel = vi.fn();

    // before
    renderContrastSettingsMenu(ContrastCategory.normalText, ContrastLevel.aa, true, vi.fn(), onSelectLevel);

    // action
    fireEvent.click(screen.getByText('AAA'));

    // result
    expect(onSelectLevel).toHaveBeenCalledWith(ContrastLevel.aaa);
  });

  it('should disable the AAA option when canShowAAA is false', () => {
    // mock
    const onSelectLevel = vi.fn();

    // before
    renderContrastSettingsMenu(ContrastCategory.graphics, ContrastLevel.aa, false, vi.fn(), onSelectLevel);

    // action
    fireEvent.click(screen.getByText('AAA'));

    // result
    expect(onSelectLevel).not.toHaveBeenCalled();
  });
});
