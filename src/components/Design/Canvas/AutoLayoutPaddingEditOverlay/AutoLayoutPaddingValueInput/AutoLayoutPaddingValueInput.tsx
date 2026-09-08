import { FC, PointerEvent } from 'react';

// @xigma
import { Icon } from '@xigma/components';

// hooks
import { useCanvasValueLabelInput } from '../../CanvasValueLabelInput/hooks/useCanvasValueLabelInput';

// types
import { TIconProps } from 'shared';

// styles
import styles from './auto-layout-padding-value-input.module.scss';

type TProps = {
  centerX: number;
  centerY: number;
  iconName: TIconProps['name'];
  initialValue: number;
  onCancel: TFunc;
  onCommit: TFunc<[string]>;
};

const AutoLayoutPaddingValueInput: FC<TProps> = ({ centerX, centerY, iconName, initialValue, onCancel, onCommit }) => {
  const { handleBlur, handleChange, handleKeyDown, inputRef, value } = useCanvasValueLabelInput({ initialValue, onCancel, onCommit });

  return (
    <div
      className={styles.AutoLayoutPaddingValueInput}
      onPointerDown={(event: PointerEvent<HTMLDivElement>): void => event.stopPropagation()}
      style={{ left: centerX, top: centerY }}
    >
      <Icon name={iconName} size={24} />
      <input
        className={styles.AutoLayoutPaddingValueInput__input}
        data-test-auto-layout-padding-value-input=""
        inputMode="decimal"
        onBlur={handleBlur}
        onChange={(event): void => handleChange(event.currentTarget.value)}
        onKeyDown={handleKeyDown}
        ref={inputRef}
        size={Math.max(value.length, 1)}
        type="text"
        value={value}
      />
    </div>
  );
};

export default AutoLayoutPaddingValueInput;
