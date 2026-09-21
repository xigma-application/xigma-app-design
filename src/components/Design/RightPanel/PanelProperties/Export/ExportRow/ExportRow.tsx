import cx from 'classnames';
import { FC, PointerEvent as ReactPointerEvent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ExportSettingsPanel from './ExportSettingsPanel/ExportSettingsPanel';
import { Icon, Tooltip, UITools } from 'shared';

// hooks
import { usePanelEdgeSideOffset } from 'components/Design/RightPanel/hooks/usePanelEdgeSideOffset';
import { useReturnFocusOnUserClose } from '../../Common/EffectsSection/EffectRow/hooks/useReturnFocusOnUserClose/useReturnFocusOnUserClose';
import { useSelectExportRow } from './hooks/useSelectExportRow';

// others
import { getExportFormatOptions } from '../utils/getExportFormatOptions';
import { getExportScaleOptions } from '../utils/getExportScaleOptions';
import { translationNameSpace } from '../constants';

// styles
import styles from './export-row.module.scss';

// types
import { ExportFormat, ExportScale } from '../enums';
import { TExportSetting } from '../types';

export type TExportRowProps = {
  canDrag: boolean;
  isDragging: boolean;
  isSelected: boolean;
  onChange: TFunc<[TExportSetting]>;
  onRemove: TFunc;
  onSelect: TFunc;
  onStartDrag: TFunc<[ReactPointerEvent]>;
  registerRow: (element: HTMLElement | null) => void;
  setting: TExportSetting;
};

export const ExportRow: FC<TExportRowProps> = ({
  canDrag,
  isDragging,
  isSelected,
  onChange,
  onRemove,
  onSelect,
  onStartDrag,
  registerRow,
  setting,
}) => {
  const { t } = useTranslation();
  const settingsTriggerRef = useRef<HTMLButtonElement>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const sideOffset = usePanelEdgeSideOffset(settingsTriggerRef, isSettingsOpen);
  const { markUserClose, onClose, onCloseAutoFocus } = useReturnFocusOnUserClose(setIsSettingsOpen);
  const handleRowClick = useSelectExportRow(onSelect);
  const scaleOptions = getExportScaleOptions((scale) => t(`${translationNameSpace}.row.scale.options.${scale}`));
  const formatOptions = getExportFormatOptions((format) => t(`${translationNameSpace}.row.format.options.${format}`));

  return (
    <div
      className={cx(styles.ExportRow, {
        [styles['ExportRow--selected']]: canDrag && (isSelected || isDragging),
        [styles['ExportRow--pickerOpen']]: isSettingsOpen,
      })}
      onClick={canDrag ? handleRowClick : undefined}
      ref={registerRow}
    >
      {canDrag && (
        <button
          aria-label={t(`${translationNameSpace}.row.reorderAriaLabel`)}
          className={cx(styles.ExportRow__handle, { [styles['ExportRow__handle--dragging']]: isDragging })}
          onPointerDown={onStartDrag}
          type="button"
        >
          <Icon color="neutral2" name="RowGrabber" size={7} />
        </button>
      )}
      <UITools.Dropdown<ExportScale>
        onSelect={(scale): void => onChange({ ...setting, scale })}
        options={scaleOptions}
        textAlign="left"
        value={setting.scale}
        variant="filled"
      />
      <UITools.Dropdown<ExportFormat>
        onSelect={(format): void => onChange({ ...setting, format })}
        options={formatOptions}
        textAlign="left"
        value={setting.format}
        variant="outline"
      />
      <UITools.Popover
        align="start"
        asChild
        className={styles.ExportRow__popover}
        moveable
        onCloseAutoFocus={onCloseAutoFocus}
        onEscapeKeyDown={markUserClose}
        onOpenChange={setIsSettingsOpen}
        open={isSettingsOpen}
        side="left"
        sideOffset={sideOffset}
        trigger={
          <UITools.ButtonIcon
            ariaLabel={t(`${translationNameSpace}.row.settingsTooltip`)}
            data-no-select
            name="MoreOptions"
            ref={settingsTriggerRef}
            selected={isSettingsOpen}
          />
        }
        triggerTooltip={t(`${translationNameSpace}.row.settingsTooltip`)}
      >
        <ExportSettingsPanel onChange={onChange} onClose={onClose} setting={setting} />
      </UITools.Popover>
      <Tooltip content={t(`${translationNameSpace}.row.deleteTooltip`)}>
        <UITools.ButtonIcon ariaLabel={t(`${translationNameSpace}.row.deleteAriaLabel`)} name="Minus" onClick={onRemove} />
      </Tooltip>
    </div>
  );
};

export default ExportRow;
