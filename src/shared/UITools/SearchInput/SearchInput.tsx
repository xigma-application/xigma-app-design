import cx from 'classnames';
import { ChangeEvent, FC } from 'react';

// @xigma
import { Icon } from '@xigma/components';

// components
import E2EDataAttribute from 'shared/E2EDataAttributes/E2EDataAttribute';

// styles
import styles from './search-input.module.scss';

// types
import { E2EAttribute } from 'types/e2e';

export type TSearchInputProps = {
  ariaLabel?: string;
  autoFocus?: boolean;
  className?: string;
  onChange: TFunc<[string]>;
  placeholder?: string;
  value: string;
};

export const SearchInput: FC<TSearchInputProps> = ({ ariaLabel, autoFocus = false, className = '', onChange, placeholder, value }) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => onChange(event.target.value);

  return (
    <div className={cx(styles.SearchInput, className)}>
      <Icon color="neutral2" name="Search" size={16} />
      <E2EDataAttribute type={E2EAttribute.bypassGlobalShortcuts} value="true">
        <input
          aria-label={ariaLabel}
          autoFocus={autoFocus}
          className={styles.SearchInput__field}
          onChange={handleChange}
          placeholder={placeholder}
          type="text"
          value={value}
        />
      </E2EDataAttribute>
    </div>
  );
};

export default SearchInput;
