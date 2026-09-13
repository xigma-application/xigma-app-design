import { FC, useRef } from 'react';

// components
import GradientActions from './GradientActions/GradientActions';
import GradientBar from './GradientBar/GradientBar';
import StopsList from './StopsList/StopsList';
import ScrollThumb from 'shared/ScrollThumb/ScrollThumb';

// styles
import styles from './gradient-panel.module.scss';

// types
import { TUseGradientPanelResult } from './hooks/useGradientPanel';

export type TGradientPanelProps = { gradientPanel: TUseGradientPanelResult };

export const GradientPanel: FC<TGradientPanelProps> = ({ gradientPanel }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className={styles.GradientPanel} ref={scrollRef}>
      <GradientActions
        onFlip={gradientPanel.flip}
        onRotate={gradientPanel.rotate}
        onTypeChange={gradientPanel.setType}
        type={gradientPanel.type}
      />
      <GradientBar
        onAddStop={gradientPanel.addStop}
        onMoveStop={gradientPanel.setStopPosition}
        onSelectStop={gradientPanel.selectStop}
        selectedStopId={gradientPanel.selectedStopId}
        stops={gradientPanel.stops}
      />
      <StopsList
        canRemoveStop={gradientPanel.canRemoveStop}
        onAddStop={gradientPanel.addStop}
        onRemoveStop={gradientPanel.removeStop}
        onSelectStop={gradientPanel.selectStop}
        onSetStopColor={gradientPanel.setStopColor}
        onSetStopPosition={gradientPanel.setStopPosition}
        selectedStopId={gradientPanel.selectedStopId}
        stops={gradientPanel.stops}
      />
      <ScrollThumb className={styles.GradientPanel__scrollThumb} scrollRef={scrollRef} />
    </div>
  );
};

export default GradientPanel;
