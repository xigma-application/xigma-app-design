import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import AlignmentArea from './AlignmentArea/AlignmentArea';
import ColumnAlignmentLayoutButtonIcons from './ColumnAlignmentLayoutButtonIcons';
import GapField from './GapField/GapField';
import GridArea from './GridArea/GridArea';
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
    gridArea,
    horizontalGap,
    horizontalGapDisplay,
    horizontalGapMode,
    isAlignmentMixed,
    isBaselineAligned,
    isGrid,
    isHorizontal,
    isHorizontalGapModeDisabled,
    isVerticalGapModeDisabled,
    isVisible,
    isWrap,
    onChangeAlignment,
    onCommitHorizontalGap,
    onCommitVerticalGap,
    onGapDragEnd,
    onGapDragStart,
    onRemoveBaselineAlignment,
    onScrubHorizontalGap,
    onScrubVerticalGap,
    onSelectHorizontalGapAuto,
    onSelectHorizontalGapFixed,
    onSelectVerticalGapAuto,
    onSelectVerticalGapFixed,
    verticalGap,
    verticalGapDisplay,
    verticalGapMode,
  } = useColumnAlignmentLayout();

  if (isVisible) {
    return (
      <UITools.SectionColumn
        buttonsIcon={ColumnAlignmentLayoutButtonIcons()}
        gridColumnType={UITools.GridColumnType.oneByTwo}
        labels={[t(`${translationNameSpace}.label.${isGrid ? 'grid' : 'alignment'}`), t(`${translationNameSpace}.label.gap`)]}
        withBottomMargin
        withTopAlignedButtons
      >
        {isGrid ? (
          <GridArea grid={gridArea} />
        ) : (
          <AlignmentArea
            isBaselineAligned={isBaselineAligned}
            isMixed={isAlignmentMixed}
            isGapAutoHorizontal={horizontalGapMode === GapMode.auto}
            isGapAutoVertical={verticalGapMode === GapMode.auto}
            isHorizontal={isHorizontal}
            isWrap={isWrap}
            onClick={onChangeAlignment}
            onRemoveBaselineAlignment={onRemoveBaselineAlignment}
            value={alignment}
          />
        )}
        {(isGrid || isHorizontal || isWrap) && (
          <GapField
            isGrid={isGrid}
            isHorizontal
            mode={horizontalGapMode}
            modeDisabled={isHorizontalGapModeDisabled}
            displayValue={horizontalGapDisplay}
            onCommit={onCommitHorizontalGap}
            onDragEnd={onGapDragEnd}
            onDragStart={onGapDragStart}
            onScrub={onScrubHorizontalGap}
            onSelectAuto={onSelectHorizontalGapAuto}
            onSelectFixed={onSelectHorizontalGapFixed}
            value={horizontalGap}
          />
        )}
        {(isGrid || !isHorizontal || isWrap) && (
          <GapField
            isGrid={isGrid}
            isHorizontal={false}
            mode={verticalGapMode}
            modeDisabled={isVerticalGapModeDisabled}
            displayValue={verticalGapDisplay}
            onCommit={onCommitVerticalGap}
            onDragEnd={onGapDragEnd}
            onDragStart={onGapDragStart}
            onScrub={onScrubVerticalGap}
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
