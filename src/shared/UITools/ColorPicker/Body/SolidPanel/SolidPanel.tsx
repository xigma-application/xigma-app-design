import { FC } from 'react';

// components
import AlphaSlider from './AlphaSlider/AlphaSlider';
import ColorValueInput from './ColorValueInput/ColorValueInput';
import ContrastChecker from './ContrastChecker/ContrastChecker';
import ContrastUnsupported from './ContrastChecker/ContrastUnsupported/ContrastUnsupported';
import HueSlider from './HueSlider/HueSlider';
import Sampler from '../../Sampler/Sampler';
import SaturationMap from './SaturationMap/SaturationMap';

// styles
import styles from './solid-panel.module.scss';

// types
import { TUseColorModelResult } from '../../hooks/useColorModel';
import { TUseContrastCheckerResult } from './ContrastChecker/hooks/useContrastChecker';

export type TSolidPanelProps = {
  alpha: number;
  colorModel: TUseColorModelResult;
  contrastChecker?: TUseContrastCheckerResult;
  onCloseSampler?: TFunc;
  onDragEnd?: TFunc;
  onDragStart?: TFunc;
  onOpenSampler?: TFunc;
};

export const SolidPanel: FC<TSolidPanelProps> = ({
  alpha,
  colorModel,
  contrastChecker,
  onCloseSampler,
  onDragEnd,
  onDragStart,
  onOpenSampler,
}) => (
  <div className={styles.SolidPanel}>
    {contrastChecker?.isActive && contrastChecker.unsupportedReason && <ContrastUnsupported reason={contrastChecker.unsupportedReason} />}
    {contrastChecker?.isActive && !contrastChecker.unsupportedReason && (
      <ContrastChecker
        backgroundColor={contrastChecker.backgroundColor}
        canShowAAA={contrastChecker.canShowAAA}
        category={contrastChecker.category}
        foregroundColor={colorModel.hex}
        level={contrastChecker.level}
        onAutoCorrect={contrastChecker.onAutoCorrect}
        onAutoCorrectHoverChange={contrastChecker.onAutoCorrectHoverChange}
        onSetCategory={contrastChecker.onSetCategory}
        onSetLevel={contrastChecker.onSetLevel}
        passes={contrastChecker.passes}
        ratio={contrastChecker.ratio}
      />
    )}
    <SaturationMap
      color={colorModel.hex}
      contrastBoundaries={contrastChecker?.isActive && !contrastChecker.unsupportedReason ? contrastChecker.boundaries : undefined}
      contrastCorrectionPreview={contrastChecker?.isActive && !contrastChecker.unsupportedReason ? contrastChecker.correctionPreview : null}
      hsv={colorModel.hsv}
      onChange={colorModel.setHsv}
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
    />
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
