import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

// components
import LayoutGuideTypeItems from '../../LayoutGuideTypeItems/LayoutGuideTypeItems';
import { Icon, Tooltip, UITools } from 'shared';

// others
import { LAYOUT_GUIDE_ICONS, translationNameSpace } from '../../constants';

// styles
import styles from './layout-guide-settings-header.module.scss';

// types
import { LayoutGuideType } from 'types/design/enums';

export type TLayoutGuideSettingsHeaderProps = {
  onClose: TFunc;
  onTypeChange: TFunc<[LayoutGuideType]>;
  type: LayoutGuideType;
};

export const LayoutGuideSettingsHeader: FC<TLayoutGuideSettingsHeaderProps> = ({ onClose, onTypeChange, type }) => {
  const { t } = useTranslation();
  const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);

  return (
    <div className={styles.LayoutGuideSettingsHeader}>
      <UITools.Popover
        align="start"
        asChild
        onOpenChange={setIsTypeMenuOpen}
        trigger={
          <button
            aria-label={t(`${translationNameSpace}.settings.changeTypeAriaLabel`)}
            className={styles.LayoutGuideSettingsHeader__type}
            data-open={isTypeMenuOpen}
            type="button"
          >
            <Icon name={LAYOUT_GUIDE_ICONS[type]} size={24} />
            <span className={styles.LayoutGuideSettingsHeader__title}>{t(`${translationNameSpace}.menu.options.${type}`)}</span>
            <Icon name="ChevronDown" size={24} />
          </button>
        }
      >
        <LayoutGuideTypeItems onSelect={onTypeChange} selectedType={type} />
      </UITools.Popover>
      <div className={styles.LayoutGuideSettingsHeader__actions}>
        <Tooltip content={t('common.close')}>
          <UITools.ButtonIcon ariaLabel={t('common.close')} name="Close" onClick={onClose} />
        </Tooltip>
      </div>
    </div>
  );
};

export default LayoutGuideSettingsHeader;
