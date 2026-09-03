import cx from 'classnames';
import { FC } from 'react';

// components
import Avatar from '../Header/Avatar/Avatar';
import PresentShare from '../Header/PresentShare/PresentShare';
import ZoomTrigger from '../Header/ZoomTrigger/ZoomTrigger';

// store
import { selectAreRulersVisible } from 'store/design/selectors';
import { useAppSelector } from 'store';

// styles
import styles from './minimized-header.module.scss';

const MinimizedHeader: FC = () => {
  const areRulersVisible = useAppSelector(selectAreRulersVisible);

  return (
    <div className={cx(styles.MinimizedHeader, { [styles['MinimizedHeader--withRulers']]: areRulersVisible })}>
      <Avatar />
      <ZoomTrigger />
      <PresentShare />
    </div>
  );
};

export default MinimizedHeader;
