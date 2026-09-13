import { FC } from 'react';

// components
import GradientPanel from './GradientPanel/GradientPanel';
import SolidPanel from './SolidPanel/SolidPanel';

// styles
import styles from './body.module.scss';

// types
import { ColorPickerTab } from '../enums';
import { TBodyProps } from './types';

export const Body: FC<TBodyProps> = ({
  activeTab,
  alpha,
  colorModel,
  gradientPanel,
  onCloseSampler,
  onDragEnd,
  onDragStart,
  onOpenSampler,
}) => (
  <div className={styles.Body}>
    {activeTab === ColorPickerTab.gradient ? (
      <GradientPanel gradientPanel={gradientPanel} />
    ) : (
      <SolidPanel
        alpha={alpha}
        colorModel={colorModel}
        onCloseSampler={onCloseSampler}
        onDragEnd={onDragEnd}
        onDragStart={onDragStart}
        onOpenSampler={onOpenSampler}
      />
    )}
  </div>
);

export default Body;
