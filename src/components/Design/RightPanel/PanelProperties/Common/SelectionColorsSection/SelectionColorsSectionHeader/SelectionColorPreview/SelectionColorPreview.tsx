import { FC } from 'react';

// styles
import styles from './selection-color-preview.module.scss';

// types
import { TSelectionColorGroup } from '../../types';

// utils
import { getFillRowSwatchHex } from '../../../FillSection/FillRow/utils/getFillRowSwatchHex';
import { getSelectionColorPreview } from '../../utils/getSelectionColorPreview';
import { hexToRgb } from 'utils/color/hexToRgb';
import { rgbToCssString } from 'utils/color/rgbToCssString';

export type TSelectionColorPreviewProps = { groups: TSelectionColorGroup[] };

export const SelectionColorPreview: FC<TSelectionColorPreviewProps> = ({ groups }) => {
  const { overflowCount, visibleGroups } = getSelectionColorPreview(groups);

  return (
    <div className={styles.SelectionColorPreview}>
      {visibleGroups.map((group) => (
        <span
          className={styles.SelectionColorPreview__swatch}
          key={group.key}
          style={{ backgroundColor: rgbToCssString({ ...hexToRgb(getFillRowSwatchHex(group.paint)), a: group.paint.opacity }) }}
        />
      ))}
      {overflowCount > 0 && (
        <span className={styles.SelectionColorPreview__overflowContainer}>
          <span className={styles.SelectionColorPreview__overflow}>+{overflowCount}</span>
        </span>
      )}
    </div>
  );
};

export default SelectionColorPreview;
