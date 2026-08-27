import cx from 'classnames';
import { createPortal } from 'react-dom';
import { FC } from 'react';

// components
import ColorGrid from './ColorGrid/ColorGrid';
import ColorGridMask from './ColorGridMask/ColorGridMask';
import ColorPrompt from './ColorPrompt/ColorPrompt';
import ColorResult from './ColorResult/ColorResult';

// hooks
import { useCloseSamplerOnEscape } from './hooks/useCloseSamplerOnEscape';
import { useColorSamplerEvents } from './hooks/useColorSamplerEvents';

// others
import { BOX_OFFSET } from './constants';

// styles
import styles from './color-sampler.module.scss';

export type TColorSamplerProps = { onClose: TFunc; onPick: TFunc<[string]> };

export const ColorSampler: FC<TColorSamplerProps> = ({ onClose, onPick }) => {
  const { colors, mousePosition } = useColorSamplerEvents();

  useCloseSamplerOnEscape(onClose);

  return mousePosition && colors
    ? createPortal(
        <div
          className={cx(styles.ColorSampler)}
          style={{ left: `${mousePosition.x + BOX_OFFSET}px`, top: `${mousePosition.y + BOX_OFFSET}px` }}
        >
          <ColorGridMask colors={colors} onPick={onPick} />
          <ColorGrid colors={colors} />
          <div>
            <ColorResult colors={colors} />
            <ColorPrompt />
          </div>
        </div>,
        document.body,
      )
    : null;
};

export default ColorSampler;
