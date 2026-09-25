import { ReactElement, ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

// components
import ImageCropAspectRatioMenu from './ImageCropAspectRatioMenu';

// others
import {
  ASPECT_RATIO_CIRCLE,
  ASPECT_RATIO_LANDSCAPE_16_9,
  ASPECT_RATIO_LANDSCAPE_3_2,
  ASPECT_RATIO_LANDSCAPE_4_3,
  ASPECT_RATIO_ORIGINAL,
  ASPECT_RATIO_PORTRAIT_2_3,
  ASPECT_RATIO_PORTRAIT_3_4,
  ASPECT_RATIO_PORTRAIT_9_16,
  ASPECT_RATIO_SQUARE,
} from './constants';

const onSelectPreset = vi.fn();
const isPresetActive = vi.fn((preset: unknown) => preset === ASPECT_RATIO_SQUARE);

vi.mock('./hooks/useImageCropAspectRatioMenu', () => ({
  useImageCropAspectRatioMenu: (): unknown => ({ isCustomActive: false, isPresetActive, onSelectPreset }),
}));
vi.mock('shared', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  Menu: ({ children, trigger, triggerAriaLabel }: Record<string, ReactNode>): ReactElement => (
    <div aria-label={triggerAriaLabel as string}>
      {trigger}
      {children}
    </div>
  ),
  MenuCompound: {
    MenuItem: ({ label, onClick, selected }: { label: string; onClick?: TFunc; selected?: boolean }): ReactElement => (
      <button data-selected={String(Boolean(selected))} onClick={onClick} type="button">
        {label}
      </button>
    ),
    MenuSeparator: (): ReactElement => <hr />,
    MenuSub: ({ children }: { children: ReactNode }): ReactElement => <div>{children}</div>,
  },
}));

describe('ImageCropAspectRatioMenu behaviors', () => {
  it('should mark the active preset', () => {
    // before
    render(<ImageCropAspectRatioMenu />);

    // result
    expect(screen.getByText('Square (1:1)')).toHaveAttribute('data-selected', 'true');
    expect(screen.getByText('Custom')).toHaveAttribute('data-selected', 'false');
  });

  it('should apply every preset from its item', () => {
    // before
    render(<ImageCropAspectRatioMenu />);

    // action
    screen.getAllByRole('button').forEach((item) => fireEvent.click(item));

    // result
    expect(onSelectPreset.mock.calls.map(([preset]) => preset)).toEqual([
      ASPECT_RATIO_ORIGINAL,
      ASPECT_RATIO_SQUARE,
      ASPECT_RATIO_CIRCLE,
      ASPECT_RATIO_LANDSCAPE_16_9,
      ASPECT_RATIO_LANDSCAPE_4_3,
      ASPECT_RATIO_LANDSCAPE_3_2,
      ASPECT_RATIO_PORTRAIT_9_16,
      ASPECT_RATIO_PORTRAIT_3_4,
      ASPECT_RATIO_PORTRAIT_2_3,
    ]);
  });
});
