import cx from 'classnames';
import { CSSProperties, FC } from 'react';
import { useTranslation } from 'react-i18next';

// assets
import ContrastSwatchIcon from 'assets/icons/contrast.svg?react';

// components
import Color from 'shared/UITools/Color/Color';
import Popover from 'shared/UITools/Popover/Popover';

// hooks
import { useContrastValuesButton } from './hooks/useContrastValuesButton';

// others
import { translationNameSpace } from '../constants';

// styles
import styles from './contrast-values-button.module.scss';

const getHexLabel = (hex: string): string => hex.replace('#', '').toUpperCase();

export type TContrastValuesButtonProps = { backgroundColor: string; foregroundColor: string; ratio: number };

export const ContrastValuesButton: FC<TContrastValuesButtonProps> = ({ backgroundColor, foregroundColor, ratio }) => {
  const { t } = useTranslation();
  const { onOpenChange, open } = useContrastValuesButton();

  return (
    <Popover
      align="start"
      asChild
      className={styles.ContrastValuesButton__popover}
      onOpenChange={onOpenChange}
      open={open}
      side="left"
      trigger={
        <button className={cx(styles.ContrastValuesButton, { [styles['ContrastValuesButton--open']]: open })} type="button">
          <ContrastSwatchIcon
            aria-hidden
            className={styles.ContrastValuesButton__swatch}
            style={{ '--contrast-background': backgroundColor, '--contrast-foreground': foregroundColor } as CSSProperties}
          />
          {t(`${translationNameSpace}.ratioLabel`, { ratio: ratio.toFixed(2) })}
        </button>
      }
      triggerTooltip={t(`${translationNameSpace}.values.tooltip`)}
    >
      <div className={styles.ContrastValuesButton__values}>
        <div className={styles.ContrastValuesButton__value}>
          <span className={styles.ContrastValuesButton__label}>{t(`${translationNameSpace}.values.foreground`)}</span>
          <div className={styles['ContrastValuesButton__color-group']}>
            <Color alpha={100} color={foregroundColor} cursor="default" />
            <span>{getHexLabel(foregroundColor)}</span>
          </div>
        </div>
        <div className={styles.ContrastValuesButton__value}>
          <span className={styles.ContrastValuesButton__label}>{t(`${translationNameSpace}.values.background`)}</span>
          <div className={styles['ContrastValuesButton__color-group']}>
            <Color alpha={100} color={backgroundColor} cursor="default" />
            <span>{getHexLabel(backgroundColor)}</span>
          </div>
        </div>
      </div>
    </Popover>
  );
};

export default ContrastValuesButton;
