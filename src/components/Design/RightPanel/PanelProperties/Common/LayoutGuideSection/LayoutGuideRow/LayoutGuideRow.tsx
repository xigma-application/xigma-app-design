import cx from 'classnames';
import { FC, PointerEvent as ReactPointerEvent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

// components
import LayoutGuideSettingsPanel from '../LayoutGuideSettingsPanel/LayoutGuideSettingsPanel';
import LayoutGuideTypeItems from '../LayoutGuideTypeItems/LayoutGuideTypeItems';
import { Icon, Tooltip, UITools } from 'shared';

// hooks
import { usePanelEdgeSideOffset } from 'components/Design/RightPanel/hooks/usePanelEdgeSideOffset';
import { useReturnFocusOnUserClose } from '../../EffectsSection/EffectRow/hooks/useReturnFocusOnUserClose/useReturnFocusOnUserClose';
import { useSelectLayoutGuideRow } from './hooks/useSelectLayoutGuideRow';

// others
import { LAYOUT_GUIDE_ICONS, translationNameSpace } from '../constants';

// styles
import styles from './layout-guide-row.module.scss';

// types
import { TLayoutGuide } from 'types/design/types';

// utils
import { getLayoutGuideRowLabel } from './utils/getLayoutGuideRowLabel';

export type TLayoutGuideRowProps = {
  canDrag: boolean;
  guide: TLayoutGuide;
  isDragging: boolean;
  isOpen: boolean;
  isSelected: boolean;
  onChange: TFunc<[TLayoutGuide]>;
  onDragEnd: TFunc;
  onDragStart: TFunc;
  onOpenChange: TFunc<[boolean]>;
  onRemove: TFunc;
  onSelect: TFunc;
  onStartDrag: TFunc<[ReactPointerEvent]>;
  onToggleVisible: TFunc;
  registerRow: (element: HTMLElement | null) => void;
};

export const LayoutGuideRow: FC<TLayoutGuideRowProps> = ({
  canDrag,
  guide,
  isDragging,
  isOpen,
  isSelected,
  onChange,
  onDragEnd,
  onDragStart,
  onOpenChange,
  onRemove,
  onSelect,
  onStartDrag,
  onToggleVisible,
  registerRow,
}) => {
  const { t } = useTranslation();
  const settingsTriggerRef = useRef<HTMLButtonElement>(null);
  const sideOffset = usePanelEdgeSideOffset(settingsTriggerRef, isOpen);
  const { markUserClose, onClose, onCloseAutoFocus } = useReturnFocusOnUserClose(onOpenChange);
  const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);
  const handleRowClick = useSelectLayoutGuideRow(onSelect);
  const isVisible = guide.visible !== false;
  const isAnyPopoverOpen = isOpen || isTypeMenuOpen;

  return (
    <div
      className={cx(styles.LayoutGuideRow, {
        [styles['LayoutGuideRow--selected']]: canDrag && !isAnyPopoverOpen && (isSelected || isDragging),
      })}
      onClick={canDrag ? handleRowClick : undefined}
      ref={registerRow}
    >
      {canDrag && (
        <button
          aria-label={t(`${translationNameSpace}.row.reorderAriaLabel`)}
          className={cx(styles.LayoutGuideRow__handle, { [styles['LayoutGuideRow__handle--dragging']]: isDragging })}
          onPointerDown={onStartDrag}
          type="button"
        >
          <Icon color="neutral2" name="RowGrabber" size={7} />
        </button>
      )}
      <UITools.Popover
        align="start"
        asChild
        className={styles.LayoutGuideRow__popover}
        moveable
        onCloseAutoFocus={onCloseAutoFocus}
        onEscapeKeyDown={markUserClose}
        onOpenChange={onOpenChange}
        open={isOpen}
        side="left"
        sideOffset={sideOffset}
        trigger={
          <UITools.ButtonIcon
            ariaLabel={t(`${translationNameSpace}.row.settingsTooltip`)}
            data-no-select
            name={LAYOUT_GUIDE_ICONS[guide.type]}
            ref={settingsTriggerRef}
            selected={isOpen}
          />
        }
        triggerTooltip={t(`${translationNameSpace}.row.settingsTooltip`)}
      >
        <LayoutGuideSettingsPanel guide={guide} onChange={onChange} onClose={onClose} onDragEnd={onDragEnd} onDragStart={onDragStart} />
      </UITools.Popover>
      <UITools.Popover
        align="start"
        asChild
        onOpenChange={setIsTypeMenuOpen}
        trigger={
          <button
            className={cx(styles.LayoutGuideRow__trigger, { [styles['LayoutGuideRow__trigger--active']]: isTypeMenuOpen })}
            data-no-select
            type="button"
          >
            <span className={styles.LayoutGuideRow__label}>{getLayoutGuideRowLabel(guide, t)}</span>
            <Icon name="ChevronDown" size={16} />
          </button>
        }
      >
        <LayoutGuideTypeItems onSelect={(type): void => onChange({ ...guide, type })} selectedType={guide.type} />
      </UITools.Popover>
      <Tooltip align="end" content={t(`${translationNameSpace}.row.${isVisible ? 'hideTooltip' : 'showTooltip'}`)}>
        <UITools.ButtonIcon
          ariaLabel={t(`${translationNameSpace}.row.${isVisible ? 'hideAriaLabel' : 'showAriaLabel'}`)}
          data-no-select
          name={isVisible ? 'EyesOpened' : 'EyesClosed'}
          onClick={onToggleVisible}
        />
      </Tooltip>
      <Tooltip content={t(`${translationNameSpace}.row.deleteTooltip`)}>
        <UITools.ButtonIcon ariaLabel={t(`${translationNameSpace}.row.deleteAriaLabel`)} name="Minus" onClick={onRemove} />
      </Tooltip>
    </div>
  );
};

export default LayoutGuideRow;
