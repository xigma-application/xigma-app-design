import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// @xigma
import { Icon } from '@xigma/components';

// components
import { UITools } from 'shared';

// others
import { translationNameSpace } from '../constants';

// styles
import styles from './image-source-preview.module.scss';

export const ImageSourcePreview: FC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.ImageSourcePreview}>
      <UITools.Button color="primary" size="small" variant="solid">
        {t(`${translationNameSpace}.uploadFromComputerLabel`)}
      </UITools.Button>
      <UITools.Button color="secondary" size="small" variant="solid">
        <Icon name="Image" size={24} />
        {t(`${translationNameSpace}.makeAnImageLabel`)}
      </UITools.Button>
    </div>
  );
};

export default ImageSourcePreview;
