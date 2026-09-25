import { ReactElement, ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

// components
import ExportRow from './ExportRow';

// types
import { ExportFormat, ExportScale } from '../enums';
import { TExportSetting } from '../types';

const selectRowMock = vi.fn();

vi.mock('components/Design/RightPanel/hooks/usePanelEdgeSideOffset', () => ({ usePanelEdgeSideOffset: (): number => 8 }));
vi.mock('../../Common/EffectsSection/EffectRow/hooks/useReturnFocusOnUserClose/useReturnFocusOnUserClose', () => ({
  useReturnFocusOnUserClose: (): unknown => ({ markUserClose: vi.fn(), onClose: vi.fn(), onCloseAutoFocus: vi.fn() }),
}));
vi.mock('./hooks/useSelectExportRow', () => ({ useSelectExportRow: (): TFunc => selectRowMock }));
vi.mock('./ExportSettingsPanel/ExportSettingsPanel', () => ({ default: (): ReactElement => <span>settings panel</span> }));
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
      Dropdown: ({
        onSelect,
        options,
        variant,
      }: {
        onSelect: TFunc<[unknown]>;
        options: { value: unknown }[];
        variant: string;
      }): ReactElement => (
        <button onClick={(): void => onSelect(options[1].value)} type="button">
          {variant}
        </button>
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

const setting = { format: ExportFormat.png, scale: ExportScale.one } as TExportSetting;

const renderRow = (props: Partial<Parameters<typeof ExportRow>[0]> = {}): Record<string, TFunc> => {
  const handlers = { onChange: vi.fn(), onRemove: vi.fn(), onSelect: vi.fn(), onStartDrag: vi.fn() };

  render(
    <ExportRow canDrag={false} isDragging={false} isSelected={false} registerRow={vi.fn()} setting={setting} {...handlers} {...props} />,
  );

  return handlers;
};

describe('ExportRow behaviors', () => {
  it('should change the scale and format of the setting from its dropdowns', () => {
    // before
    const { onChange } = renderRow();

    // action
    fireEvent.click(screen.getByText('filled'));
    fireEvent.click(screen.getByText('outline'));

    // result
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ format: ExportFormat.png, scale: expect.any(String) }));
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(screen.queryByLabelText('Reorder export setting')).not.toBeInTheDocument();
  });

  it('should remove the row and open its settings', () => {
    // before
    const { onRemove } = renderRow();

    // action
    fireEvent.click(screen.getByLabelText('Delete export setting'));
    fireEvent.click(screen.getByText('open settings'));

    // result
    expect(onRemove).toHaveBeenCalled();
    expect(screen.getByText('settings panel')).toBeInTheDocument();
  });

  it('should be selectable and draggable when several rows exist', () => {
    // before
    const { onStartDrag } = renderRow({ canDrag: true, isDragging: true, isSelected: true });

    // action
    fireEvent.pointerDown(screen.getAllByRole('button')[0]);
    fireEvent.click(screen.getByText('filled').parentElement as HTMLElement);

    // result
    expect(onStartDrag).toHaveBeenCalled();
    expect(selectRowMock).toHaveBeenCalled();
  });

  it('should highlight a row while it is dragged, even when it is not selected', () => {
    // before
    renderRow({ canDrag: true, isDragging: true, isSelected: false });
    const draggingRow = screen.getByText('filled').parentElement as HTMLElement;

    // result
    expect(draggingRow.className).toContain('selected');
  });
});
