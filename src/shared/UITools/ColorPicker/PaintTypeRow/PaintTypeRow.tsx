import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import BlendModeButton from './BlendModeButton/BlendModeButton';
import ContrastCheckerButton from './ContrastCheckerButton/ContrastCheckerButton';
import { Tooltip, UITools } from 'shared';

// styles
import styles from './paint-type-row.module.scss';

// types
import { BlendMode } from 'types/design/enums';
import { ColorPickerTab } from '../enums';

export type TPaintTypeRowProps = {
  activeTab: ColorPickerTab;
  blendMode: BlendMode;
  contrastCheckerActive?: boolean;
  onBlendModeChange?: TFunc<[BlendMode]>;
  onSelectTab: TFunc<[ColorPickerTab]>;
  onToggleContrastChecker?: TFunc;
};

export const PaintTypeRow: FC<TPaintTypeRowProps> = ({
  activeTab,
  blendMode,
  contrastCheckerActive = false,
  onBlendModeChange,
  onSelectTab,
  onToggleContrastChecker,
}) => {
  const { t } = useTranslation();

  return (
    <div className={styles.PaintTypeRow}>
      <Tooltip content={t('colorPicker.paintType.solid')}>
        <UITools.ButtonIcon
          active={activeTab === ColorPickerTab.solid}
          ariaLabel={t('colorPicker.paintType.solid')}
          name="Solid"
          onClick={(): void => onSelectTab(ColorPickerTab.solid)}
        />
      </Tooltip>
      <Tooltip content={t('colorPicker.paintType.gradient')}>
        <UITools.ButtonIcon
          active={activeTab === ColorPickerTab.gradient}
          ariaLabel={t('colorPicker.paintType.gradient')}
          name="Gradient"
          onClick={(): void => onSelectTab(ColorPickerTab.gradient)}
        />
      </Tooltip>
      <Tooltip content={t('colorPicker.paintType.pattern')}>
        <UITools.ButtonIcon
          active={activeTab === ColorPickerTab.pattern}
          ariaLabel={t('colorPicker.paintType.pattern')}
          name="Pattern"
          onClick={(): void => onSelectTab(ColorPickerTab.pattern)}
        />
      </Tooltip>
      <Tooltip content={t('colorPicker.paintType.image')}>
        <UITools.ButtonIcon
          active={activeTab === ColorPickerTab.image}
          ariaLabel={t('colorPicker.paintType.image')}
          name="Image"
          onClick={(): void => onSelectTab(ColorPickerTab.image)}
        />
      </Tooltip>
      <Tooltip content={t('colorPicker.paintType.video')}>
        <UITools.ButtonIcon
          active={activeTab === ColorPickerTab.video}
          ariaLabel={t('colorPicker.paintType.video')}
          name="Video"
          onClick={(): void => onSelectTab(ColorPickerTab.video)}
        />
      </Tooltip>
      <Tooltip content={t('colorPicker.paintType.shader')}>
        <UITools.ButtonIcon
          active={activeTab === ColorPickerTab.shader}
          ariaLabel={t('colorPicker.paintType.shader')}
          name="Shaders"
          onClick={(): void => onSelectTab(ColorPickerTab.shader)}
        />
      </Tooltip>
      <div className={styles.PaintTypeRow__extra}>
        <BlendModeButton onChange={onBlendModeChange} value={blendMode} />
        {activeTab === ColorPickerTab.solid && onToggleContrastChecker && (
          <ContrastCheckerButton isActive={contrastCheckerActive} onToggle={onToggleContrastChecker} />
        )}
      </div>
    </div>
  );
};

export default PaintTypeRow;
