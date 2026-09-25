import { ReactElement, ReactNode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';

// components
import LayoutGuideRow from './LayoutGuideRow';

// types
import { LayoutGuideType } from 'types/design/enums';

// utils
import { createLayoutGuide } from 'utils/design/layoutGuides/createLayoutGuide';

const { childProps, recordAs } = vi.hoisted(() => {
  const recorded: Record<string, Record<string, unknown>[]> = {};

  return {
    childProps: recorded,
    recordAs:
      (name: string) =>
      (props: Record<string, unknown>): null => {
        recorded[name] = [...(recorded[name] ?? []), props];
        return null;
      },
  };
});

vi.mock('components/Design/RightPanel/hooks/usePanelEdgeSideOffset', () => ({ usePanelEdgeSideOffset: (): number => 8 }));
vi.mock('../../EffectsSection/EffectRow/hooks/useReturnFocusOnUserClose/useReturnFocusOnUserClose', () => ({
  useReturnFocusOnUserClose: (): unknown => ({ markUserClose: vi.fn(), onClose: vi.fn(), onCloseAutoFocus: vi.fn() }),
}));
vi.mock('../LayoutGuideSettingsPanel/LayoutGuideSettingsPanel', () => ({ default: recordAs('settings') }));
vi.mock('../LayoutGuideTypeItems/LayoutGuideTypeItems', () => ({ default: recordAs('types') }));
vi.mock('shared', async (importOriginal) => {
  const original = await importOriginal<{ UITools: object }>();

  return {
    ...original,
    Tooltip: ({ children }: { children: ReactNode }): ReactNode => children,
    UITools: {
      ...original.UITools,
      ButtonIcon: ({ ariaLabel, onClick }: { ariaLabel: string; onClick?: TFunc }): ReactElement => (
        <button aria-label={ariaLabel} data-no-select onClick={onClick} type="button" />
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
          <button data-no-select onClick={(): void => onOpenChange(true)} type="button">
            open popover
          </button>
          {children}
        </div>
      ),
    },
  };
});

const renderRow = (
  props: Partial<Parameters<typeof LayoutGuideRow>[0]> = {},
): { container: HTMLElement; handlers: Record<string, TFunc> } => {
  const handlers = {
    onChange: vi.fn(),
    onDragEnd: vi.fn(),
    onDragStart: vi.fn(),
    onFieldScrub: vi.fn(),
    onOpenChange: vi.fn(),
    onRemove: vi.fn(),
    onSelect: vi.fn(),
    onStartDrag: vi.fn(),
    onToggleVisible: vi.fn(),
  };

  const { container } = render(
    <LayoutGuideRow
      canDrag={false}
      guide={createLayoutGuide(LayoutGuideType.columns)}
      isDragging={false}
      isHidden={false}
      isOpen={false}
      isSelected={false}
      isStretchedOnAny={false}
      mixedKeys={new Set()}
      registerRow={vi.fn()}
      {...handlers}
      {...props}
    />,
  );

  return { container, handlers };
};

describe('LayoutGuideRow behaviors', () => {
  it('should name the guide, hide it, remove it, open its settings and change its type', () => {
    // before
    const { handlers } = renderRow();

    // action
    fireEvent.click(screen.getByLabelText('Hide layout guide'));
    fireEvent.click(screen.getByLabelText('Delete layout guide'));
    fireEvent.click(screen.getAllByText('open popover')[0]);
    (childProps.types.at(-1)!.onSelect as TFunc<[LayoutGuideType]>)(LayoutGuideType.rows);

    // result
    expect(screen.getByText(/columns$/)).toBeInTheDocument();
    expect(handlers.onToggleVisible).toHaveBeenCalledTimes(1);
    expect(handlers.onRemove).toHaveBeenCalledTimes(1);
    expect(handlers.onOpenChange).toHaveBeenCalledWith(true);
    expect(handlers.onChange).toHaveBeenCalledWith({ type: LayoutGuideType.rows });
    expect(screen.queryByLabelText('Reorder layout guide')).not.toBeInTheDocument();
  });

  it('should select a draggable row on a click outside its controls and start a drag from its handle', () => {
    // before
    const { container, handlers } = renderRow({ canDrag: true, isHidden: true, isSelected: true });

    // action
    fireEvent.click(container.firstChild as HTMLElement);
    fireEvent.click(screen.getByLabelText('Show layout guide'));
    fireEvent.pointerDown(screen.getByLabelText('Reorder layout guide'));

    // result
    expect(handlers.onSelect).toHaveBeenCalledTimes(1);
    expect(handlers.onStartDrag).toHaveBeenCalledTimes(1);
    expect((container.firstChild as HTMLElement).className).toMatch(/selected/);
  });

  it('should not highlight a dragged row while its type menu is open', () => {
    // before
    const { container } = renderRow({ canDrag: true, isDragging: true });

    // action
    act(() => {
      fireEvent.click(screen.getAllByText('open popover')[1]);
    });

    // result
    expect((container.firstChild as HTMLElement).className).not.toMatch(/selected/);
    expect(screen.getByText(/columns$/).closest('button')?.className).toMatch(/active/);
  });
});
