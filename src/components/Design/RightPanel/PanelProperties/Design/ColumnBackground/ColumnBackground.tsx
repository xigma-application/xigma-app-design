import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { UITools } from 'shared';

// hooks
import { useColumnBackgroundColor } from './hooks/useColumnBackgroundColor';

// others
import { translationNameSpace } from '../constants';

const ColumnBackground: FC = () => {
  const { t } = useTranslation();
  const { alpha, hex, isVisible, onCommitAlpha, onCommitHex, onDragEnd, onDragStart, onPickerChange, onToggleVisibility } =
    useColumnBackgroundColor();

  return (
    <UITools.ColorPickerInput
      alpha={alpha}
      e2eValue="background"
      hex={hex}
      isVisible={isVisible}
      onCommitAlpha={onCommitAlpha}
      onCommitHex={onCommitHex}
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
      onPickerChange={onPickerChange}
      onToggleVisibility={onToggleVisibility}
      toggleVisibilityAriaLabel={t(`${translationNameSpace}.background.toggleVisibilityAriaLabel`)}
      toggleVisibilityTooltip={t(`${translationNameSpace}.background.toggleVisibilityTooltip`)}
      triggerAriaLabel={t(`${translationNameSpace}.background.colorTriggerAriaLabel`)}
    />
  );
};

export default ColumnBackground;
