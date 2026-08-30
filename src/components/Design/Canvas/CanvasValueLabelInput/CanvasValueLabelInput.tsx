import { FC, PointerEvent } from 'react';

// hooks
import { useCanvasValueLabelInput } from './hooks/useCanvasValueLabelInput';

// styles
import styles from './CanvasValueLabelInput.module.scss';

type TProps = {
  centerX: number;
  centerY: number;
  fontSize: number;
  height: number;
  initialValue: number;
  minWidth: number;
  onCancel: TFunc;
  onCommit: TFunc<[string]>;
};

const CanvasValueLabelInput: FC<TProps> = ({ centerX, centerY, fontSize, height, initialValue, minWidth, onCancel, onCommit }) => {
  const { handleBlur, handleChange, handleKeyDown, inputRef, value } = useCanvasValueLabelInput({ initialValue, onCancel, onCommit });

  return (
    <input
      className={styles.CanvasValueLabelInput}
      inputMode="decimal"
      onBlur={handleBlur}
      onChange={(event): void => handleChange(event.currentTarget.value)}
      onKeyDown={handleKeyDown}
      onPointerDown={(event: PointerEvent<HTMLInputElement>): void => event.stopPropagation()}
      ref={inputRef}
      size={Math.max(value.length, 1)}
      style={{ fontSize, height, left: centerX, minWidth, top: centerY }}
      type="text"
      value={value}
    />
  );
};

export default CanvasValueLabelInput;
