import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

// components
import BlendModeButton from 'shared/UITools/ColorPicker/PaintTypeRow/BlendModeButton/BlendModeButton';
import EffectTypeItems from '../../EffectTypeItems/EffectTypeItems';
import { Icon, Tooltip, UITools } from 'shared';

// others
import { EFFECT_ICONS, translationNameSpace } from '../../constants';

// styles
import styles from './effect-settings-header.module.scss';

// types
import { BlendMode, EffectType } from 'types/design/enums';

export type TEffectSettingsHeaderProps = {
  blendMode: BlendMode;
  hasBlendMode: boolean;
  onBlendModeChange: TFunc<[BlendMode]>;
  onBlendModePreview: TFunc<[BlendMode | null]>;
  onClose: TFunc;
  onTypeChange: TFunc<[EffectType]>;
  type: EffectType;
};

export const EffectSettingsHeader: FC<TEffectSettingsHeaderProps> = ({
  blendMode,
  hasBlendMode,
  onBlendModeChange,
  onBlendModePreview,
  onClose,
  onTypeChange,
  type,
}) => {
  const { t } = useTranslation();
  const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);

  return (
    <div className={styles.EffectSettingsHeader}>
      <UITools.Popover
        align="start"
        asChild
        onOpenChange={setIsTypeMenuOpen}
        trigger={
          <button
            aria-label={t(`${translationNameSpace}.settings.changeTypeAriaLabel`)}
            className={styles.EffectSettingsHeader__type}
            data-open={isTypeMenuOpen}
            type="button"
          >
            <Icon name={EFFECT_ICONS[type]} size={24} />
            <span className={styles.EffectSettingsHeader__title}>{t(`${translationNameSpace}.menu.options.${type}`)}</span>
            <Icon name="ChevronDown" size={24} />
          </button>
        }
      >
        <EffectTypeItems onSelect={onTypeChange} selectedType={type} withCheck />
      </UITools.Popover>
      <div className={styles.EffectSettingsHeader__actions}>
        {hasBlendMode && (
          <BlendModeButton
            ariaLabel={t(`${translationNameSpace}.settings.blendModeAriaLabel`)}
            onChange={onBlendModeChange}
            onPreview={onBlendModePreview}
            value={blendMode}
          />
        )}
        <Tooltip content={t('common.close')}>
          <UITools.ButtonIcon ariaLabel={t('common.close')} name="Close" onClick={onClose} />
        </Tooltip>
      </div>
    </div>
  );
};

export default EffectSettingsHeader;
