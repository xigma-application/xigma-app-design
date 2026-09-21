import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Snackbar } from 'shared';

// others
import { translationNameSpace } from './constants';

// store
import { selectIsExporting } from 'store/design/selectors';
import { useAppSelector } from 'store';

// styles
import styles from './export-hint.module.scss';

const ExportHint: FC = () => {
  const { t } = useTranslation();
  const isExporting = useAppSelector(selectIsExporting);

  if (!isExporting) {
    return null;
  }

  return (
    <Snackbar className={styles.ExportHint}>
      <span className={styles.ExportHint__label}>{t(`${translationNameSpace}.exporting`)}</span>
    </Snackbar>
  );
};

export default ExportHint;
