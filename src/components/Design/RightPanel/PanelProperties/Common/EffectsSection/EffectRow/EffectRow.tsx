import cx from 'classnames';
import { FC, PointerEvent as ReactPointerEvent, useRef } from 'react';
import { useTranslation } from 'react-i18next';

// components
import EffectSettingsPanel from '../EffectSettingsPanel/EffectSettingsPanel';
import { Icon, Tooltip, UITools } from 'shared';

// hooks
import { usePanelEdgeSideOffset } from 'components/Design/RightPanel/hooks/usePanelEdgeSideOffset';
import { useIgnoreProgressiveBlurInteractOutside } from './hooks/useIgnoreProgressiveBlurInteractOutside/useIgnoreProgressiveBlurInteractOutside';
import { useReturnFocusOnUserClose } from './hooks/useReturnFocusOnUserClose/useReturnFocusOnUserClose';

// others
import { EFFECT_ICONS, translationNameSpace } from '../constants';

// styles
import styles from './effect-row.module.scss';

// types
import { BlendMode, EffectType } from 'types/design/enums';
import { TEffect } from 'types/design/types';
import { TEffectNumberField } from '../types';
import { TEffectPanelLayout } from '../EffectSettingsPanel/utils/getEffectPanelLayout';

export type TEffectRowProps = {
  canDrag: boolean;
  disabledTypes: EffectType[];
  effect: TEffect;
  isDragging: boolean;
  isHidden: boolean;
  isOpen: boolean;
  isSelected: boolean;
  layout: TEffectPanelLayout;
  mixedKeys: Set<keyof TEffect>;
  onBlendModePreview: TFunc<[BlendMode | null]>;
  onChange: TFunc<[Partial<TEffect>]>;
  onDragEnd: TFunc;
  onDragStart: TFunc;
  onFieldScrub: TFunc<[TEffectNumberField, number, number]>;
  onOpenChange: TFunc<[boolean]>;
  onRemove: TFunc;
  onStartDrag: TFunc<[ReactPointerEvent]>;
  onToggleVisible: TFunc;
  registerRow: (element: HTMLElement | null) => void;
};

export const EffectRow: FC<TEffectRowProps> = ({
  canDrag,
  disabledTypes,
  effect,
  isDragging,
  isHidden,
  isOpen,
  isSelected,
  layout,
  mixedKeys,
  onBlendModePreview,
  onChange,
  onDragEnd,
  onDragStart,
  onFieldScrub,
  onOpenChange,
  onRemove,
  onStartDrag,
  onToggleVisible,
  registerRow,
}) => {
  const { t } = useTranslation();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const sideOffset = usePanelEdgeSideOffset(triggerRef, isOpen);
  const onInteractOutside = useIgnoreProgressiveBlurInteractOutside();
  const { markUserClose, onClose, onCloseAutoFocus } = useReturnFocusOnUserClose(onOpenChange);
  const isVisible = !isHidden;
  const isActive = isOpen || isSelected || isDragging;

  return (
    <div className={styles.EffectRow} ref={registerRow}>
      {canDrag && (
        <button
          aria-label={t(`${translationNameSpace}.row.reorderAriaLabel`)}
          className={cx(styles.EffectRow__handle, { [styles['EffectRow__handle--dragging']]: isDragging })}
          onPointerDown={onStartDrag}
          type="button"
        >
          <Icon color="neutral2" name="RowGrabber" size={7} />
        </button>
      )}
      <UITools.Popover
        align="start"
        asChild
        className={styles.EffectRow__popover}
        moveable
        onCloseAutoFocus={onCloseAutoFocus}
        onEscapeKeyDown={markUserClose}
        onInteractOutside={onInteractOutside}
        onOpenChange={onOpenChange}
        open={isOpen}
        side="left"
        sideOffset={sideOffset}
        trigger={
          <button
            className={cx(styles.EffectRow__trigger, { [styles['EffectRow__trigger--active']]: isActive })}
            ref={triggerRef}
            type="button"
          >
            <Icon color={isActive ? 'blue2' : 'neutral1'} name={EFFECT_ICONS[effect.type]} size={24} />
            <span className={styles.EffectRow__label}>{t(`${translationNameSpace}.menu.options.${effect.type}`)}</span>
          </button>
        }
      >
        <EffectSettingsPanel
          disabledTypes={disabledTypes}
          effect={effect}
          layout={layout}
          mixedKeys={mixedKeys}
          onBlendModePreview={onBlendModePreview}
          onChange={onChange}
          onClose={onClose}
          onDragEnd={onDragEnd}
          onDragStart={onDragStart}
          onFieldScrub={onFieldScrub}
        />
      </UITools.Popover>
      <Tooltip align="end" content={t(`${translationNameSpace}.row.${isVisible ? 'hideTooltip' : 'showTooltip'}`)}>
        <UITools.ButtonIcon
          ariaLabel={t(`${translationNameSpace}.row.${isVisible ? 'hideAriaLabel' : 'showAriaLabel'}`)}
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

export default EffectRow;
