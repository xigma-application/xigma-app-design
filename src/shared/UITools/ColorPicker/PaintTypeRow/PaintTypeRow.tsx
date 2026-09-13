import cx from 'classnames';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Icon, Tooltip, UITools } from 'shared';

// styles
import styles from './paint-type-row.module.scss';

// types
import { ColorPickerTab } from '../enums';

export type TPaintTypeRowProps = { activeTab: ColorPickerTab; onSelectTab: TFunc<[ColorPickerTab]> };

export const PaintTypeRow: FC<TPaintTypeRowProps> = ({ activeTab, onSelectTab }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.PaintTypeRow}>
      <Tooltip content={t('colorPicker.paintType.solid')}>
        <UITools.Button
          ariaLabel={t('colorPicker.paintType.solid')}
          className={cx(styles.PaintTypeRow__button, { [styles['PaintTypeRow__button--active']]: activeTab === ColorPickerTab.solid })}
          onClick={(): void => onSelectTab(ColorPickerTab.solid)}
          style={{ padding: 0 }}
        >
          <Icon name="Solid" size={24} />
        </UITools.Button>
      </Tooltip>
      <Tooltip content={t('colorPicker.paintType.gradient')}>
        <UITools.Button
          ariaLabel={t('colorPicker.paintType.gradient')}
          className={cx(styles.PaintTypeRow__button, {
            [styles['PaintTypeRow__button--active']]: activeTab === ColorPickerTab.gradient,
          })}
          onClick={(): void => onSelectTab(ColorPickerTab.gradient)}
          style={{ padding: 0 }}
        >
          <Icon name="Gradient" size={24} />
        </UITools.Button>
      </Tooltip>
    </div>
  );
};

export default PaintTypeRow;
