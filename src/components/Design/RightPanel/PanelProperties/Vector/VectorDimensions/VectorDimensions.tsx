import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ColumnDimensionsButtonIcons from '../../Common/ColumnDimensions/ColumnDimensionsButtonIcons';
import ColumnDimensionsField from '../../Common/ColumnDimensions/ColumnDimensionsField/ColumnDimensionsField';
import { UITools } from 'shared';

// hooks
import { useVectorDimensions } from './hooks/useVectorDimensions';

// others
import { translationNameSpace } from '../../Common/ColumnDimensions/constants';

const VectorDimensions: FC = () => {
  const { t } = useTranslation();
  const {
    displayHeight,
    displayWidth,
    height,
    locked,
    onBlurHeight,
    onBlurWidth,
    onDragEnd,
    onDragStart,
    onScrubHeight,
    onScrubWidth,
    onToggleLock,
    width,
  } = useVectorDimensions();

  return (
    <UITools.SectionColumn
      buttonsIcon={ColumnDimensionsButtonIcons(locked, false, onToggleLock, t)}
      gridColumnType={UITools.GridColumnType.twoInputs}
      labels={[t(`${translationNameSpace}.label`)]}
      withBottomMargin
      withInputConnector={locked}
    >
      <ColumnDimensionsField
        ariaLabel={t(`${translationNameSpace}.ariaLabelWidth`)}
        axis="width"
        displayValue={displayWidth}
        e2eValue="width"
        label="W"
        onBlur={onBlurWidth}
        onDragEnd={onDragEnd}
        onDragStart={onDragStart}
        onScrub={onScrubWidth}
        value={width}
      />
      <ColumnDimensionsField
        ariaLabel={t(`${translationNameSpace}.ariaLabelHeight`)}
        axis="height"
        displayValue={displayHeight}
        e2eValue="height"
        label="H"
        onBlur={onBlurHeight}
        onDragEnd={onDragEnd}
        onDragStart={onDragStart}
        onScrub={onScrubHeight}
        value={height}
      />
    </UITools.SectionColumn>
  );
};

export default VectorDimensions;
