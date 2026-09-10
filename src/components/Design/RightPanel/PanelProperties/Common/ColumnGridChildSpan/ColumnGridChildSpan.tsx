import { FC, FocusEvent } from 'react';
import { useTranslation } from 'react-i18next';

// components
import TextFieldWrapper from 'shared/UITools/TextField/TextFieldWrapper/TextFieldWrapper';
import { Icon, ScrubbableInput, UITools } from 'shared';

// hooks
import { useColumnGridChildSpan } from './hooks/useColumnGridChildSpan';

// others
import { translationNameSpace } from './constants';

// styles
import styles from './column-grid-child-span.module.scss';

const ColumnGridChildSpan: FC = () => {
  const { t } = useTranslation();
  const { columnSpan, isGridChild, maxColumnSpan, maxRowSpan, onCommitColumnSpan, onCommitRowSpan, rowSpan } = useColumnGridChildSpan();
  const columnSpanLabel = t(`${translationNameSpace}.columnSpanLabel`);
  const rowSpanLabel = t(`${translationNameSpace}.rowSpanLabel`);

  if (!isGridChild) {
    return null;
  }

  const revertOnReject =
    (commit: (raw: string) => boolean, current: string) =>
    (event: FocusEvent<HTMLInputElement>): void => {
      if (!commit(event.target.value)) {
        event.target.value = current;
      }
    };

  return (
    <UITools.SectionColumn gridColumnType={UITools.GridColumnType.twoInputs} labels={[columnSpanLabel, rowSpanLabel]} withBottomMargin>
      <TextFieldWrapper
        aria-label={columnSpanLabel}
        className={styles.ColumnGridChildSpan__input}
        defaultValue={columnSpan}
        e2eValue="grid-column-span"
        onBlur={revertOnReject(onCommitColumnSpan, columnSpan)}
        startAdornment={
          <ScrubbableInput
            max={maxColumnSpan}
            min={1}
            onChange={(next) => onCommitColumnSpan(next.toString())}
            value={parseInt(columnSpan, 10)}
          >
            <Icon color="neutral2" name="GridColumnSpan" size={24} />
          </ScrubbableInput>
        }
        type="text"
      />
      <TextFieldWrapper
        aria-label={rowSpanLabel}
        className={styles.ColumnGridChildSpan__input}
        defaultValue={rowSpan}
        e2eValue="grid-row-span"
        onBlur={revertOnReject(onCommitRowSpan, rowSpan)}
        startAdornment={
          <ScrubbableInput max={maxRowSpan} min={1} onChange={(next) => onCommitRowSpan(next.toString())} value={parseInt(rowSpan, 10)}>
            <Icon color="neutral2" name="GridRowSpan" size={24} />
          </ScrubbableInput>
        }
        type="text"
      />
    </UITools.SectionColumn>
  );
};

export default ColumnGridChildSpan;
