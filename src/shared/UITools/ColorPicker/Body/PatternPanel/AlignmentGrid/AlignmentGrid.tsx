import cx from 'classnames';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Tooltip } from 'shared';

// styles
import styles from './alignment-grid.module.scss';

// utils
import { getAlignmentPointTooltip } from './utils/getAlignmentPointTooltip';

const ALIGNMENT_POINTS = [0, 1, 2, 3, 4, 5, 6, 7, 8];

export type TAlignmentGridProps = { onChange: TFunc<[number]>; selectedIndex: number };

export const AlignmentGrid: FC<TAlignmentGridProps> = ({ onChange, selectedIndex }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.AlignmentGrid}>
      {ALIGNMENT_POINTS.map((index) => (
        <Tooltip content={getAlignmentPointTooltip(index, t)} key={index}>
          <button
            aria-label={t('colorPicker.pattern.alignmentPointAriaLabel', { index: index + 1 })}
            aria-pressed={index === selectedIndex}
            className={cx(styles.AlignmentGrid__point, { [styles['AlignmentGrid__point--selected']]: index === selectedIndex })}
            onClick={(): void => onChange(index)}
            type="button"
          >
            <span className={styles.AlignmentGrid__dot} />
          </button>
        </Tooltip>
      ))}
    </div>
  );
};

export default AlignmentGrid;
