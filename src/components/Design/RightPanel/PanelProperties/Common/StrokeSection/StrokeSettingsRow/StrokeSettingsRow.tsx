import { FC } from 'react';
import { noop } from 'lodash';
import { useTranslation } from 'react-i18next';

// @xigma
import { Tooltip } from '@xigma/components';

// components
import StrokeWeightField from './StrokeWeightField/StrokeWeightField';
import { UITools } from 'shared';

// hooks
import { useStrokeSettingsRow } from './hooks/useStrokeSettingsRow';

// others
import { getStrokeAlignOptions } from './utils/getStrokeAlignOptions';
import { translationNameSpace } from '../constants';

// types
import { StrokeAlign } from 'types/design/enums';

const StrokeSettingsRow: FC = () => {
  const { t } = useTranslation();
  const { onWeightBlur, onWeightDragEnd, onWeightDragStart, onWeightScrub, position, weight } = useStrokeSettingsRow();
  const options = getStrokeAlignOptions((strokeAlign) => t(`${translationNameSpace}.position.options.${strokeAlign}`));

  return (
    <UITools.SectionColumn
      buttonsIcon={[
        <Tooltip align="end" content={t(`${translationNameSpace}.advancedSettingsTooltip`)} key="advanced">
          <UITools.ButtonIcon ariaLabel={t(`${translationNameSpace}.advancedSettingsAriaLabel`)} name="Properties" />
        </Tooltip>,
        <Tooltip align="end" content={t(`${translationNameSpace}.individualStrokesTooltip`)} key="individual">
          <UITools.ButtonIcon ariaLabel={t(`${translationNameSpace}.individualStrokesAriaLabel`)} name="Stroke" />
        </Tooltip>,
      ]}
      gridColumnType={UITools.GridColumnType.twoInputs}
      labels={[t(`${translationNameSpace}.position.label`), t(`${translationNameSpace}.weight.label`)]}
      withTopMargin
    >
      <UITools.Dropdown<StrokeAlign>
        bypassGlobalShortcuts={false}
        onSelect={noop}
        options={options}
        textAlign="left"
        value={position}
        variant="outline"
      />
      <StrokeWeightField
        ariaLabel={t(`${translationNameSpace}.weight.ariaLabel`)}
        onBlur={onWeightBlur}
        onDragEnd={onWeightDragEnd}
        onDragStart={onWeightDragStart}
        onScrub={onWeightScrub}
        value={weight}
      />
    </UITools.SectionColumn>
  );
};

export default StrokeSettingsRow;
