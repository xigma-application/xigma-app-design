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
    horizontalGapMode,
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
        labels={[t(`${translationNameSpace}.label.${isGrid ? 'grid' : 'alignment'}`), t(`${translationNameSpace}.label.gap`)]}
        withBottomMargin
        withTopAlignedButtons
      >
        {isGrid ? (
          <GridArea grid={gridArea} />
        ) : (
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
        )}
        {(isGrid || isHorizontal) && (
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
        {(isGrid || !isHorizontal || isWrap) && (
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
