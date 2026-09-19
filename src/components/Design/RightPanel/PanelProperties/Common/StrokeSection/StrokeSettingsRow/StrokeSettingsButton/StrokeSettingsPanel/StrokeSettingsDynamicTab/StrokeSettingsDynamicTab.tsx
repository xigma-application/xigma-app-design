import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import StrokeSettingsField from '../StrokeSettingsField/StrokeSettingsField';
import { UITools } from 'shared';

// others
import { DEFAULT_STROKE_DYNAMIC_VALUES, STROKE_DYNAMIC_FIELDS, STROKE_DYNAMIC_ICONS } from './constants';
import { translationNameSpace } from '../../../../constants';

// styles
import fieldStyles from '../StrokeSettingsField/stroke-settings-field.module.scss';
import styles from './stroke-settings-dynamic-tab.module.scss';

export const StrokeSettingsDynamicTab: FC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.StrokeSettingsDynamicTab}>
      {STROKE_DYNAMIC_FIELDS.map((field) => (
        <StrokeSettingsField key={field} label={t(`${translationNameSpace}.settings.dynamic.${field}.label`)}>
          <UITools.TextField
            aria-label={t(`${translationNameSpace}.settings.dynamic.${field}.label`)}
            className={fieldStyles.StrokeSettingsField__input}
            defaultValue={DEFAULT_STROKE_DYNAMIC_VALUES[field]}
            e2eValue={`stroke-${field}`}
            startAdornment={<UITools.InputAdornment icon={STROKE_DYNAMIC_ICONS[field]} />}
            stepNumbers={{ max: 100, min: 0 }}
            type="text"
          />
        </StrokeSettingsField>
      ))}
    </div>
  );
};

export default StrokeSettingsDynamicTab;
