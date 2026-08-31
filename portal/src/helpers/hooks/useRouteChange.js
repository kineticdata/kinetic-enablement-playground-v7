import { useLocation } from 'react-router-dom';
import { useCallback, useEffect } from 'react';

/**
 * Hook for calling a function when the route changes.
 *
 * @param {Function} callback - Function to call when the route changes, with
 *  the new pathname provided as a parameter to the function
 * @param {*[]} [dependencies] - Dependency array for the `callback` function
 */
const useRouteChange = (callback, dependencies = []) => {
  const { pathname, state } = useLocation();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fn = useCallback(callback, dependencies);

  useEffect(() => {
    fn(pathname, state);
  }, [pathname, state, fn]);
};

export default useRouteChange;
