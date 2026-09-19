import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import StrokeBrushTrigger from './StrokeBrushTrigger/StrokeBrushTrigger';
import StrokeScatterBrushFields from './StrokeScatterBrushFields/StrokeScatterBrushFields';
import StrokeSettingsField from '../StrokeSettingsField/StrokeSettingsField';
import StrokeSettingsWidthProfileField from '../StrokeSettingsWidthProfileField/StrokeSettingsWidthProfileField';
import { UITools } from 'shared';

// hooks
import { useStrokeBrushPicker } from './hooks/useStrokeBrushPicker';
import { useStrokeSettingsBrushTab } from './hooks/useStrokeSettingsBrushTab';

// others
import { getBrushById } from './utils/getBrushById';
import { getBrushCategoryId } from './utils/getBrushCategoryId';
import { getStrokeDirectionButtons } from './utils/getStrokeDirectionButtons';
import { translationNameSpace } from '../../../../constants';

// styles
import fieldStyles from '../StrokeSettingsField/stroke-settings-field.module.scss';
import styles from './stroke-settings-brush-tab.module.scss';

export const StrokeSettingsBrushTab: FC = () => {
  const { t } = useTranslation();
  const { brush, direction, onBrushSelect, onDirectionChange } = useStrokeSettingsBrushTab();
  const { isPickerOpen, onTogglePicker, triggerRef } = useStrokeBrushPicker(brush, onBrushSelect);
  const namespace = `${translationNameSpace}.settings`;
  const selectedBrush = getBrushById(brush);
  const isScatterBrush = getBrushCategoryId(brush) === 'scatter';
  const directionButtons = getStrokeDirectionButtons((option) => t(`${namespace}.brush.direction.options.${option}`));

  return (
    <div className={styles.StrokeSettingsBrushTab}>
      <div className={styles.StrokeSettingsBrushTab__brush}>
        <StrokeBrushTrigger
          ariaLabel={t(`${namespace}.brush.triggerAriaLabel`)}
          brushId={brush}
          brushLabel={selectedBrush ? t(selectedBrush.labelTranslationKey) : ''}
          isOpen={isPickerOpen}
          onClick={onTogglePicker}
          ref={triggerRef}
        />
      </div>
      {isScatterBrush ? (
        <StrokeScatterBrushFields />
      ) : (
        <StrokeSettingsField label={t(`${namespace}.brush.direction.label`)}>
          <UITools.ToggleButtonGroup
            className={fieldStyles.StrokeSettingsField__input}
            onChange={onDirectionChange}
            toggleButtons={directionButtons}
            value={direction}
          />
        </StrokeSettingsField>
      )}
      <div className={styles.StrokeSettingsBrushTab__divider} />
      <StrokeSettingsWidthProfileField />
    </div>
  );
};

export default StrokeSettingsBrushTab;
