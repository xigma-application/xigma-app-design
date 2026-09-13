import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Icon, UITools } from 'shared';

// hooks
import { useHandleGradientPaintChange } from './hooks/useHandleGradientPaintChange';
import { useHandleSolidPaintChange } from './hooks/useHandleSolidPaintChange';
import { useSyncGradientEditor } from './hooks/useSyncGradientEditor';

// types
import { ColorPickerTab } from 'shared/UITools/ColorPicker/enums';
import { TGradientPanelState } from 'shared/UITools/ColorPicker/types';
import { TGradientPaint, TSolidPaint } from 'types/design/paint/types';

// utils
import { getNonSolidFillSwatchStyle } from '../utils/getNonSolidFillSwatchStyle';
import { translationNameSpace } from '../../constants';

// styles
import styles from '../fill-row.module.scss';

export type TGradientFillControlProps = {
  isVisible: boolean;
  nodeId: string | undefined;
  onChange: TFunc<[TGradientPaint | TSolidPaint]>;
  onToggleVisible: TFunc;
  paint: TGradientPaint;
  paintIndex: number;
};

const DEFAULT_GRADIENT_PANEL_STATE: TGradientPanelState = { isGradientTabActive: true, selectedStopIndex: null };

export const GradientFillControl: FC<TGradientFillControlProps> = ({ isVisible, nodeId, onChange, onToggleVisible, paint, paintIndex }) => {
  const { t } = useTranslation();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [gradientPanelState, setGradientPanelState] = useState(DEFAULT_GRADIENT_PANEL_STATE);
  const handleSolidChange = useHandleSolidPaintChange(paint, onChange);
  const handleGradientChange = useHandleGradientPaintChange(paint, onChange);

  useSyncGradientEditor(nodeId, paintIndex, isPickerOpen, gradientPanelState.isGradientTabActive, gradientPanelState.selectedStopIndex);

  return (
    <div className={styles.FillRow__gradient}>
      <UITools.ColorPicker
        initialActiveTab={ColorPickerTab.gradient}
        initialGradient={{ end: paint.end, start: paint.start, stops: paint.stops }}
        moveable
        onChange={handleSolidChange}
        onGradientChange={handleGradientChange}
        onGradientPanelStateChange={setGradientPanelState}
        onOpenChange={setIsPickerOpen}
        paintTypeRow
        side="right"
        simple
        trigger={<span className={styles.FillRow__gradientSwatch} style={getNonSolidFillSwatchStyle(paint)} />}
        triggerAriaLabel={t(`${translationNameSpace}.hexAriaLabel`)}
        value={{ alpha: paint.stops[0]?.opacity ?? 100, hex: paint.stops[0]?.color ?? '#000000' }}
      />
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
  );
};

export default GradientFillControl;
