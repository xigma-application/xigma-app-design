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
    isVisible,
    isWrap,
    onBlurHorizontalGap,
    onBlurVerticalGap,
    onChangeAlignment,
    onScrubHorizontalGap,
    onScrubVerticalGap,
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
          isGapAutoHorizontal={false}
          isGapAutoVertical={false}
          isHorizontal={isHorizontal}
          isWrap={isWrap}
          onClick={onChangeAlignment}
          value={alignment}
        />
        {isHorizontal && <GapField isHorizontal onBlur={onBlurHorizontalGap} onScrub={onScrubHorizontalGap} value={horizontalGap} />}
        {(!isHorizontal || isWrap) && (
          <GapField isHorizontal={false} onBlur={onBlurVerticalGap} onScrub={onScrubVerticalGap} value={verticalGap} />
        )}
      </UITools.SectionColumn>
    );
  }

  return null;
};

export default ColumnAlignmentLayout;
