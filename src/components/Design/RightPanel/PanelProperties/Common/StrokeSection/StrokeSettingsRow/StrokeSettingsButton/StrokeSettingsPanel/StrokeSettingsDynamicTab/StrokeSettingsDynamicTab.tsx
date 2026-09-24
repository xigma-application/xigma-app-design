import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { UITools } from 'shared';

// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';
import { STROKE_DYNAMIC_FIELDS, STROKE_DYNAMIC_ICONS, STROKE_DYNAMIC_LIMITS } from './constants';
import { translationNameSpace } from '../../../../constants';
import { useStrokeSettingsDynamicTab } from './hooks/useStrokeSettingsDynamicTab/useStrokeSettingsDynamicTab';

// styles
import styles from './stroke-settings-dynamic-tab.module.scss';

export const StrokeSettingsDynamicTab: FC = () => {
  const { t } = useTranslation();
  const { onBlur, values } = useStrokeSettingsDynamicTab();

  return (
    <div className={styles.StrokeSettingsDynamicTab}>
      {STROKE_DYNAMIC_FIELDS.map((field) => (
        <UITools.Field
          Component={UITools.TextField}
          aria-label={t(`${translationNameSpace}.settings.dynamic.${field}.label`)}
          controlWidth={128}
          defaultValue={values[field] === undefined ? MIXED_LABEL : `${values[field]}%`}
          e2eValue={`stroke-${field}`}
          key={field}
          label={t(`${translationNameSpace}.settings.dynamic.${field}.label`)}
          onBlur={onBlur(field)}
          startAdornment={<UITools.InputAdornment icon={STROKE_DYNAMIC_ICONS[field]} />}
          stepNumbers={{ max: STROKE_DYNAMIC_LIMITS[field].max, min: STROKE_DYNAMIC_LIMITS[field].min }}
          type="text"
        />
      ))}
    </div>
  );
};

export default StrokeSettingsDynamicTab;
