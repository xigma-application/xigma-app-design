import { FC } from 'react';

// components
import E2EDataAttribute from 'shared/E2EDataAttributes/E2EDataAttribute';

// hooks
import { useChannelFieldCommit } from './hooks/useChannelFieldCommit';

// styles
import styles from './channel-fields.module.scss';

// types
import { TChannel } from './types';
import { E2EAttribute } from 'types/e2e';

export type TChannelFieldsProps = {
  channels: TChannel[];
  onCommit: TFunc<[Record<string, number>]>;
  values: Record<string, number>;
};

export const ChannelFields: FC<TChannelFieldsProps> = ({ channels, onCommit, values }) => {
  const commit = useChannelFieldCommit(values, onCommit);

  return (
    <>
      {channels.map(({ key, max }) => (
        <E2EDataAttribute key={`${key}-${values[key]}`} type={E2EAttribute.bypassGlobalShortcuts} value="true">
          <input
            className={styles.ChannelFields__field}
            defaultValue={Math.round(values[key])}
            max={max}
            min={0}
            onBlur={commit.onBlur(key, max)}
            onKeyDown={commit.onKeyDown(key, max)}
            type="number"
          />
        </E2EDataAttribute>
      ))}
    </>
  );
};

export default ChannelFields;
