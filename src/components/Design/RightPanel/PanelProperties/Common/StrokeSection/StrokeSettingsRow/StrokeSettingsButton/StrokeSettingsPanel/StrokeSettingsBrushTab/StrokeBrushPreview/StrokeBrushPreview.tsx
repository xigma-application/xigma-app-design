import { FC } from 'react';

// styles
import styles from './stroke-brush-preview.module.scss';

export type TStrokeBrushPreviewProps = {
  label: string;
  src: string;
};

export const StrokeBrushPreview: FC<TStrokeBrushPreviewProps> = ({ label, src }) => (
  <img alt={label} className={styles.StrokeBrushPreview} src={src} />
);

export default StrokeBrushPreview;
