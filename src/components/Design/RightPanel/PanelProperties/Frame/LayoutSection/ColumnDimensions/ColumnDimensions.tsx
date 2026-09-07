import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ColumnDimensionsButtonIcons from './ColumnDimensionsButtonIcons';
import ColumnDimensionsField from './ColumnDimensionsField/ColumnDimensionsField';
import { UITools } from 'shared';

// hooks
import { useColumnDimensions } from './hooks/useColumnDimensions';

// others
import { translationNameSpace } from './constants';

const ColumnDimensions: FC = () => {
  const { t } = useTranslation();
  const {
    canFillHeight,
    canFillWidth,
    canHug,
    height,
    heightSizingMode,
    locked,
    onBlurHeight,
    onBlurWidth,
    onDragEnd,
    onDragStart,
    onScrubHeight,
    onScrubWidth,
    onSelectHeightSizingMode,
    onSelectWidthSizingMode,
    onToggleLock,
    width,
    widthSizingMode,
  } = useColumnDimensions();
  const showWidthDropdown = canHug || canFillWidth;
  const showHeightDropdown = canHug || canFillHeight;

  return (
    <UITools.SectionColumn
      buttonsIcon={ColumnDimensionsButtonIcons(locked, onToggleLock, t)}
      gridColumnType={UITools.GridColumnType.twoInputs}
      labels={[t(`${translationNameSpace}.label`)]}
      withBottomMargin
      withInputConnector={locked}
    >
      <ColumnDimensionsField
        ariaLabel={t(`${translationNameSpace}.ariaLabelWidth`)}
        axis="width"
        canFill={canFillWidth}
        canHug={canHug}
        e2eValue="width"
        label="W"
        onBlur={onBlurWidth}
        onDragEnd={onDragEnd}
        onDragStart={onDragStart}
        onScrub={onScrubWidth}
        onSelectSizingMode={showWidthDropdown ? onSelectWidthSizingMode : undefined}
        sizingMode={showWidthDropdown ? widthSizingMode : undefined}
        value={width}
      />
      <ColumnDimensionsField
        ariaLabel={t(`${translationNameSpace}.ariaLabelHeight`)}
        axis="height"
        canFill={canFillHeight}
        canHug={canHug}
        e2eValue="height"
        label="H"
        onBlur={onBlurHeight}
        onDragEnd={onDragEnd}
        onDragStart={onDragStart}
        onScrub={onScrubHeight}
        onSelectSizingMode={showHeightDropdown ? onSelectHeightSizingMode : undefined}
        sizingMode={showHeightDropdown ? heightSizingMode : undefined}
        value={height}
      />
    </UITools.SectionColumn>
  );
};

export default ColumnDimensions;
