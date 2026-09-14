import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// @xigma
import { Icon } from '@xigma/components';

// components
import { UITools } from 'shared';

// others
import { translationNameSpace } from '../constants';

// styles
import styles from './pattern-source-preview.module.scss';

export const PatternSourcePreview: FC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.PatternSourcePreview}>
      <UITools.Button color="secondary" size="small" variant="outline">
        <Icon name="Source" size={24} />
        {t(`${translationNameSpace}.selectSourceLabel`)}
      </UITools.Button>
    </div>
  );
};

export default PatternSourcePreview;
