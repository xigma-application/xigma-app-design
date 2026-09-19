import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import StrokeSettingsField from '../StrokeSettingsField/StrokeSettingsField';
import { UITools } from 'shared';

// others
import { STROKE_DYNAMIC_FIELDS, STROKE_DYNAMIC_ICONS, STROKE_DYNAMIC_LIMITS } from './constants';
import { translationNameSpace } from '../../../../constants';
import { useStrokeSettingsDynamicTab } from './hooks/useStrokeSettingsDynamicTab/useStrokeSettingsDynamicTab';

// styles
import fieldStyles from '../StrokeSettingsField/stroke-settings-field.module.scss';
import styles from './stroke-settings-dynamic-tab.module.scss';

export const StrokeSettingsDynamicTab: FC = () => {
  const { t } = useTranslation();
  const { onBlur, values } = useStrokeSettingsDynamicTab();

  return (
    <div className={styles.StrokeSettingsDynamicTab}>
      {STROKE_DYNAMIC_FIELDS.map((field) => (
        <StrokeSettingsField key={field} label={t(`${translationNameSpace}.settings.dynamic.${field}.label`)}>
          <UITools.TextField
            aria-label={t(`${translationNameSpace}.settings.dynamic.${field}.label`)}
            className={fieldStyles.StrokeSettingsField__input}
            defaultValue={`${values[field]}%`}
            e2eValue={`stroke-${field}`}
            onBlur={onBlur(field)}
            startAdornment={<UITools.InputAdornment icon={STROKE_DYNAMIC_ICONS[field]} />}
            stepNumbers={{ max: STROKE_DYNAMIC_LIMITS[field].max, min: STROKE_DYNAMIC_LIMITS[field].min }}
            type="text"
          />
        </StrokeSettingsField>
      ))}
    </div>
  );
};

export default StrokeSettingsDynamicTab;
