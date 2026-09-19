import { FC, FocusEvent } from 'react';
import { useTranslation } from 'react-i18next';

// @xigma
import { Tooltip } from '@xigma/components';

// components
import StrokeSettingsField from '../../StrokeSettingsField/StrokeSettingsField';
import { UITools } from 'shared';

// others
import {
  STROKE_SCATTER_BRUSH_FIELD_ICONS,
  STROKE_SCATTER_BRUSH_FIELDS,
  STROKE_SCATTER_BRUSH_LIMITS,
  TStrokeScatterBrushField,
} from '../constants';
import { translationNameSpace } from '../../../../../constants';

// styles
import fieldStyles from '../../StrokeSettingsField/stroke-settings-field.module.scss';

export type TStrokeScatterBrushFieldsProps = {
  onBlur: (field: TStrokeScatterBrushField) => TFunc<[FocusEvent<HTMLInputElement>]>;
  values: Record<TStrokeScatterBrushField, number>;
};

export const StrokeScatterBrushFields: FC<TStrokeScatterBrushFieldsProps> = ({ onBlur, values }) => {
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
                defaultValue={`${values[field]}${STROKE_SCATTER_BRUSH_LIMITS[field].unit}`}
                e2eValue={`stroke-brush-${field}`}
                onBlur={onBlur(field)}
                startAdornment={
                  STROKE_SCATTER_BRUSH_FIELD_ICONS[field] ? (
                    <UITools.InputAdornment icon={STROKE_SCATTER_BRUSH_FIELD_ICONS[field]} />
                  ) : undefined
                }
                stepNumbers={{ max: STROKE_SCATTER_BRUSH_LIMITS[field].max, min: STROKE_SCATTER_BRUSH_LIMITS[field].min }}
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
