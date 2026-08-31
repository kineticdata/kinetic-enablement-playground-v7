import { useCallback, useState } from 'react';

/******************************************************************************
 * Handles state for page token pagination.
 *
 * @returns {PaginationState} - An object of relevant data and actions.
 ******************************************************************************/
export function usePagination() {
  const [pagination, setPagination] = useState({
    pageToken: undefined,
    nextPageToken: undefined,
    previousPageTokens: [],
  });

  const setNextPageToken = useCallback(nextPageToken => {
    setPagination(p => ({ ...p, nextPageToken }));
  }, []);

  const resetPagination = useCallback(() => {
    setPagination({
      pageToken: undefined,
      nextPageToken: undefined,
      previousPageTokens: [],
    });
  }, []);

  const prev = useCallback(() => {
    setPagination(
      ({
        pageToken: nextPageToken,
        previousPageTokens: [pageToken, ...previousPageTokens],
      }) => ({
        pageToken,
        previousPageTokens,
        nextPageToken,
      }),
    );
  }, []);

  const next = useCallback(() => {
    setPagination(({ pageToken, nextPageToken, previousPageTokens }) => ({
      pageToken: nextPageToken,
      nextPageToken: undefined,
      previousPageTokens: [pageToken, ...previousPageTokens],
    }));
  }, []);

  return {
    pageToken: pagination.pageToken,
    setNextPageToken,
    pageNumber: pagination.previousPageTokens.length + 1,
    resetPagination,
    previousPage: pagination.previousPageTokens.length > 0 ? prev : undefined,
    nextPage: pagination.nextPageToken ? next : undefined,
  };
}

/**
 * @typedef {Object} PaginationState.
 * @property {string} pageToken - The current page token to use in a query.
 * @property {Function} setNextPageToken - Function to set the nextPageToken
 *  after a query completes.
 * @property {number} pageNumber - The current page number, starting at 1.
 * @property {Function} resetPagination - Function to reset the pagination
 *  state.
 * @property {Function} previousPage - Function to set the pageToken to the
 *  previous page's token.
 * @property {Function} nextPage - Function to set the pageToken to the
 *  next page's token.
 */
