import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ColumnPositionField from '../../../Common/PositionSection/ColumnPosition/ColumnPositionField/ColumnPositionField';
import { UITools } from 'shared';

// hooks
import { useVectorEditPosition } from '../hooks/useVectorEditPosition';

// others
import { translationNameSpace } from '../../../Common/PositionSection/ColumnPosition/constants';

const VectorEditPosition: FC = () => {
  const { t } = useTranslation();
  const { disabled, displayX, displayY, onBlurX, onBlurY, onDragEnd, onDragStart, onScrubX, onScrubY, x, y } = useVectorEditPosition();

  return (
    <UITools.SectionColumn gridColumnType={UITools.GridColumnType.twoInputs} labels={[t(`${translationNameSpace}.label`)]} withBottomMargin>
      <ColumnPositionField
        ariaLabel={t(`${translationNameSpace}.ariaLabelX`)}
        disabled={disabled}
        displayValue={displayX}
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
        disabled={disabled}
        displayValue={displayY}
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

export default VectorEditPosition;
