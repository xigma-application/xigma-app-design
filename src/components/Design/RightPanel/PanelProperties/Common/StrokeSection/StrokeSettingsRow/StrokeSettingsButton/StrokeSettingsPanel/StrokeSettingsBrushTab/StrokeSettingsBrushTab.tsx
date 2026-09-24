import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import StrokeBrushTrigger from './StrokeBrushTrigger/StrokeBrushTrigger';
import StrokeScatterBrushFields from './StrokeScatterBrushFields/StrokeScatterBrushFields';
import StrokeSettingsWidthProfileField from '../StrokeSettingsWidthProfileField/StrokeSettingsWidthProfileField';
import { UITools } from 'shared';

// hooks
import { useStrokeBrushPicker } from './hooks/useStrokeBrushPicker';
import { useStrokeSettingsBrushTab } from './hooks/useStrokeSettingsBrushTab/useStrokeSettingsBrushTab';

// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';
import { getBrushById } from './utils/getBrushById';
import { getStrokeDirectionButtons } from './utils/getStrokeDirectionButtons';
import { translationNameSpace } from '../../../../constants';

// styles
import styles from './stroke-settings-brush-tab.module.scss';

export const StrokeSettingsBrushTab: FC = () => {
  const { t } = useTranslation();
  const {
    brush,
    direction,
    isDirectionBrush,
    isScatterBrush,
    onBrushCommit,
    onBrushPreview,
    onBrushRevert,
    onDirectionChange,
    onScatterBlur,
    scatterValues,
  } = useStrokeSettingsBrushTab();
  const { isPickerOpen, onTogglePicker, triggerRef } = useStrokeBrushPicker(brush, onBrushPreview, onBrushRevert, onBrushCommit);
  const namespace = `${translationNameSpace}.settings`;
  const selectedBrush = brush === undefined ? undefined : getBrushById(brush);
  const directionButtons = getStrokeDirectionButtons((option) => t(`${namespace}.brush.direction.options.${option}`));

  return (
    <div className={styles.StrokeSettingsBrushTab}>
      <div className={styles.StrokeSettingsBrushTab__brush}>
        <StrokeBrushTrigger
          ariaLabel={t(`${namespace}.brush.triggerAriaLabel`)}
          brushId={brush}
          brushLabel={selectedBrush ? t(selectedBrush.labelTranslationKey) : MIXED_LABEL}
          isOpen={isPickerOpen}
          onClick={onTogglePicker}
          ref={triggerRef}
        />
      </div>
      {isScatterBrush && <StrokeScatterBrushFields onBlur={onScatterBlur} values={scatterValues} />}
      {isDirectionBrush && (
        <UITools.Field
          Component={UITools.ToggleButtonGroup}
          controlWidth={128}
          label={t(`${namespace}.brush.direction.label`)}
          onChange={onDirectionChange}
          toggleButtons={directionButtons}
          value={direction ?? ''}
        />
      )}
      <div className={styles.StrokeSettingsBrushTab__divider} />
      <StrokeSettingsWidthProfileField />
    </div>
  );
};

export default StrokeSettingsBrushTab;
