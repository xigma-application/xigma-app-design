import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ColumnPositionField from './ColumnPositionField/ColumnPositionField';
import { UITools } from 'shared';

// hooks
import { useColumnPosition } from './hooks/useColumnPosition';

// others
import { translationNameSpace } from './constants';

const ColumnPosition: FC = () => {
  const { t } = useTranslation();
  const { onBlurX, onBlurY, onDragEnd, onDragStart, onScrubX, onScrubY, x, y } = useColumnPosition();

  return (
    <UITools.SectionColumn gridColumnType={UITools.GridColumnType.twoInputs} labels={[t(`${translationNameSpace}.label`)]} withBottomMargin>
      <ColumnPositionField
        ariaLabel={t(`${translationNameSpace}.ariaLabelX`)}
        e2eValue="x"
        label="X"
        onBlur={onBlurX}
        onDragEnd={onDragEnd}
        onDragStart={onDragStart}
        onScrub={onScrubX}
        tooltip={t(`${translationNameSpace}.tooltipX`)}
        value={x}
      />
      <ColumnPositionField
        ariaLabel={t(`${translationNameSpace}.ariaLabelY`)}
        e2eValue="y"
        label="Y"
        onBlur={onBlurY}
        onDragEnd={onDragEnd}
        onDragStart={onDragStart}
        onScrub={onScrubY}
        tooltip={t(`${translationNameSpace}.tooltipY`)}
        value={y}
      />
    </UITools.SectionColumn>
  );
};

export default ColumnPosition;
