import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import StrokeSettingsField from '../StrokeSettingsField/StrokeSettingsField';
import StrokeSettingsWidthProfileField from '../StrokeSettingsWidthProfileField/StrokeSettingsWidthProfileField';
import { UITools } from 'shared';

// hooks
import { useStrokeSettingsBrushTab } from './hooks/useStrokeSettingsBrushTab';

// others
import { getStrokeBrushOptions } from './utils/getStrokeBrushOptions';
import { getStrokeDirectionButtons } from './utils/getStrokeDirectionButtons';
import { STROKE_BRUSH_MENU_MAX_HEIGHT_PX } from './constants';
import { translationNameSpace } from '../../../../constants';

// styles
import fieldStyles from '../StrokeSettingsField/stroke-settings-field.module.scss';
import styles from './stroke-settings-brush-tab.module.scss';

export const StrokeSettingsBrushTab: FC = () => {
  const { t } = useTranslation();
  const { brush, direction, onBrushSelect, onDirectionChange } = useStrokeSettingsBrushTab();
  const namespace = `${translationNameSpace}.settings`;
  const brushOptions = getStrokeBrushOptions((translationKey) => t(translationKey));
  const directionButtons = getStrokeDirectionButtons((option) => t(`${namespace}.brush.direction.options.${option}`));

  return (
    <div className={styles.StrokeSettingsBrushTab}>
      <div className={styles.StrokeSettingsBrushTab__brush}>
        <UITools.Dropdown<string>
          bypassGlobalShortcuts={false}
          className={styles.StrokeSettingsBrushTab__dropdown}
          menuMaxHeight={STROKE_BRUSH_MENU_MAX_HEIGHT_PX}
          onSelect={onBrushSelect}
          options={brushOptions}
          size="large"
          textAlign="left"
          value={brush}
          variant="outline"
        />
      </div>
      <StrokeSettingsField label={t(`${namespace}.brush.direction.label`)}>
        <UITools.ToggleButtonGroup
          className={fieldStyles.StrokeSettingsField__input}
          onChange={onDirectionChange}
          toggleButtons={directionButtons}
          value={direction}
        />
      </StrokeSettingsField>
      <div className={styles.StrokeSettingsBrushTab__divider} />
      <StrokeSettingsWidthProfileField />
    </div>
  );
};

export default StrokeSettingsBrushTab;
