import { Fragment } from 'react';
import { TFunction } from 'i18next';

// others
import { KEYBOARD_SHORTCUTS } from 'components/Design/keys';

// styles
import styles from '../column-alignment.module.scss';

// types
import { TAlignmentOption } from '../types';
import { TButtonGroup } from 'shared/UITools/ButtonGroup/types';

export const buildAlignmentButtons = (options: TAlignmentOption[], disabled: boolean, t: TFunction): TButtonGroup[] =>
  options.map(({ labelKey, name, shortcutKey }) => ({
    ariaLabel: t(labelKey),
    disabled,
    name,
    onClick: (): void => {},
    tooltip: (
      <Fragment>
        {t(labelKey)}
        <span className={styles.ColumnAlignment__shortcut}>{KEYBOARD_SHORTCUTS[shortcutKey].join('')}</span>
      </Fragment>
    ),
  }));
