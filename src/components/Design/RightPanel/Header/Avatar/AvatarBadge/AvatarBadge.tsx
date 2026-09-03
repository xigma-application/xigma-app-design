import { FC } from 'react';

// others
import { AVATAR_LABEL } from './constants';

// styles
import styles from './avatar-badge.module.scss';

const AvatarBadge: FC = () => <span className={styles.AvatarBadge}>{AVATAR_LABEL}</span>;

export default AvatarBadge;
