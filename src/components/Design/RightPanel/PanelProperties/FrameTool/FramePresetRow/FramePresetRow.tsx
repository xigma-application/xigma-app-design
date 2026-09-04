import { FC } from 'react';

// styles
import styles from './frame-preset-row.module.scss';

// types
import { TFramePreset } from '../../types';

export type TFramePresetRowProps = {
  preset: TFramePreset;
};

export const FramePresetRow: FC<TFramePresetRowProps> = ({ preset }) => (
  <button className={styles.FramePresetRow} onClick={() => {}} type="button">
    <span className={styles.FramePresetRow__label}>{preset.label}</span>
    <span className={styles.FramePresetRow__size}>{`${preset.width}×${preset.height}`}</span>
  </button>
);

export default FramePresetRow;
