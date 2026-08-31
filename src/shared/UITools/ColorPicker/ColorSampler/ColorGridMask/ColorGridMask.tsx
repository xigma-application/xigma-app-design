import cx from 'classnames';
import { FC } from 'react';

// hooks
import { usePickSampledColor } from './hooks/usePickSampledColor';

// others
import { COLOR_SAMPLE_PASSTHROUGH_ATTRIBUTE } from 'constant/canvas';

// styles
import styles from './color-grid-mask.module.scss';

// types
import { TRgba } from 'types/color';

export type TColorGridMaskProps = { colors: TRgba[]; onPick: TFunc<[string]> };

export const ColorGridMask: FC<TColorGridMaskProps> = ({ colors, onPick }) => {
  const handleClick = usePickSampledColor(colors, onPick);

  return <div className={cx(styles.ColorGridMask)} onClick={handleClick} {...{ [COLOR_SAMPLE_PASSTHROUGH_ATTRIBUTE]: '' }} />;
};

export default ColorGridMask;
