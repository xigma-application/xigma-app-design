import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import StrokeSettingsButton from '../../Common/StrokeSection/StrokeSettingsRow/StrokeSettingsButton/StrokeSettingsButton';
import StrokeWeightField from '../../Common/StrokeSection/StrokeSettingsRow/StrokeWeightField/StrokeWeightField';
import { UITools } from 'shared';

// hooks
import { useEllipseStrokeSettings } from './hooks/useEllipseStrokeSettings';

// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';
import { translationNameSpace as strokeNameSpace } from '../../Common/StrokeSection/constants';

// types
import { StrokeAlign } from 'types/design/enums';

// utils
import { getStrokeAlignOptions } from '../../Common/StrokeSection/StrokeSettingsRow/utils/getStrokeAlignOptions';

const EllipseStrokeSettings: FC = () => {
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
  } = useEllipseStrokeSettings();

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

export default EllipseStrokeSettings;
