import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import StrokeSettingsButton from '../StrokeSection/StrokeSettingsRow/StrokeSettingsButton/StrokeSettingsButton';
import StrokeWeightField from '../StrokeSection/StrokeSettingsRow/StrokeWeightField/StrokeWeightField';
import { UITools } from 'shared';

// hooks
import { useShapeStrokeSettings } from './hooks/useShapeStrokeSettings';

// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';
import { translationNameSpace as strokeNameSpace } from '../StrokeSection/constants';

// types
import { StrokeAlign } from 'types/design/enums';
import { TShapeStrokeNodeType } from '../types';

// utils
import { getStrokeAlignOptions } from '../StrokeSection/StrokeSettingsRow/utils/getStrokeAlignOptions';

export type TShapeStrokeSettingsProps = { type: TShapeStrokeNodeType };

const ShapeStrokeSettings: FC<TShapeStrokeSettingsProps> = ({ type }) => {
  const { t } = useTranslation();
  const {
    isNonBasicMode,
    isStrokeModeMixed,
    isWeightMixed,
    onPositionSelect,
    onWeightBlur,
    onWeightDragEnd,
    onWeightDragStart,
    onWeightScrub,
    position,
    weight,
  } = useShapeStrokeSettings(type);

  return (
    <UITools.SectionColumn
      buttonsIcon={[<StrokeSettingsButton disabled={isStrokeModeMixed} key="advanced" />]}
      gridColumnType={UITools.GridColumnType.twoInputs}
      labels={[t(`${strokeNameSpace}.position.label`), t(`${strokeNameSpace}.weight.label`)]}
      withTopAlignedButtons
      withTopMargin
    >
      <UITools.Dropdown<StrokeAlign>
        bypassGlobalShortcuts={false}
        disabled={isNonBasicMode}
        onSelect={onPositionSelect}
        options={getStrokeAlignOptions((strokeAlign) => t(`${strokeNameSpace}.position.options.${strokeAlign}`))}
        placeholder={MIXED_LABEL}
        textAlign="left"
        truncate={false}
        value={position}
        variant="outline"
      />
      <StrokeWeightField
        ariaLabel={t(`${strokeNameSpace}.weight.ariaLabel`)}
        displayValue={isWeightMixed ? MIXED_LABEL : `${weight}`}
        onBlur={onWeightBlur}
        onDragEnd={onWeightDragEnd}
        onDragStart={onWeightDragStart}
        onScrub={onWeightScrub}
        scrubValue={weight}
      />
    </UITools.SectionColumn>
  );
};

export default ShapeStrokeSettings;
