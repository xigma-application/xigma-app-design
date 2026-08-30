import { FC, PointerEvent } from 'react';

// hooks
import { useCanvasValueLabelInput } from '../CanvasValueLabelInput/hooks/useCanvasValueLabelInput';

// others
import { FRAME_NAME_LABEL_INPUT_BORDER_WIDTH_PX, FRAME_NAME_LABEL_INPUT_MIN_WIDTH_PX } from 'constant/canvas';

// styles
import styles from './CanvasNameLabelInput.module.scss';

// utils
import { getTextWidth } from 'utils/canvas/text/getTextWidth';

type TProps = {
  angleDeg: number;
  fontSize: number;
  height: number;
  initialValue: string;
  left: number;
  onCancel: TFunc;
  onCommit: TFunc<[string]>;
  top: number;
};

const CanvasNameLabelInput: FC<TProps> = ({ angleDeg, fontSize, height, initialValue, left, onCancel, onCommit, top }) => {
  const { handleBlur, handleChange, handleKeyDown, inputRef, value } = useCanvasValueLabelInput({ initialValue, onCancel, onCommit });
  const width = Math.max(getTextWidth(value, fontSize), FRAME_NAME_LABEL_INPUT_MIN_WIDTH_PX);

  return (
    <input
      className={styles.CanvasNameLabelInput}
      onBlur={handleBlur}
      onChange={(event): void => handleChange(event.currentTarget.value)}
      onKeyDown={handleKeyDown}
      onPointerDown={(event: PointerEvent<HTMLInputElement>): void => event.stopPropagation()}
      ref={inputRef}
      style={{
        fontSize,
        height,
        left: left - FRAME_NAME_LABEL_INPUT_BORDER_WIDTH_PX,
        top,
        transform: `translate(0, -50%) rotate(${angleDeg}deg)`,
        width,
      }}
      type="text"
      value={value}
    />
  );
};

export default CanvasNameLabelInput;
