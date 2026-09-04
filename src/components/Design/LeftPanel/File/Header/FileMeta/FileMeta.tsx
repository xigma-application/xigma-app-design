import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { noop } from 'lodash';

// components
import { UITools } from 'shared';

// others
import { translationNameSpace } from '../../constants';

// styles
import styles from './file-meta.module.scss';

const FileMeta: FC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.FileMeta}>
      <UITools.Chip onClick={noop} variant="secondary">
        {t(`${translationNameSpace}.drafts`)}
      </UITools.Chip>
      <UITools.Chip variant="free">{t(`${translationNameSpace}.subscription.free`)}</UITools.Chip>
    </div>
  );
};

export default FileMeta;
