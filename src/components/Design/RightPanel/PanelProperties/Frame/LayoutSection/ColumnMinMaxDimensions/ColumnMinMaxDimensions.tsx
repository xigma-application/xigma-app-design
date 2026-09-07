import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ColumnMinMaxDimensionsField from './ColumnMinMaxDimensionsField';
import { UITools } from 'shared';

// hooks
import { useColumnMinMaxDimensions } from './hooks/useColumnMinMaxDimensions';
import { useDimensionsCommit } from '../ColumnDimensions/hooks/useDimensionsCommit';

// others
import { translationNameSpace } from './constants';

const ColumnMinMaxDimensions: FC = () => {
  const { t } = useTranslation();
  const {
    hasMaxHeight,
    hasMaxWidth,
    hasMinHeight,
    hasMinWidth,
    maxHeight,
    maxWidth,
    minHeight,
    minWidth,
    onCommitMaxHeight,
    onCommitMaxWidth,
    onCommitMinHeight,
    onCommitMinWidth,
    onDragEnd,
    onDragStart,
  } = useColumnMinMaxDimensions();

  const onBlurMinWidth = useDimensionsCommit(minWidth ?? 0, onCommitMinWidth);
  const onBlurMinHeight = useDimensionsCommit(minHeight ?? 0, onCommitMinHeight);
  const onBlurMaxWidth = useDimensionsCommit(maxWidth ?? 0, onCommitMaxWidth);
  const onBlurMaxHeight = useDimensionsCommit(maxHeight ?? 0, onCommitMaxHeight);

  if (!hasMinWidth && !hasMinHeight && !hasMaxWidth && !hasMaxHeight) {
    return null;
  }

  return (
    <>
      {(hasMinWidth || hasMinHeight) && (
        <UITools.SectionColumn
          gridColumnType={UITools.GridColumnType.twoInputs}
          labels={[t(`${translationNameSpace}.minLabel`)]}
          withBottomMargin
        >
          {hasMinWidth && (
            <ColumnMinMaxDimensionsField
              ariaLabel={t(`${translationNameSpace}.ariaLabelMinWidth`)}
              e2eValue="min-width"
              hintField="minWidth"
              icon="MinWidth"
              onBlur={onBlurMinWidth}
              onDragEnd={onDragEnd}
              onDragStart={onDragStart}
              onScrub={onCommitMinWidth}
              value={minWidth}
            />
          )}
          {hasMinHeight && (
            <ColumnMinMaxDimensionsField
              ariaLabel={t(`${translationNameSpace}.ariaLabelMinHeight`)}
              e2eValue="min-height"
              hintField="minHeight"
              icon="MinHeight"
              onBlur={onBlurMinHeight}
              onDragEnd={onDragEnd}
              onDragStart={onDragStart}
              onScrub={onCommitMinHeight}
              value={minHeight}
            />
          )}
        </UITools.SectionColumn>
      )}
      {(hasMaxWidth || hasMaxHeight) && (
        <UITools.SectionColumn
          gridColumnType={UITools.GridColumnType.twoInputs}
          labels={[t(`${translationNameSpace}.maxLabel`)]}
          withBottomMargin
        >
          {hasMaxWidth && (
            <ColumnMinMaxDimensionsField
              ariaLabel={t(`${translationNameSpace}.ariaLabelMaxWidth`)}
              e2eValue="max-width"
              hintField="maxWidth"
              icon="MaxWidth"
              onBlur={onBlurMaxWidth}
              onDragEnd={onDragEnd}
              onDragStart={onDragStart}
              onScrub={onCommitMaxWidth}
              value={maxWidth}
            />
          )}
          {hasMaxHeight && (
            <ColumnMinMaxDimensionsField
              ariaLabel={t(`${translationNameSpace}.ariaLabelMaxHeight`)}
              e2eValue="max-height"
              hintField="maxHeight"
              icon="MaxHeight"
              onBlur={onBlurMaxHeight}
              onDragEnd={onDragEnd}
              onDragStart={onDragStart}
              onScrub={onCommitMaxHeight}
              value={maxHeight}
            />
          )}
        </UITools.SectionColumn>
      )}
    </>
  );
};

export default ColumnMinMaxDimensions;
