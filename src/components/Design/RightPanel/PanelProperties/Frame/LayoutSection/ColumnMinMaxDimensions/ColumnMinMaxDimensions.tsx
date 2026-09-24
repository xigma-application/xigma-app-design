import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ColumnMinMaxDimensionsField from './ColumnMinMaxDimensionsField';
import { UITools } from 'shared';

// hooks
import { useColumnMinMaxDimensions } from './hooks/useColumnMinMaxDimensions';
import { useDimensionsCommit } from '../../../Common/ColumnDimensions/hooks/useDimensionsCommit';

// others
import { translationNameSpace } from './constants';

const ColumnMinMaxDimensions: FC = () => {
  const { t } = useTranslation();
  const {
    disabledMaxHeight,
    disabledMaxWidth,
    disabledMinHeight,
    disabledMinWidth,
    displayMaxHeight,
    displayMaxWidth,
    displayMinHeight,
    displayMinWidth,
    hasMaxHeight,
    hasMaxWidth,
    hasMinHeight,
    hasMinWidth,
    maxHeight,
    maxWidth,
    minHeight,
    minWidth,
    onBlurCommitMaxHeight,
    onBlurCommitMaxWidth,
    onBlurCommitMinHeight,
    onBlurCommitMinWidth,
    onCommitMaxHeight,
    onCommitMaxWidth,
    onCommitMinHeight,
    onCommitMinWidth,
    onDragEnd,
    onDragStart,
  } = useColumnMinMaxDimensions();

  const onBlurMinWidth = useDimensionsCommit(displayMinWidth ?? 0, onBlurCommitMinWidth);
  const onBlurMinHeight = useDimensionsCommit(displayMinHeight ?? 0, onBlurCommitMinHeight);
  const onBlurMaxWidth = useDimensionsCommit(displayMaxWidth ?? 0, onBlurCommitMaxWidth);
  const onBlurMaxHeight = useDimensionsCommit(displayMaxHeight ?? 0, onBlurCommitMaxHeight);

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
              disabled={disabledMinWidth}
              displayValue={displayMinWidth}
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
              disabled={disabledMinHeight}
              displayValue={displayMinHeight}
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
              disabled={disabledMaxWidth}
              displayValue={displayMaxWidth}
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
              disabled={disabledMaxHeight}
              displayValue={displayMaxHeight}
              value={maxHeight}
            />
          )}
        </UITools.SectionColumn>
      )}
    </>
  );
};

export default ColumnMinMaxDimensions;
