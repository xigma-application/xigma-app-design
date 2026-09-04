import cx from 'classnames';
import { FC } from 'react';

// components
import AccordionItem from './AccordionItem/AccordionItem';
import E2EDataAttribute from 'shared/E2EDataAttributes/E2EDataAttribute';

// styles
import styles from './accordion.module.scss';

// types
import { E2EAttribute } from 'types/e2e';
import { TAccordionItem } from './types';
import { TE2EValue } from 'shared/E2EDataAttributes/types';

export type TAccordionProps = {
  className?: string;
  e2eValue?: TE2EValue;
  items: TAccordionItem[];
};

export const Accordion: FC<TAccordionProps> = ({ className = '', e2eValue = '', items }) => (
  <E2EDataAttribute type={E2EAttribute.accordion} value={e2eValue}>
    <div className={cx(styles.Accordion, className)}>
      {items.map((item, index) => (
        <AccordionItem item={item} key={index} />
      ))}
    </div>
  </E2EDataAttribute>
);

export default Accordion;
