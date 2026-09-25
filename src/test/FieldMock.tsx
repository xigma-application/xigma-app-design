import { ReactElement } from 'react';

export const fieldProps: Record<string, unknown>[] = [];

export const FieldMock = (props: Record<string, unknown>): ReactElement => {
  fieldProps.push(props);

  return <div data-testid="field">{props.label as string}</div>;
};
