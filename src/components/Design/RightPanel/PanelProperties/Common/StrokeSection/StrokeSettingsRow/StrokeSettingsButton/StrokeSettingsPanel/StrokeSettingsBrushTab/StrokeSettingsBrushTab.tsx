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
import { getBrushById } from './utils/getBrushById';
import { getBrushCategoryId } from './utils/getBrushCategoryId';
import { getStrokeDirectionButtons } from './utils/getStrokeDirectionButtons';
import { translationNameSpace } from '../../../../constants';

// styles
import styles from './stroke-settings-brush-tab.module.scss';

export const StrokeSettingsBrushTab: FC = () => {
  const { t } = useTranslation();
  const { brush, direction, onBrushCommit, onBrushSelect, onDirectionChange, onScatterBlur, scatterValues } = useStrokeSettingsBrushTab();
  const { isPickerOpen, onTogglePicker, triggerRef } = useStrokeBrushPicker(brush, onBrushSelect, onBrushCommit);
  const namespace = `${translationNameSpace}.settings`;
  const selectedBrush = getBrushById(brush);
  const isScatterBrush = getBrushCategoryId(brush) === 'scatter';
  const directionButtons = getStrokeDirectionButtons((option) => t(`${namespace}.brush.direction.options.${option}`));

  return (
    <div className={styles.StrokeSettingsBrushTab}>
      <div className={styles.StrokeSettingsBrushTab__brush}>
        <StrokeBrushTrigger
          ariaLabel={t(`${namespace}.brush.triggerAriaLabel`)}
          brushId={brush}
          brushLabel={selectedBrush ? t(selectedBrush.labelTranslationKey) : ''}
          isOpen={isPickerOpen}
          onClick={onTogglePicker}
          ref={triggerRef}
        />
      </div>
      {isScatterBrush ? (
        <StrokeScatterBrushFields onBlur={onScatterBlur} values={scatterValues} />
      ) : (
        <UITools.Field
          Component={UITools.ToggleButtonGroup}
          controlWidth={128}
          label={t(`${namespace}.brush.direction.label`)}
          onChange={onDirectionChange}
          toggleButtons={directionButtons}
          value={direction}
        />
      )}
      <div className={styles.StrokeSettingsBrushTab__divider} />
      <StrokeSettingsWidthProfileField />
    </div>
  );
};

export default StrokeSettingsBrushTab;
