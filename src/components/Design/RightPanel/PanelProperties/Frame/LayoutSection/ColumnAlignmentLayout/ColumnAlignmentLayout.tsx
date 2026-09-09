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

// types
import { GapMode } from 'types/design/enums';

const ColumnAlignmentLayout: FC = () => {
  const { t } = useTranslation();
  const {
    alignment,
    horizontalGap,
    horizontalGapMode,
    isBaselineAligned,
    isHorizontal,
    isHorizontalGapModeDisabled,
    isVerticalGapModeDisabled,
    isVisible,
    isWrap,
    onChangeAlignment,
    onCommitHorizontalGap,
    onCommitVerticalGap,
    onRemoveBaselineAlignment,
    onSelectHorizontalGapAuto,
    onSelectHorizontalGapFixed,
    onSelectVerticalGapAuto,
    onSelectVerticalGapFixed,
    verticalGap,
    verticalGapMode,
  } = useColumnAlignmentLayout();

  if (isVisible) {
    return (
      <UITools.SectionColumn
        buttonsIcon={ColumnAlignmentLayoutButtonIcons()}
        gridColumnType={UITools.GridColumnType.oneByTwo}
        labels={[t(`${translationNameSpace}.label.alignment`), t(`${translationNameSpace}.label.gap`)]}
        withBottomMargin
      >
        <AlignmentArea
          isBaselineAligned={isBaselineAligned}
          isGapAutoHorizontal={horizontalGapMode === GapMode.auto}
          isGapAutoVertical={verticalGapMode === GapMode.auto}
          isHorizontal={isHorizontal}
          isWrap={isWrap}
          onClick={onChangeAlignment}
          onRemoveBaselineAlignment={onRemoveBaselineAlignment}
          value={alignment}
        />
        {isHorizontal && (
          <GapField
            isHorizontal
            mode={horizontalGapMode}
            modeDisabled={isHorizontalGapModeDisabled}
            onCommit={onCommitHorizontalGap}
            onSelectAuto={onSelectHorizontalGapAuto}
            onSelectFixed={onSelectHorizontalGapFixed}
            value={horizontalGap}
          />
        )}
        {(!isHorizontal || isWrap) && (
          <GapField
            isHorizontal={false}
            mode={verticalGapMode}
            modeDisabled={isVerticalGapModeDisabled}
            onCommit={onCommitVerticalGap}
            onSelectAuto={onSelectVerticalGapAuto}
            onSelectFixed={onSelectVerticalGapFixed}
            value={verticalGap}
          />
        )}
      </UITools.SectionColumn>
    );
  }

  return null;
};

export default ColumnAlignmentLayout;
