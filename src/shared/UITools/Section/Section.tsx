import cx from 'classnames';
import { Fragment, ReactElement, ReactNode } from 'react';
import { isArray } from 'lodash';

// @xigma
import { Tooltip } from '@xigma/components';

// components
import E2EDataAttribute from 'shared/E2EDataAttributes/E2EDataAttribute';
import { UITools } from 'shared';

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
  hasContent?: boolean;
  items?: TItem[];
  label?: ReactNode;
  mutedWhenEmpty?: boolean;
  onAdd?: TFunc;
  separator?: boolean;
};

export const Section = <TItem,>({
  addAriaLabel,
  addTooltip,
  children,
  component,
  e2eValue = '',
  hasContent: hasContentProp,
  items,
  label,
  mutedWhenEmpty = false,
  onAdd,
  separator = true,
}: TSectionProps<TItem>): ReactElement => {
  const hasContent = hasContentProp ?? (isArray(items) && isRenderItem<TItem>(children) ? items.length > 0 : Boolean(children));

  return (
    <E2EDataAttribute type={E2EAttribute.section} value={e2eValue}>
      <div
        className={cx(styles.Section, {
          [styles['Section--empty']]: !hasContent,
          [styles['Section--muted']]: mutedWhenEmpty && !hasContent,
          [styles['Section--noSeparator']]: !separator,
        })}
      >
        {label && (
          <div className={cx(styles.Section__header)}>
            <span className={styles.Section__label}>{label}</span>
            {(component || onAdd) && (
              <div className={cx(styles.Section__component)}>
                {component}
                {onAdd && (
                  <Tooltip align="end" content={addTooltip}>
                    <UITools.ButtonIcon ariaLabel={addAriaLabel} name="Plus" onClick={onAdd} />
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
