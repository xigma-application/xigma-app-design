import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { ButtonMenu, Icon } from 'shared';

// hooks
import { useOpenSampler } from './hooks/useOpenSampler';

// styles
import styles from './sampler.module.scss';

export type TSamplerProps = { onClick?: TFunc };

export const Sampler: FC<TSamplerProps> = ({ onClick }) => {
  const { t } = useTranslation();
  const label = t('colorPicker.sampler.tooltip');
  const handleOpenChange = useOpenSampler(onClick);

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
