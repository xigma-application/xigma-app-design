import { FC, FocusEvent } from 'react';
import { useTranslation } from 'react-i18next';

// components
import StrokeScatterBrushInput from './StrokeScatterBrushInput/StrokeScatterBrushInput';
import { UITools } from 'shared';

// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';
import {
  STROKE_SCATTER_BRUSH_FIELD_ICONS,
  STROKE_SCATTER_BRUSH_FIELDS,
  STROKE_SCATTER_BRUSH_LIMITS,
  TStrokeScatterBrushField,
} from '../constants';
import { translationNameSpace } from '../../../../../constants';

export type TStrokeScatterBrushFieldsProps = {
  onBlur: (field: TStrokeScatterBrushField) => TFunc<[FocusEvent<HTMLInputElement>]>;
  values: Record<TStrokeScatterBrushField, number | undefined>;
};

export const StrokeScatterBrushFields: FC<TStrokeScatterBrushFieldsProps> = ({ onBlur, values }) => {
  const { t } = useTranslation();
  const namespace = `${translationNameSpace}.settings.brush`;

  return (
    <>
      {STROKE_SCATTER_BRUSH_FIELDS.map((field) => {
        const label = t(`${namespace}.${field}.label`);

        return (
          <UITools.Field
            Component={StrokeScatterBrushInput}
            aria-label={label}
            controlWidth={128}
            defaultValue={values[field] === undefined ? MIXED_LABEL : `${values[field]}${STROKE_SCATTER_BRUSH_LIMITS[field].unit}`}
            e2eValue={`stroke-brush-${field}`}
            key={field}
            label={label}
            onBlur={onBlur(field)}
            startAdornment={
              STROKE_SCATTER_BRUSH_FIELD_ICONS[field] ? (
                <UITools.InputAdornment icon={STROKE_SCATTER_BRUSH_FIELD_ICONS[field]} />
              ) : undefined
            }
            stepNumbers={{ max: STROKE_SCATTER_BRUSH_LIMITS[field].max, min: STROKE_SCATTER_BRUSH_LIMITS[field].min }}
            tooltip={label}
            type="text"
          />
        );
      })}
    </>
  );
};

export default StrokeScatterBrushFields;
