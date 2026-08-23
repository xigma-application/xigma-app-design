import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import VectorEditMoreDropdownItems from '../VectorEditMoreDropdownItems/VectorEditMoreDropdownItems';
import { Icon, Popover } from 'shared';

// hooks
import { useVectorEditMoreDropdownPlaceholder } from './hooks/useVectorEditMoreDropdownPlaceholder';

// others
import { translationNameSpace } from '../../constants';

// styles
import styles from '../../vector-edit-toolbar.module.scss';

const VectorEditMoreDropdownPlaceholder: FC = () => {
  const { t } = useTranslation();
  const { handleOpenChange, isOpen } = useVectorEditMoreDropdownPlaceholder();

  return (
    <Popover
      onOpenChange={handleOpenChange}
      side="top"
      trigger={
        <div className={styles.VectorEditToolbar__more}>
          <span className={styles.VectorEditToolbar__label} style={{ padding: '0' }}>
            {t(`${translationNameSpace}.more`)}
          </span>
          <Icon color={isOpen ? 'blue1' : 'neutral1'} name="ChevronDown" size={16} />
        </div>
      }
      triggerAriaLabel={t(`${translationNameSpace}.more`)}
      triggerClassName={styles['VectorEditToolbar__more--trigger']}
    >
      <VectorEditMoreDropdownItems lastMoreTool={null} />
    </Popover>
  );
};

export default VectorEditMoreDropdownPlaceholder;
