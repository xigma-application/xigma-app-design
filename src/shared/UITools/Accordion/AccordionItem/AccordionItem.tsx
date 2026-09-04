import cx from 'classnames';
import { FC, useState } from 'react';

// @xigma
import { Icon } from '@xigma/components';

// components
import E2EDataAttribute from 'shared/E2EDataAttributes/E2EDataAttribute';

// styles
import styles from './accordion-item.module.scss';

// types
import { E2EAttribute } from 'types/e2e';
import { TAccordionItem } from '../types';
import { TE2EValue } from 'shared/E2EDataAttributes/types';

export type TAccordionItemProps = {
  e2eValue?: TE2EValue;
  item: TAccordionItem;
};

export const AccordionItem: FC<TAccordionItemProps> = ({ e2eValue = '', item }) => {
  const [expanded, setExpanded] = useState(Boolean(item.defaultExpanded));

  const toggleExpanded = (): void => setExpanded((prev) => !prev);

  return (
    <E2EDataAttribute type={E2EAttribute.accordionItem} value={e2eValue}>
      <div className={styles.AccordionItem}>
        <button aria-expanded={expanded} className={styles.AccordionItem__header} onClick={toggleExpanded} type="button">
          <span className={cx(styles.AccordionItem__icon, { [styles['AccordionItem__icon--expanded']]: expanded })}>
            <Icon color="neutral1" name="Triangle" size={6} />
          </span>
          <span className={styles.AccordionItem__label}>{item.label}</span>
        </button>
        {expanded && <div className={styles.AccordionItem__content}>{item.content}</div>}
      </div>
    </E2EDataAttribute>
  );
};

export default AccordionItem;
