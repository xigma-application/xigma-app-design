import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ColumnSpacingField from './ColumnSpacingField';
import { UITools } from 'shared';

// hooks
import { useColumnSpacing } from './hooks/useColumnSpacing';

// others
import { translationNameSpace } from './constants';

const ColumnSpacing: FC = () => {
  const { t } = useTranslation();
  const {
    displayHorizontal,
    displayVertical,
    horizontal,
    isVisible,
    onBlurHorizontal,
    onBlurVertical,
    onDragEnd,
    onDragStart,
    onScrubHorizontal,
    onScrubVertical,
    vertical,
  } = useColumnSpacing();

  if (isVisible) {
    return (
      <UITools.SectionColumn
        gridColumnType={UITools.GridColumnType.twoInputs}
        labels={[t(`${translationNameSpace}.label`)]}
        withBottomMargin
      >
        <ColumnSpacingField
          ariaLabel={t(`${translationNameSpace}.ariaLabelHorizontal`)}
          displayValue={displayHorizontal}
          e2eValue="spacing-horizontal"
          icon="SpacingHorizontal"
          onBlur={onBlurHorizontal}
          onDragEnd={onDragEnd}
          onDragStart={onDragStart}
          onScrub={onScrubHorizontal}
          tooltip={t(`${translationNameSpace}.tooltipHorizontal`)}
          value={horizontal}
        />
        <ColumnSpacingField
          ariaLabel={t(`${translationNameSpace}.ariaLabelVertical`)}
          displayValue={displayVertical}
          e2eValue="spacing-vertical"
          icon="SpacingVertical"
          onBlur={onBlurVertical}
          onDragEnd={onDragEnd}
          onDragStart={onDragStart}
          onScrub={onScrubVertical}
          tooltip={t(`${translationNameSpace}.tooltipVertical`)}
          value={vertical}
        />
      </UITools.SectionColumn>
    );
  }

  return null;
};

export default ColumnSpacing;
