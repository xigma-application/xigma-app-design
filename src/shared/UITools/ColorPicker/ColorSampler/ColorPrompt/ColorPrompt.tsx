import cx from 'classnames';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Icon } from 'shared';

// others
import { translationNameSpace } from './constants';

// styles
import styles from './color-prompt.module.scss';

export const ColorPrompt: FC = () => {
  const { t } = useTranslation();

  return (
    <div className={cx(styles.ColorPrompt)}>
      <Icon name="EyesDropper" size={12} />
      <span className={styles.ColorPrompt__description}>{t(`${translationNameSpace}.description`)}</span>
    </div>
  );
};

export default ColorPrompt;
