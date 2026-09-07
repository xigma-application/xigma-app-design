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
    hasMaxHeightValue,
    hasMaxWidthValue,
    hasMinHeightValue,
    hasMinWidthValue,
    height,
    heightSizingMode,
    locked,
    maxHeightShown,
    maxHeightValue,
    maxWidthShown,
    maxWidthValue,
    minHeightShown,
    minHeightValue,
    minWidthShown,
    minWidthValue,
    onBlurHeight,
    onBlurWidth,
    onDragEnd,
    onDragStart,
    onRemoveHeightBounds,
    onRemoveWidthBounds,
    onRevealMaxHeight,
    onRevealMaxWidth,
    onRevealMinHeight,
    onRevealMinWidth,
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
        hasMax={hasMaxWidthValue}
        hasMin={hasMinWidthValue}
        label="W"
        maxShown={maxWidthShown}
        maxValue={maxWidthValue}
        minShown={minWidthShown}
        minValue={minWidthValue}
        onBlur={onBlurWidth}
        onDragEnd={onDragEnd}
        onDragStart={onDragStart}
        onRemoveBounds={onRemoveWidthBounds}
        onRevealMax={onRevealMaxWidth}
        onRevealMin={onRevealMinWidth}
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
        hasMax={hasMaxHeightValue}
        hasMin={hasMinHeightValue}
        label="H"
        maxShown={maxHeightShown}
        maxValue={maxHeightValue}
        minShown={minHeightShown}
        minValue={minHeightValue}
        onBlur={onBlurHeight}
        onDragEnd={onDragEnd}
        onDragStart={onDragStart}
        onRemoveBounds={onRemoveHeightBounds}
        onRevealMax={onRevealMaxHeight}
        onRevealMin={onRevealMinHeight}
        onScrub={onScrubHeight}
        onSelectSizingMode={showHeightDropdown ? onSelectHeightSizingMode : undefined}
        sizingMode={showHeightDropdown ? heightSizingMode : undefined}
        value={height}
      />
    </UITools.SectionColumn>
  );
};

export default ColumnDimensions;
