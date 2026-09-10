import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import TextFieldWrapper from 'shared/UITools/TextField/TextFieldWrapper/TextFieldWrapper';
import { Icon, UITools } from 'shared';

// hooks
import { useColumnGridChildSpan } from './hooks/useColumnGridChildSpan';

// others
import { translationNameSpace } from './constants';

// styles
import styles from './column-grid-child-span.module.scss';

const ColumnGridChildSpan: FC = () => {
  const { t } = useTranslation();
  const { columnSpan, isGridChild, rowSpan } = useColumnGridChildSpan();

  if (!isGridChild) {
    return null;
  }

  const columnSpanLabel = t(`${translationNameSpace}.columnSpanLabel`);
  const rowSpanLabel = t(`${translationNameSpace}.rowSpanLabel`);

  return (
    <UITools.SectionColumn gridColumnType={UITools.GridColumnType.twoInputs} labels={[columnSpanLabel, rowSpanLabel]} withBottomMargin>
      <TextFieldWrapper
        aria-label={columnSpanLabel}
        className={styles.ColumnGridChildSpan__input}
        defaultValue={String(columnSpan)}
        e2eValue="grid-column-span"
        startAdornment={<Icon color="neutral2" name="GridColumnSpan" size={24} />}
        type="text"
      />
      <TextFieldWrapper
        aria-label={rowSpanLabel}
        className={styles.ColumnGridChildSpan__input}
        defaultValue={String(rowSpan)}
        e2eValue="grid-row-span"
        startAdornment={<Icon color="neutral2" name="GridRowSpan" size={24} />}
        type="text"
      />
    </UITools.SectionColumn>
  );
};

export default ColumnGridChildSpan;
