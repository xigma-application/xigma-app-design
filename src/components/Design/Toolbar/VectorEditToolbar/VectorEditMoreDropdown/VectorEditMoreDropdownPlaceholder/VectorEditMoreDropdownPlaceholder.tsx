import cx from 'classnames';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import VectorEditMoreDropdownItems from '../VectorEditMoreDropdownItems/VectorEditMoreDropdownItems';
import { ButtonMenu, Icon } from 'shared';

// others
import { translationNameSpace } from '../../constants';

// styles
import styles from '../../vector-edit-toolbar.module.scss';

const VectorEditMoreDropdownPlaceholder: FC = () => {
  const { t } = useTranslation();

  return (
    <ButtonMenu
      className={styles['VectorEditToolbar__more-button-menu']}
      side="top"
      trigger={(isOpen) => (
        <div className={styles.VectorEditToolbar__more}>
          <span
            className={cx(styles.VectorEditToolbar__label, isOpen && styles['VectorEditToolbar__label--open'])}
            style={{ padding: '0' }}
          >
            {t(`${translationNameSpace}.more`)}
          </span>
          <Icon color={isOpen ? 'blue1' : 'neutral1'} name="ChevronDown" size={16} />
        </div>
      )}
      triggerAriaLabel={t(`${translationNameSpace}.more`)}
    >
      <VectorEditMoreDropdownItems lastMoreTool={null} />
    </ButtonMenu>
  );
};

export default VectorEditMoreDropdownPlaceholder;
