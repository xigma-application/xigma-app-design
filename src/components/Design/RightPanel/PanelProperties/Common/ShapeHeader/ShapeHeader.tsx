import { FC, Fragment } from 'react';

// components
import PanelHeader from '../PanelHeader/PanelHeader';
import PanelHeaderBooleanButton from '../PanelHeader/PanelHeaderBooleanButton';
import PanelHeaderComponentButton from '../PanelHeader/PanelHeaderComponentButton';
import PanelHeaderMaskButton from '../PanelHeader/PanelHeaderMaskButton';
import PanelHeaderMatchingLayersButton from '../PanelHeader/PanelHeaderMatchingLayersButton';
import PanelHeaderMoreActionsButton from '../PanelHeader/PanelHeaderMoreActionsButton';
import PanelHeaderShapeMoreActionsButton from '../PanelHeader/PanelHeaderShapeMoreActionsButton';

// store
import { selectSelectedIds } from 'store/design/selectors';
import { useAppSelector } from 'store';

export type TShapeHeaderProps = { e2eValue: string; label: string };

const ShapeHeader: FC<TShapeHeaderProps> = ({ e2eValue, label }) => {
  const isMultiple = useAppSelector(selectSelectedIds).length > 1;

  return (
    <PanelHeader
      buttons={
        <Fragment>
          <PanelHeaderMatchingLayersButton />
          {!isMultiple && <PanelHeaderComponentButton />}
          <PanelHeaderMaskButton />
          <PanelHeaderBooleanButton />
          {isMultiple ? <PanelHeaderMoreActionsButton /> : <PanelHeaderShapeMoreActionsButton />}
        </Fragment>
      }
      e2eValue={e2eValue}
      label={label}
    />
  );
};

export default ShapeHeader;
