import { FC } from 'react';

// others
import { STROKE_BRUSH_PREVIEW_WIDTH_PX } from '../constants';

// styles
import styles from './stroke-brush-preview.module.scss';

export type TStrokeBrushPreviewProps = {
  label: string;
  src: string;
};

export const StrokeBrushPreview: FC<TStrokeBrushPreviewProps> = ({ label, src }) => (
  <img alt={label} className={styles.StrokeBrushPreview} src={src} width={STROKE_BRUSH_PREVIEW_WIDTH_PX} />
);

export default StrokeBrushPreview;
