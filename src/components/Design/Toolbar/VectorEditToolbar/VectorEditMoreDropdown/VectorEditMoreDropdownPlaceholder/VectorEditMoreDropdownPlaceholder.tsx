import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import VectorEditMoreDropdownItems from '../VectorEditMoreDropdownItems/VectorEditMoreDropdownItems';
import { Icon, UITools } from 'shared';

// others
import { translationNameSpace } from '../../constants';

// styles
import styles from '../../vector-edit-toolbar.module.scss';

const VectorEditMoreDropdownPlaceholder: FC = () => {
  const { t } = useTranslation();

  return (
    <UITools.ButtonMenu
      className={styles['VectorEditToolbar__more-button-menu']}
      side="top"
      trigger={
        <div className={styles.VectorEditToolbar__more}>
          <span className={styles.VectorEditToolbar__label} style={{ padding: '0' }}>
            {t(`${translationNameSpace}.more`)}
          </span>
          <Icon name="ChevronDown" size={16} />
        </div>
      }
      triggerAriaLabel={t(`${translationNameSpace}.more`)}
    >
      <VectorEditMoreDropdownItems lastMoreTool={null} />
    </UITools.ButtonMenu>
  );
};

export default VectorEditMoreDropdownPlaceholder;
