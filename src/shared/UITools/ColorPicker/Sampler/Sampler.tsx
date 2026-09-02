import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { ButtonMenu, Icon } from 'shared';

// hooks
import { useToggleSampler } from './hooks/useToggleSampler';

// styles
import styles from './sampler.module.scss';

export type TSamplerProps = { onClose?: TFunc; onOpen?: TFunc };

export const Sampler: FC<TSamplerProps> = ({ onClose, onOpen }) => {
  const { t } = useTranslation();
  const label = t('colorPicker.sampler.tooltip');
  const handleOpenChange = useToggleSampler(onOpen, onClose);

  return (
    <div className={styles.Sampler}>
      <ButtonMenu
        className={styles.Sampler__button}
        onOpenChange={handleOpenChange}
        trigger={(isOpen) => <Icon color={isOpen ? 'blue1' : 'neutral1'} name="Sample" size={14} />}
        triggerAriaLabel={label}
      />
    </div>
  );
};

export default Sampler;
