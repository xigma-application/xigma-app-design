import cx from 'classnames';
import { Fragment, ReactElement, ReactNode } from 'react';
import { isArray } from 'lodash';

// @xigma
import { Icon, Tooltip } from '@xigma/components';

// components
import Button from '../Button/Button';
import E2EDataAttribute from 'shared/E2EDataAttributes/E2EDataAttribute';

// styles
import styles from './section.module.scss';

// types
import { E2EAttribute } from 'types/e2e';
import { TE2EValue } from 'shared/E2EDataAttributes/types';

// utils
import { isRenderItem } from './utils/isRenderItem';

export type TSectionProps<TItem = never> = {
  addAriaLabel?: string;
  addTooltip?: ReactNode;
  children?: ReactNode | ((item: TItem, index: number) => ReactNode);
  component?: ReactElement;
  e2eValue?: TE2EValue;
  items?: TItem[];
  label?: ReactNode;
  onAdd?: TFunc;
};

export const Section = <TItem,>({
  addAriaLabel,
  addTooltip,
  children,
  component,
  e2eValue = '',
  items,
  label,
  onAdd,
}: TSectionProps<TItem>): ReactElement => {
  const hasContent = isArray(items) && isRenderItem<TItem>(children) ? items.length > 0 : Boolean(children);

  return (
    <E2EDataAttribute type={E2EAttribute.section} value={e2eValue}>
      <div className={cx(styles.Section, { [styles['Section--empty']]: !hasContent })}>
        {label && (
          <div className={cx(styles.Section__header)}>
            <span className={styles.Section__label}>{label}</span>
            {(component || onAdd) && (
              <div className={cx(styles.Section__component)}>
                {component}
                {onAdd && (
                  <Tooltip align="end" content={addTooltip}>
                    <Button ariaLabel={addAriaLabel} onClick={onAdd} style={{ padding: 0 }}>
                      <Icon name="Plus" size={24} />
                    </Button>
                  </Tooltip>
                )}
              </div>
            )}
          </div>
        )}
        {isArray(items) && isRenderItem<TItem>(children)
          ? items.map((item, index) => <Fragment key={index}>{children(item, index)}</Fragment>)
          : (children as ReactNode)}
      </div>
    </E2EDataAttribute>
  );
};

export default Section;
