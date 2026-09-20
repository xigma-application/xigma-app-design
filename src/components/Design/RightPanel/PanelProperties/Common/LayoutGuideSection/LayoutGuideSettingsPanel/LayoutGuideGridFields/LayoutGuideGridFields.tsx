import { FC, Fragment, FocusEvent } from 'react';
import { useTranslation } from 'react-i18next';

// components
import EffectColorField from '../../../EffectsSection/EffectSettingsPanel/EffectColorField/EffectColorField';
import LayoutGuideNumberField from '../LayoutGuideNumberField/LayoutGuideNumberField';

// others
import { translationNameSpace } from '../../constants';

// types
import { TColorPickerValue } from 'shared/UITools/ColorPicker/types';
import { TLayoutGuide } from 'types/design/types';

// utils
import { TLayoutGuideNumberField, getLayoutGuideFieldValue } from 'utils/design/layoutGuides/getLayoutGuideFieldValue';

export type TLayoutGuideGridFieldsProps = {
  guide: TLayoutGuide;
  onBlur: (field: TLayoutGuideNumberField, min: number, unit?: string) => TFunc<[FocusEvent<HTMLInputElement>]>;
  onCommitAlpha: TFunc<[number]>;
  onCommitHex: TFunc<[string]>;
  onDragEnd: TFunc;
  onDragStart: TFunc;
  onPickerChange: TFunc<[TColorPickerValue]>;
  onScrub: (field: TLayoutGuideNumberField, min: number) => TFunc<[number]>;
};

export const LayoutGuideGridFields: FC<TLayoutGuideGridFieldsProps> = ({
  guide,
  onBlur,
  onCommitAlpha,
  onCommitHex,
  onDragEnd,
  onDragStart,
  onPickerChange,
  onScrub,
}) => {
  const { t } = useTranslation();

  return (
    <Fragment>
      <LayoutGuideNumberField
        ariaLabel={t(`${translationNameSpace}.settings.fields.size`)}
        label={t(`${translationNameSpace}.settings.labels.size`)}
        min={1}
        onBlur={onBlur('size', 1)}
        onScrub={onScrub('size', 1)}
        value={getLayoutGuideFieldValue(guide, 'size')}
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
    </Fragment>
  );
};

export default LayoutGuideGridFields;
