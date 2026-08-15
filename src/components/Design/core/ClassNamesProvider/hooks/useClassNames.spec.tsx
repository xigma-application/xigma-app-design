import { renderHook } from '@testing-library/react';

// components
import ClassNamesProvider from '../ClassNamesProvider';

// hooks
import { useClassNames } from './useClassNames';

describe('useClassNames', () => {
  it('should throw when used outside a ClassNamesProvider', () => {
    // result
    expect(() => renderHook(() => useClassNames())).toThrow('useClassNames must be used within a ClassNamesProvider');
  });

  it('should return the context value when used inside a ClassNamesProvider', () => {
    // before
    const { result } = renderHook(() => useClassNames(), {
      wrapper: ({ children }) => <ClassNamesProvider>{children}</ClassNamesProvider>,
    });

    // result
    expect(result.current.className).toBeNull();
    expect(typeof result.current.setClassName).toBe('function');
  });
});
