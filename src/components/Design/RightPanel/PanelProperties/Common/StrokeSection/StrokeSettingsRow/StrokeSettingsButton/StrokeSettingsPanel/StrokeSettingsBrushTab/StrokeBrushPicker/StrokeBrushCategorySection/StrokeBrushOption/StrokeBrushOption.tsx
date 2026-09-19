import cx from 'classnames';
import { FC } from 'react';

// @xigma
import { Icon } from '@xigma/components';

// components
import StrokeBrushPreview from '../../../StrokeBrushPreview/StrokeBrushPreview';

// others
import { STROKE_BRUSH_OPTION_HEADER_HEIGHT_PX, STROKE_BRUSH_OPTION_HEIGHT_PX } from '../../constants';
import { getBrushImageUrl } from 'utils/brushes/getBrushImageUrl';

// styles
import styles from './stroke-brush-option.module.scss';

// types
import { TBrush } from '@xigma/utils';

export type TStrokeBrushOptionProps = {
  brush: TBrush;
  label: string;
  onClick: TFunc;
  onMouseEnter: TFunc;
  onMouseLeave: TFunc;
  selected: boolean;
};

export const StrokeBrushOption: FC<TStrokeBrushOptionProps> = ({ brush, label, onClick, onMouseEnter, onMouseLeave, selected }) => (
  <div
    className={cx(styles.StrokeBrushOption, { [styles['StrokeBrushOption--selected']]: selected })}
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    style={{ height: STROKE_BRUSH_OPTION_HEIGHT_PX }}
  >
    <div className={styles.StrokeBrushOption__header} style={{ height: STROKE_BRUSH_OPTION_HEADER_HEIGHT_PX }}>
      <span className={styles.StrokeBrushOption__check} style={{ opacity: selected ? 1 : 0 }}>
        <Icon name="Check" size={16} />
      </span>
      <span className={styles.StrokeBrushOption__label}>{label}</span>
    </div>
    <div className={styles.StrokeBrushOption__image}>
      <StrokeBrushPreview label={label} src={getBrushImageUrl(brush.imageFile)} />
    </div>
  </div>
);

export default StrokeBrushOption;
