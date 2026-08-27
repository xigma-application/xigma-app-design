import { FC, useRef } from 'react';

// components
import Color from 'shared/UITools/Color/Color';
import ScrollThumb from 'shared/ScrollThumb/ScrollThumb';

// hooks
import { useSelectPreset } from './hooks/useSelectPreset';

// styles
import styles from './footer.module.scss';

// types
import { TColorPickerValue } from '../types';

export type TFooterProps = { onSelectPreset: TFunc<[TColorPickerValue]>; presets: TColorPickerValue[] };

export const Footer: FC<TFooterProps> = ({ onSelectPreset, presets }) => {
  const handleSelectPreset = useSelectPreset(onSelectPreset);
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className={styles.Footer}>
      <div className={styles.Footer__colors} ref={scrollRef}>
        {presets.map((preset, index) => (
          <div
            className={styles.Footer__swatch}
            data-no-drag
            key={`${preset.hex}-${preset.alpha}-${index}`}
            onClick={handleSelectPreset(preset)}
          >
            <Color alpha={preset.alpha} className={styles.Footer__swatchColor} color={preset.hex} />
          </div>
        ))}
      </div>
      <ScrollThumb className={styles.Footer__scrollThumb} scrollRef={scrollRef} />
    </div>
  );
};

export default Footer;
