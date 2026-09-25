import { ReactElement, useContext } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';

// components
import ClassNamesProvider from './ClassNamesProvider';

// others
import { ClassNamesContext } from './context';

const Consumer = (): ReactElement => {
  const { className, setClassName } = useContext(ClassNamesContext)!;

  return (
    <button onClick={(): void => setClassName('grab')} type="button">
      {className ?? 'none'}
    </button>
  );
};

describe('ClassNamesProvider behaviors', () => {
  it('should share a class name that its children can change', () => {
    // before
    render(
      <ClassNamesProvider>
        <Consumer />
      </ClassNamesProvider>,
    );

    // result
    expect(screen.getByRole('button')).toHaveTextContent('none');

    // action
    act(() => {
      fireEvent.click(screen.getByRole('button'));
    });

    // result
    expect(screen.getByRole('button')).toHaveTextContent('grab');
  });
});
