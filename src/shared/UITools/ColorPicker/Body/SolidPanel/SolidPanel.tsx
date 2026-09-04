import { FC } from 'react';

// components
import AlphaSlider from './AlphaSlider/AlphaSlider';
import ColorValueInput from './ColorValueInput/ColorValueInput';
import HueSlider from './HueSlider/HueSlider';
import Sampler from '../../Sampler/Sampler';
import SaturationMap from './SaturationMap/SaturationMap';

// styles
import styles from './solid-panel.module.scss';

// types
import { TUseColorModelResult } from '../../hooks/useColorModel';

export type TSolidPanelProps = {
  alpha: number;
  colorModel: TUseColorModelResult;
  onCloseSampler?: TFunc;
  onDragEnd?: TFunc;
  onDragStart?: TFunc;
  onOpenSampler?: TFunc;
};

export const SolidPanel: FC<TSolidPanelProps> = ({ alpha, colorModel, onCloseSampler, onDragEnd, onDragStart, onOpenSampler }) => (
  <div className={styles.SolidPanel}>
    <SaturationMap hsv={colorModel.hsv} onChange={colorModel.setHsv} onDragEnd={onDragEnd} onDragStart={onDragStart} />
    <div className={styles.SolidPanel__controls}>
      <div className={styles.SolidPanel__switchers}>
        <Sampler onClose={onCloseSampler} onOpen={onOpenSampler} />
        <div className={styles.SolidPanel__inputs}>
          <HueSlider hue={colorModel.hsv.h} onChange={colorModel.setHsv} onDragEnd={onDragEnd} onDragStart={onDragStart} />
          <AlphaSlider
            alpha={alpha}
            color={colorModel.hex}
            onChange={colorModel.setAlpha}
            onDragEnd={onDragEnd}
            onDragStart={onDragStart}
          />
        </div>
      </div>
      <ColorValueInput alpha={alpha} colorModel={colorModel} />
    </div>
  </div>
);

export default SolidPanel;
