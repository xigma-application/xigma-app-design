import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// @xigma
import { Icon } from '@xigma/components';

// components
import ColumnBackgroundAlphaField from './ColumnBackgroundAlphaField';
import ColumnBackgroundColorField from './ColumnBackgroundColorField';
import { FieldGroup } from 'shared';

// hooks
import { useColumnBackgroundColor } from './hooks/useColumnBackgroundColor';

// others
import { translationNameSpace } from '../constants';

// styles
import styles from './column-background.module.scss';

const ColumnBackground: FC = () => {
  const { t } = useTranslation();
  const { alpha, hex, isVisible, onCommitAlpha, onCommitHex, onPickerChange, onToggleVisibility } = useColumnBackgroundColor();

  return (
    <div className={styles.ColumnBackground}>
      <FieldGroup className={styles.ColumnBackground__fields}>
        <ColumnBackgroundColorField alpha={alpha} hex={hex} onCommit={onCommitHex} onPickerChange={onPickerChange} />
        <ColumnBackgroundAlphaField alpha={alpha} onCommit={onCommitAlpha} />
      </FieldGroup>
      <button
        aria-label={t(`${translationNameSpace}.background.toggleVisibilityAriaLabel`)}
        className={styles.ColumnBackground__toggle}
        onClick={onToggleVisibility}
        type="button"
      >
        <Icon name={isVisible ? 'EyesOpened' : 'EyesClosed'} size={16} />
      </button>
    </div>
  );
};

export default ColumnBackground;
