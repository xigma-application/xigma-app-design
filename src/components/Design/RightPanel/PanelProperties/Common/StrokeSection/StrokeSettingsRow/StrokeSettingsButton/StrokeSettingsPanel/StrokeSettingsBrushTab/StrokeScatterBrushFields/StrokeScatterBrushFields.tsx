import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// @xigma
import { Tooltip } from '@xigma/components';

// components
import StrokeSettingsField from '../../StrokeSettingsField/StrokeSettingsField';
import { UITools } from 'shared';

// others
import { DEFAULT_STROKE_SCATTER_BRUSH_VALUES, STROKE_SCATTER_BRUSH_FIELD_ICONS, STROKE_SCATTER_BRUSH_FIELDS } from '../constants';
import { translationNameSpace } from '../../../../../constants';

// styles
import fieldStyles from '../../StrokeSettingsField/stroke-settings-field.module.scss';

export const StrokeScatterBrushFields: FC = () => {
  const { t } = useTranslation();
  const namespace = `${translationNameSpace}.settings.brush`;

  return (
    <>
      {STROKE_SCATTER_BRUSH_FIELDS.map((field) => {
        const label = t(`${namespace}.${field}.label`);

        return (
          <StrokeSettingsField key={field} label={label}>
            <Tooltip content={label}>
              <UITools.TextField
                aria-label={label}
                className={fieldStyles.StrokeSettingsField__input}
                defaultValue={DEFAULT_STROKE_SCATTER_BRUSH_VALUES[field]}
                e2eValue={`stroke-brush-${field}`}
                startAdornment={
                  STROKE_SCATTER_BRUSH_FIELD_ICONS[field] ? (
                    <UITools.InputAdornment icon={STROKE_SCATTER_BRUSH_FIELD_ICONS[field]} />
                  ) : undefined
                }
                type="text"
              />
            </Tooltip>
          </StrokeSettingsField>
        );
      })}
    </>
  );
};

export default StrokeScatterBrushFields;
