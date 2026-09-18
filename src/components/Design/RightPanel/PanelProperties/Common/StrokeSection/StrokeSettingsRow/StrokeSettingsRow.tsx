import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// @xigma
import { Tooltip } from '@xigma/components';

// components
import StrokeSideFields from './StrokeSideFields/StrokeSideFields';
import StrokeSidesMenu from './StrokeSidesMenu/StrokeSidesMenu';
import StrokeWeightField from './StrokeWeightField/StrokeWeightField';
import { UITools } from 'shared';

// hooks
import { useStrokeSettingsRow } from './hooks/useStrokeSettingsRow';

// others
import { getStrokeAlignOptions } from './utils/getStrokeAlignOptions';
import { translationNameSpace } from '../constants';

// types
import { StrokeAlign, StrokeSides } from 'types/design/enums';

const StrokeSettingsRow: FC = () => {
  const { t } = useTranslation();
  const {
    isWeightMixed,
    onPositionSelect,
    onSideBlur,
    onSideScrub,
    onSidesSelect,
    onWeightBlur,
    onWeightDragEnd,
    onWeightDragStart,
    onWeightScrub,
    position,
    sideWeights,
    sides,
    weight,
  } = useStrokeSettingsRow();
  const options = getStrokeAlignOptions((strokeAlign) => t(`${translationNameSpace}.position.options.${strokeAlign}`));

  return (
    <UITools.SectionColumn
      buttonsIcon={[
        <Tooltip align="end" content={t(`${translationNameSpace}.advancedSettingsTooltip`)} key="advanced">
          <UITools.ButtonIcon ariaLabel={t(`${translationNameSpace}.advancedSettingsAriaLabel`)} name="Properties" />
        </Tooltip>,
        <StrokeSidesMenu key="individual" onSelect={onSidesSelect} sides={sides} />,
      ]}
      gridColumnType={UITools.GridColumnType.twoInputs}
      labels={[t(`${translationNameSpace}.position.label`), t(`${translationNameSpace}.weight.label`)]}
      withTopAlignedButtons
      withTopMargin
    >
      <UITools.Dropdown<StrokeAlign>
        bypassGlobalShortcuts={false}
        onSelect={onPositionSelect}
        options={options}
        textAlign="left"
        value={position}
        variant="outline"
      />
      <StrokeWeightField
        ariaLabel={t(`${translationNameSpace}.weight.ariaLabel`)}
        displayValue={isWeightMixed ? t(`${translationNameSpace}.weight.mixed`) : `${weight}`}
        onBlur={onWeightBlur}
        onDragEnd={onWeightDragEnd}
        onDragStart={onWeightDragStart}
        onScrub={onWeightScrub}
        scrubValue={weight}
      />
      {sides === StrokeSides.custom && (
        <StrokeSideFields
          onDragEnd={onWeightDragEnd}
          onDragStart={onWeightDragStart}
          onSideBlur={onSideBlur}
          onSideScrub={onSideScrub}
          sideWeights={sideWeights}
        />
      )}
    </UITools.SectionColumn>
  );
};

export default StrokeSettingsRow;
