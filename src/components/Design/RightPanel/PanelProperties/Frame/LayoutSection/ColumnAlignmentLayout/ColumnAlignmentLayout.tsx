import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import AlignmentArea from './AlignmentArea/AlignmentArea';
import ColumnAlignmentLayoutButtonIcons from './ColumnAlignmentLayoutButtonIcons';
import GapField from './GapField/GapField';
import { UITools } from 'shared';

// hooks
import { useColumnAlignmentLayout } from './hooks/useColumnAlignmentLayout';

// others
import { translationNameSpace } from './constants';

const ColumnAlignmentLayout: FC = () => {
  const { t } = useTranslation();
  const {
    alignment,
    horizontalGap,
    isHorizontal,
    isHorizontalGapAuto,
    isHorizontalGapModeDisabled,
    isVerticalGapAuto,
    isVerticalGapModeDisabled,
    isVisible,
    isWrap,
    onBlurHorizontalGap,
    onBlurVerticalGap,
    onChangeAlignment,
    onScrubHorizontalGap,
    onScrubVerticalGap,
    onToggleHorizontalGapMode,
    onToggleVerticalGapMode,
    verticalGap,
  } = useColumnAlignmentLayout();

  if (isVisible) {
    return (
      <UITools.SectionColumn
        buttonsIcon={ColumnAlignmentLayoutButtonIcons(t)}
        gridColumnType={UITools.GridColumnType.oneByTwo}
        labels={[t(`${translationNameSpace}.label.alignment`), t(`${translationNameSpace}.label.gap`)]}
        withBottomMargin
      >
        <AlignmentArea
          isGapAutoHorizontal={isHorizontalGapAuto}
          isGapAutoVertical={isVerticalGapAuto}
          isHorizontal={isHorizontal}
          isWrap={isWrap}
          onClick={onChangeAlignment}
          value={alignment}
        />
        {isHorizontal && (
          <GapField
            isHorizontal
            isModeAuto={isHorizontalGapAuto}
            isModeToggleDisabled={isHorizontalGapModeDisabled}
            onBlur={onBlurHorizontalGap}
            onScrub={onScrubHorizontalGap}
            onToggleMode={onToggleHorizontalGapMode}
            value={horizontalGap}
          />
        )}
        {(!isHorizontal || isWrap) && (
          <GapField
            isHorizontal={false}
            isModeAuto={isVerticalGapAuto}
            isModeToggleDisabled={isVerticalGapModeDisabled}
            onBlur={onBlurVerticalGap}
            onScrub={onScrubVerticalGap}
            onToggleMode={onToggleVerticalGapMode}
            value={verticalGap}
          />
        )}
      </UITools.SectionColumn>
    );
  }

  return null;
};

export default ColumnAlignmentLayout;
