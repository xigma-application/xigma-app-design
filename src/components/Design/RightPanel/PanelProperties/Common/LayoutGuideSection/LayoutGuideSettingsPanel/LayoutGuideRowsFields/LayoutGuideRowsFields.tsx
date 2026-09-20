import { FC, Fragment, FocusEvent } from 'react';
import { useTranslation } from 'react-i18next';

// components
import EffectColorField from '../../../EffectsSection/EffectSettingsPanel/EffectColorField/EffectColorField';
import LayoutGuideAlignField from '../LayoutGuideAlignField/LayoutGuideAlignField';
import LayoutGuideNumberField from '../LayoutGuideNumberField/LayoutGuideNumberField';

// others
import { translationNameSpace } from '../../constants';

// types
import { LayoutGuideRowsAlign } from 'types/design/enums';
import { TColorPickerValue } from 'shared/UITools/ColorPicker/types';
import { TLayoutGuide } from 'types/design/types';

// utils
import { TLayoutGuideNumberField, getLayoutGuideFieldValue } from 'utils/design/layoutGuides/getLayoutGuideFieldValue';
import { getLayoutGuideRowsAlign } from 'utils/design/layoutGuides/getLayoutGuideRowsAlign';
import { getLayoutGuideRowsAlignOptions } from '../utils/getLayoutGuideRowsAlignOptions';

export type TLayoutGuideRowsFieldsProps = {
  guide: TLayoutGuide;
  onBlur: (field: TLayoutGuideNumberField, min: number, unit?: string) => TFunc<[FocusEvent<HTMLInputElement>]>;
  onChange: TFunc<[TLayoutGuide]>;
  onCommitAlpha: TFunc<[number]>;
  onCommitHex: TFunc<[string]>;
  onDragEnd: TFunc;
  onDragStart: TFunc;
  onPickerChange: TFunc<[TColorPickerValue]>;
  onScrub: (field: TLayoutGuideNumberField, min: number) => TFunc<[number]>;
};

export const LayoutGuideRowsFields: FC<TLayoutGuideRowsFieldsProps> = ({
  guide,
  onBlur,
  onChange,
  onCommitAlpha,
  onCommitHex,
  onDragEnd,
  onDragStart,
  onPickerChange,
  onScrub,
}) => {
  const { t } = useTranslation();
  const align = getLayoutGuideRowsAlign(guide);

  return (
    <Fragment>
      <LayoutGuideNumberField
        ariaLabel={t(`${translationNameSpace}.settings.fields.count`)}
        label={t(`${translationNameSpace}.settings.labels.count`)}
        min={1}
        onBlur={onBlur('count', 1)}
        onScrub={onScrub('count', 1)}
        value={getLayoutGuideFieldValue(guide, 'count')}
      />
      <EffectColorField
        alpha={guide.opacity}
        e2eValue="layout-guide"
        hex={guide.color}
        label={t(`${translationNameSpace}.settings.labels.color`)}
        onCommitAlpha={onCommitAlpha}
        onCommitHex={onCommitHex}
        onDragEnd={onDragEnd}
        onDragStart={onDragStart}
        onPickerChange={onPickerChange}
        triggerAriaLabel={t(`${translationNameSpace}.settings.colorTriggerAriaLabel`)}
      />
      <LayoutGuideAlignField
        label={t(`${translationNameSpace}.settings.labels.type`)}
        onSelect={(rowsAlign): void => onChange({ ...guide, rowsAlign })}
        options={getLayoutGuideRowsAlignOptions((option) => t(`${translationNameSpace}.settings.rowsAlign.options.${option}`))}
        value={align}
      />
      <LayoutGuideNumberField
        ariaLabel={t(`${translationNameSpace}.settings.fields.height`)}
        disabled={align === LayoutGuideRowsAlign.stretch}
        label={t(`${translationNameSpace}.settings.labels.height`)}
        min={1}
        onBlur={onBlur('height', 1)}
        onScrub={onScrub('height', 1)}
        placeholder={t(`${translationNameSpace}.settings.autoPlaceholder`)}
        value={getLayoutGuideFieldValue(guide, 'height')}
      />
      <LayoutGuideNumberField
        ariaLabel={t(`${translationNameSpace}.settings.fields.margin`)}
        label={t(`${translationNameSpace}.settings.labels.margin`)}
        min={0}
        onBlur={onBlur('margin', 0)}
        onScrub={onScrub('margin', 0)}
        value={getLayoutGuideFieldValue(guide, 'margin')}
      />
      <LayoutGuideNumberField
        ariaLabel={t(`${translationNameSpace}.settings.fields.gutter`)}
        label={t(`${translationNameSpace}.settings.labels.gutter`)}
        min={0}
        onBlur={onBlur('gutter', 0)}
        onScrub={onScrub('gutter', 0)}
        value={getLayoutGuideFieldValue(guide, 'gutter')}
      />
    </Fragment>
  );
};

export default LayoutGuideRowsFields;
