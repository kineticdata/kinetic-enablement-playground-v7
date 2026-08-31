import { useCallback, useEffect, useMemo, useState } from 'react';

/******************************************************************************
 * Retrieves data and returns the data and meta properties.
 *
 * @param {Function} fn - A Kinetic API function for fetching data.
 * @param {Object} [params] - An object of parameters that will be passed into
 *  the api function. If falsy, the fetch will not be triggered.
 * @returns {DataResults} - An object of relevant data and actions.
 ******************************************************************************/
export function useData(fn, params) {
  // Response and timestamp of last fetch of the query
  const [[response, lastTimestamp], setData] = useState([null, null]);

  // Function to execute the query with the current params and pageToken
  const executeQuery = useCallback(() => {
    if (params) {
      // Get current timestamp so we can track the last execution
      const timestamp = new Date().getTime();
      // Set the timestamp into state so we know we're loading data
      setData(([d]) => [d, timestamp]);
      // Retrieve the data
      fn(params).then(response => {
        setData(([d, ts]) => {
          // If the timestamp in state matches the one for this call, set the
          // response and reset the timestamp to unset loading state
          if (ts === timestamp) {
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
  }, [fn, params]);

  // Whenever the executeQuery changes, meaning the params changed, execute the
  // query to get new data
  useEffect(() => {
    executeQuery();
  }, [executeQuery]);

  return useMemo(
    () => ({
      initialized: !!params,
      loading: !!params && (!response || !!lastTimestamp),
      response,
      actions: { reloadData: executeQuery },
    }),
    [params, response, lastTimestamp, executeQuery],
  );
}

/**
 * @typedef {Object} DataResults.
 * @property {boolean} initialized - Has the fetch been triggered.
 * @property {boolean} loading - Is the data being retrieved right now.
 * @property {Object} response - Response from the provided api function.
 * @property {Object} actions - An object of actions related to the data.
 * @property {Function} actions.reloadData - Function to reload the data.
 */
