import cx from 'classnames';
import { FC, PointerEvent as ReactPointerEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Icon, Tooltip, UITools } from 'shared';

// hooks
import { TFillSelectModifiers } from '../hooks/useFillSection/hooks/useFillSelection/useFillSelection';
import { useBeginFillHandleDrag } from './hooks/useBeginFillHandleDrag';
import { useSelectFillRow } from './hooks/useSelectFillRow';
import { useStopFillRowSelectPropagation } from './hooks/useStopFillRowSelectPropagation';

// styles
import styles from './fill-row.module.scss';

// types
import { TPaint } from 'types/design/paint/types';

// utils
import { getNonSolidFillSwatchStyle } from './utils/getNonSolidFillSwatchStyle';
import { translationNameSpace } from '../constants';

export type TFillRowProps = {
  isDragging: boolean;
  isSelected: boolean;
  onChange: TFunc<[TPaint]>;
  onDragEnd: TFunc;
  onDragStart: TFunc;
  onRemove: TFunc;
  onSelect: TFunc<[TFillSelectModifiers]>;
  onStartDrag: TFunc<[ReactPointerEvent]>;
  onToggleVisible: TFunc;
  paint: TPaint;
  registerRow: (element: HTMLElement | null) => void;
};

export const FillRow: FC<TFillRowProps> = ({
  isDragging,
  isSelected,
  onChange,
  onDragEnd,
  onDragStart,
  onRemove,
  onSelect,
  onStartDrag,
  onToggleVisible,
  paint,
  registerRow,
}) => {
  const { t } = useTranslation();
  const isVisible = paint.visible !== false;
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const handleClick = useSelectFillRow(onSelect);
  const handlePointerDown = useBeginFillHandleDrag(onSelect, onStartDrag);
  const stopRowSelectPropagation = useStopFillRowSelectPropagation();

  return (
    <div
      className={cx(styles.FillRow, {
        [styles['FillRow--selected']]: isSelected || isDragging,
        [styles['FillRow--pickerOpen']]: isPickerOpen,
      })}
      onClick={handleClick}
      ref={registerRow}
    >
      <button
        aria-label={t(`${translationNameSpace}.reorderAriaLabel`)}
        className={cx(styles.FillRow__handle, { [styles['FillRow__handle--dragging']]: isDragging })}
        onPointerDown={handlePointerDown}
        type="button"
      >
        <Icon color="neutral2" name="RowGrabber" size={8} />
      </button>
      <span onClick={stopRowSelectPropagation} style={{ display: 'contents' }}>
        {paint.type === 'solid' ? (
          <UITools.ColorPickerInput
            align="start"
            alpha={paint.opacity}
            className={styles.FillRow__color}
            hex={paint.color}
            isVisible={isVisible}
            onCommitAlpha={(opacity): void => onChange({ ...paint, opacity })}
            onCommitHex={(hex): void => onChange({ ...paint, color: hex })}
            onDragEnd={onDragEnd}
            onDragStart={onDragStart}
            onOpenChange={setIsPickerOpen}
            onPickerChange={({ alpha, hex }): void => onChange({ ...paint, color: hex, opacity: alpha })}
            onToggleVisibility={onToggleVisible}
            side="right"
            simple
            toggleVisibilityAriaLabel={t(`${translationNameSpace}.${isVisible ? 'hideAriaLabel' : 'showAriaLabel'}`)}
            toggleVisibilityTooltip={t(`${translationNameSpace}.${isVisible ? 'hideTooltip' : 'showTooltip'}`)}
            triggerAriaLabel={t(`${translationNameSpace}.hexAriaLabel`)}
          />
        ) : (
          <div className={styles.FillRow__gradient}>
            <span className={styles.FillRow__gradientSwatch} style={getNonSolidFillSwatchStyle(paint)} />
            <span className={styles.FillRow__gradientLabel}>{t(`${translationNameSpace}.gradientLabel`)}</span>
            <button
              aria-label={t(`${translationNameSpace}.${isVisible ? 'hideAriaLabel' : 'showAriaLabel'}`)}
              className={styles.FillRow__toggle}
              onClick={onToggleVisible}
              type="button"
            >
              <Icon name={isVisible ? 'EyesOpened' : 'EyesClosed'} size={16} />
            </button>
          </div>
        )}
      </span>
      <Tooltip content={t(`${translationNameSpace}.deleteTooltip`)}>
        <UITools.Button ariaLabel={t(`${translationNameSpace}.deleteAriaLabel`)} onClick={onRemove} style={{ padding: 0 }}>
          <Icon name="Minus" size={24} />
        </UITools.Button>
      </Tooltip>
    </div>
  );
};

export default FillRow;
