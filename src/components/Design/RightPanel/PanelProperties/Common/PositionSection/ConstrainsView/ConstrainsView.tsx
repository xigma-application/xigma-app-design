import cx from 'classnames';
import { FC } from 'react';

// others
import { CONSTRAIN_KEYS, CONSTRAIN_MODIFICATORS, HORIZONTAL_MODIFICATORS, VERTICAL_MODIFICATORS } from './constants';

// styles
import styles from './constrains-view.module.scss';

// types
import { AlignmentHorizontal, AlignmentVertical } from 'types/design/enums';
import { TNodeAlignment } from 'types/design/types';

export type TConstrainsViewProps = {
  alignment: TNodeAlignment | undefined;
  selected?: boolean;
};

export const ConstrainsView: FC<TConstrainsViewProps> = ({ alignment, selected = false }) => {
  const horizontal = alignment?.horizontal ?? AlignmentHorizontal.left;
  const vertical = alignment?.vertical ?? AlignmentVertical.top;

  return (
    <div
      className={cx(styles.ConstrainsView, {
        [styles['ConstrainsView--selected']]: selected,
        [styles[HORIZONTAL_MODIFICATORS[horizontal]]]: true,
        [styles[VERTICAL_MODIFICATORS[vertical]]]: true,
      })}
    >
      {CONSTRAIN_KEYS.map((key) => (
        <div className={cx(styles.ConstrainsView__constrain, styles[CONSTRAIN_MODIFICATORS[key]])} key={key} />
      ))}
    </div>
  );
};

export default ConstrainsView;
