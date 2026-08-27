import { FC } from 'react';

// components
import SolidPanel, { TSolidPanelProps } from './SolidPanel/SolidPanel';

// styles
import styles from './body.module.scss';

export type TBodyProps = TSolidPanelProps;

export const Body: FC<TBodyProps> = ({ alpha, colorModel, onOpenSampler }) => (
  <div className={styles.Body}>
    <SolidPanel alpha={alpha} colorModel={colorModel} onOpenSampler={onOpenSampler} />
  </div>
);

export default Body;
