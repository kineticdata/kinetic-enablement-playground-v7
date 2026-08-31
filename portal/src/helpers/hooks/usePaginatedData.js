import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { usePagination } from './usePagination.js';

/******************************************************************************
 * Retrieves a list of data and returns relevant data and meta properties, as
 * well as actions for handling pagination.
 *
 * @param {Function} fn - A Kinetic API function for fetching data that uses
 *  page token pagination.
 * @param {Object} [params] - An object of parameters that will be passed into
 *  the api function. If falsy, the fetch will not be triggered.
 * @returns {PaginatedDataResults} - An object of relevant data and actions.
 ******************************************************************************/
export function usePaginatedData(fn, params) {
  // Response and timestamp of last fetch of the query
  const [[response, lastTimestamp], setData] = useState([null, null]);
  // Pagination state for the query
  const {
    pageToken,
    setNextPageToken,
    resetPagination,
    pageNumber,
    previousPage,
    nextPage,
  } = usePagination();

  // If params change, reset response state and pagination to initial values
  useEffect(() => {
    // Reset response
    setData(([, ts]) => [null, ts]);
    // Reset pagination
    resetPagination();
  }, [params, resetPagination]);

  // Function to execute the query with the current params and pageToken
  const executeQuery = useCallback(() => {
    if (params) {
      // Get current timestamp so we can track the last execution
      const timestamp = new Date().getTime();
      // Set the timestamp into state so we know we're loading data
      setData(([d]) => [d, timestamp]);
      // Retrieve the data
      fn({ ...params, pageToken }).then(response => {
        setData(([d, ts]) => {
          // If the timestamp in state matches the one for this call, set the
          // response and reset the timestamp
          if (ts === timestamp) {
            // Set the nextPageToken into the pagination state
            setNextPageToken(response.nextPageToken);
            return [response, null];
          }
          // Otherwise, if the timestamp doesn't match, ignore these results so
          // we don't set stale data into the state
          else return [d, ts];
        });
      });
    } else {
      // Reset data when params are cleared
      setData(([, ts]) => [null, ts]);
    }
  }, [fn, params, pageToken, setNextPageToken]);

  // Create a deferred copy of executeQuery so that if multiple successive
  // dependency changes trigger it being redefined, the query will only execute
  // once in the below effect
  const executeQueryDeferred = useDeferredValue(executeQuery);

  // Whenever the executeQueryDeferred changes, meaning the params or pageToken
  // changed, execute the query to get new data
  useEffect(() => {
    executeQueryDeferred();
  }, [executeQueryDeferred]);

  // Function to reset pagination and data states, and execute the query
  const reloadData = useCallback(() => {
    // Reset response
    setData(([, ts]) => [null, ts]);
    // If pageToken exists, reset pagination which will trigger executeQuery
    if (pageToken) resetPagination();
    // Otherwise, trigger executeQuery manually
    else executeQuery();
  }, [pageToken, resetPagination, executeQuery]);

  return useMemo(
    () => ({
      initialized: !!params,
      loading: !!params && (!response || !!lastTimestamp),
      response,
      pageNumber,
      actions: {
        previousPage,
        nextPage,
        reloadPage: executeQuery,
        reloadData,
      },
    }),
    [
      params,
      response,
      lastTimestamp,
      pageNumber,
      previousPage,
      nextPage,
      executeQuery,
      reloadData,
    ],
  );
}

/**
 * @typedef {Object} PaginatedDataResults.
 * @property {boolean} initialized - Has the fetch been triggered.
 * @property {boolean} loading - Is the data being retrieved right now.
 * @property {Object} response - Response from the provided api function.
 * @property {number} pageNumber - The current page number, starting at 1.
 * @property {Object} actions - An object of actions related to the data.
 * @property {Function} actions.previousPage - Function to retrieve the
 *  previous page. Omitted if there is no previous page.
 * @property {Function} actions.nextPage - Function to retrieve the next page.
 *  Omitted if there is no previous page.
 * @property {Function} actions.reloadPage - Function to reload the data of the
 *  current page.
 * @property {Function} actions.reloadData - Function to reload the data,
 *  resetting pagination in the process.
 */
