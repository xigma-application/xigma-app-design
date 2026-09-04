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
  const { alignment, gap, isHorizontal, isVisible, onBlurGap, onChangeAlignment, onScrubGap } = useColumnAlignmentLayout();

  if (isVisible) {
    return (
      <UITools.SectionColumn
        buttonsIcon={ColumnAlignmentLayoutButtonIcons(t)}
        gridColumnType={UITools.GridColumnType.oneByTwo}
        labels={[t(`${translationNameSpace}.label.alignment`), t(`${translationNameSpace}.label.gap`)]}
        withBottomMargin
      >
        <AlignmentArea isHorizontal={isHorizontal} onClick={onChangeAlignment} value={alignment} />
        <GapField isHorizontal={isHorizontal} onBlur={onBlurGap} onScrub={onScrubGap} value={gap} />
      </UITools.SectionColumn>
    );
  }

  return null;
};

export default ColumnAlignmentLayout;
