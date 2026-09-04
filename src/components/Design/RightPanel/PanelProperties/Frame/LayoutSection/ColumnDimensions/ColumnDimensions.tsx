import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ColumnDimensionsButtonIcons from './ColumnDimensionsButtonIcons';
import ColumnDimensionsField from './ColumnDimensionsField/ColumnDimensionsField';
import { GridColumnType, SectionColumn } from 'shared';

// hooks
import { useColumnDimensions } from './hooks/useColumnDimensions';

// others
import { translationNameSpace } from './constants';

const ColumnDimensions: FC = () => {
  const { t } = useTranslation();
  const { height, locked, onBlurHeight, onBlurWidth, onDragEnd, onDragStart, onScrubHeight, onScrubWidth, onToggleLock, width } =
    useColumnDimensions();

  return (
    <SectionColumn
      buttonsIcon={ColumnDimensionsButtonIcons(locked, onToggleLock, t)}
      gridColumnType={GridColumnType.twoInputs}
      labels={[t(`${translationNameSpace}.label`)]}
      withBottomMargin
      withInputConnector={locked}
    >
      <ColumnDimensionsField
        ariaLabel={t(`${translationNameSpace}.ariaLabelWidth`)}
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
        e2eValue="height"
        label="H"
        onBlur={onBlurHeight}
        onDragEnd={onDragEnd}
        onDragStart={onDragStart}
        onScrub={onScrubHeight}
        value={height}
      />
    </SectionColumn>
  );
};

export default ColumnDimensions;
