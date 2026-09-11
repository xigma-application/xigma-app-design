import cx from 'classnames';
import { FC, PointerEvent } from 'react';

// hooks
import { useCanvasValueLabelInput } from './hooks/useCanvasValueLabelInput';

// styles
import styles from './CanvasValueLabelInput.module.scss';

// types
import { E2EAttribute } from 'types/e2e';

// utils
import { getAttributes } from 'shared/E2EDataAttributes/utils/getAttributes';

type TProps = {
  centerX: number;
  centerY: number;
  className?: string;
  fontSize: number;
  height: number;
  initialValue: number | string;
  minWidth: number;
  onCancel: TFunc;
  onCommit: TFunc<[string]>;
  onLiveChange?: TFunc<[string]>;
};

const CanvasValueLabelInput: FC<TProps> = ({
  centerX,
  centerY,
  className,
  fontSize,
  height,
  initialValue,
  minWidth,
  onCancel,
  onCommit,
  onLiveChange,
}) => {
  const { handleBlur, handleChange, handleKeyDown, inputRef, value } = useCanvasValueLabelInput({
    initialValue,
    onCancel,
    onCommit,
    onLiveChange,
  });

  return (
    <input
      className={cx(styles.CanvasValueLabelInput, className)}
      {...getAttributes(E2EAttribute.bypassGlobalShortcuts, 'true')}
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
