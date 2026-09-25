import { ReactElement, ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

// components
import EffectRow from './EffectRow';

// types
import { EffectType } from 'types/design/enums';
import { TEffectPanelLayout } from '../EffectSettingsPanel/utils/getEffectPanelLayout';

// utils
import { createEffect } from 'utils/design/effects/createEffect';

vi.mock('components/Design/RightPanel/hooks/usePanelEdgeSideOffset', () => ({ usePanelEdgeSideOffset: (): number => 8 }));
vi.mock('./hooks/useIgnoreProgressiveBlurInteractOutside/useIgnoreProgressiveBlurInteractOutside', () => ({
  useIgnoreProgressiveBlurInteractOutside: (): TFunc => vi.fn(),
}));
vi.mock('./hooks/useReturnFocusOnUserClose/useReturnFocusOnUserClose', () => ({
  useReturnFocusOnUserClose: (): unknown => ({ markUserClose: vi.fn(), onClose: vi.fn(), onCloseAutoFocus: vi.fn() }),
}));
vi.mock('../EffectSettingsPanel/EffectSettingsPanel', () => ({ default: (): ReactElement => <span>settings panel</span> }));
vi.mock('shared', async (importOriginal) => {
  const original = await importOriginal<{ UITools: object }>();

  return {
    ...original,
    Tooltip: ({ children }: { children: ReactNode }): ReactNode => children,
    UITools: {
      ...original.UITools,
      ButtonIcon: ({ ariaLabel, onClick }: { ariaLabel: string; onClick?: TFunc }): ReactElement => (
        <button aria-label={ariaLabel} onClick={onClick} type="button" />
      ),
      Popover: ({
        children,
        onOpenChange,
        trigger,
      }: {
        children: ReactNode;
        onOpenChange: TFunc<[boolean]>;
        trigger: ReactNode;
      }): ReactElement => (
        <div>
          {trigger}
          <button onClick={(): void => onOpenChange(true)} type="button">
            open settings
          </button>
          {children}
        </div>
      ),
    },
  };
});

const renderRow = (props: Partial<Parameters<typeof EffectRow>[0]> = {}): Record<string, TFunc> => {
  const handlers = {
    onBlendModePreview: vi.fn(),
    onChange: vi.fn(),
    onDragEnd: vi.fn(),
    onDragStart: vi.fn(),
    onFieldScrub: vi.fn(),
    onOpenChange: vi.fn(),
    onRemove: vi.fn(),
    onStartDrag: vi.fn(),
    onToggleVisible: vi.fn(),
  };

  render(
    <EffectRow
      canDrag={false}
      disabledTypes={[]}
      effect={createEffect(EffectType.dropShadow)}
      isDragging={false}
      isHidden={false}
      isOpen={false}
      isSelected={false}
      layout={{} as TEffectPanelLayout}
      mixedKeys={new Set()}
      registerRow={vi.fn()}
      {...handlers}
      {...props}
    />,
  );

  return handlers;
};

describe('EffectRow behaviors', () => {
  it('should name the effect, hide it, remove it and open its settings', () => {
    // before
    const { onOpenChange, onRemove, onToggleVisible } = renderRow();

    // action
    fireEvent.click(screen.getByLabelText('Hide effect'));
    fireEvent.click(screen.getByLabelText('Delete effect'));
    fireEvent.click(screen.getByText('open settings'));

    // result
    expect(screen.getByText('Drop shadow')).toBeInTheDocument();
    expect(onToggleVisible).toHaveBeenCalledTimes(1);
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByLabelText('Reorder effect')).not.toBeInTheDocument();
  });

  it('should offer showing a hidden effect and start a drag from its handle', () => {
    // before
    const { onStartDrag } = renderRow({ canDrag: true, isDragging: true, isHidden: true });

    // action
    fireEvent.pointerDown(screen.getByLabelText('Reorder effect'));

    // result
    expect(screen.getByLabelText('Show effect')).toBeInTheDocument();
    expect(onStartDrag).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Drop shadow').closest('button')?.className).toMatch(/active/);
  });

  it('should highlight the row while it is open or selected', () => {
    // before
    renderRow({ canDrag: true, isOpen: true });
    renderRow({ isSelected: true });

    // result
    screen.getAllByText('Drop shadow').forEach((label) => expect(label.closest('button')?.className).toMatch(/active/));
  });
});
