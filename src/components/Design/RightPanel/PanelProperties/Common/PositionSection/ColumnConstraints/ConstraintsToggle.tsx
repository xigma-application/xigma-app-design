import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ConstrainsView from '../ConstrainsView/ConstrainsView';
import { UITools } from 'shared';

// others
import { translationNameSpace } from './constants';

// styles
import styles from './constraints-toggle.module.scss';

// types
import { TNodeAlignment } from 'types/design/types';

export type TConstraintsToggleProps = {
  active: boolean;
  alignment: TNodeAlignment;
  onToggle: TFunc;
};

const ConstraintsToggle: FC<TConstraintsToggleProps> = ({ active, alignment, onToggle }) => {
  const { t } = useTranslation();

  return (
    <UITools.Button
      active={active}
      ariaLabel={t(`${translationNameSpace}.toggleAriaLabel`)}
      className={styles.ConstraintsToggle}
      onClick={onToggle}
    >
      <ConstrainsView alignment={alignment} selected={active} />
    </UITools.Button>
  );
};

export default ConstraintsToggle;
