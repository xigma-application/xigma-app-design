import { FC } from 'react';

// components
import SolidPanel, { TSolidPanelProps } from './SolidPanel/SolidPanel';

// styles
import styles from './body.module.scss';

export type TBodyProps = TSolidPanelProps;

export const Body: FC<TBodyProps> = ({ alpha, colorModel, onCloseSampler, onDragEnd, onDragStart, onOpenSampler }) => (
  <div className={styles.Body}>
    <SolidPanel
      alpha={alpha}
      colorModel={colorModel}
      onCloseSampler={onCloseSampler}
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
      onOpenSampler={onOpenSampler}
    />
  </div>
);

export default Body;
