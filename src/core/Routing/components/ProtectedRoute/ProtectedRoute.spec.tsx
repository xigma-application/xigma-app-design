import { render, screen } from '@testing-library/react';

// components
import ProtectedRoute from './ProtectedRoute';

// types
import { TGuard } from '../../types';

describe('ProtectedRoute behaviors', () => {
  it('should render children when all guards pass', () => {
    // mock
    const guard: TGuard = {
      guardCheck: () => true,
      renderFallback: () => <p>Fallback</p>,
    };

    // before
    render(
      <ProtectedRoute guards={[guard]}>
        <p>Protected content</p>
      </ProtectedRoute>,
    );

    // result
    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('should render the failing guard fallback instead of children', () => {
    // mock
    const guard: TGuard = {
      guardCheck: () => false,
      renderFallback: () => <p>Fallback</p>,
    };

    // before
    render(
      <ProtectedRoute guards={[guard]}>
        <p>Protected content</p>
      </ProtectedRoute>,
    );

    // result
    expect(screen.getByText('Fallback')).toBeInTheDocument();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });
});
