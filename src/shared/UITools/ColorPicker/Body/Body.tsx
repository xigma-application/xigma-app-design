import { FC } from 'react';

// styles
import styles from './body.module.scss';

// types
import { TBodyProps } from './types';

// utils
import { renderBody } from './utils/renderBody';

export const Body: FC<TBodyProps> = (props) => <div className={styles.Body}>{renderBody(props)}</div>;

export default Body;
