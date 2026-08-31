import { useEffect, useRef } from 'react';

/******************************************************************************
 * Polls data at an increasing interval. Starts at 5 seconds, and doubles until
 * it gets to 1 minute.
 *
 * @param {Function} fn - A function to poll.
 ******************************************************************************/
export function usePoller(fn) {
  // State to track the poller
  const poller = useRef({ id: null, counter: 1 });

  useEffect(() => {
    if (typeof fn === 'function') {
      startPoller(fn, poller.current);
      return () => clearTimeout(poller.current.id);
    }
  }, [fn]);
}

function startPoller(fn, state) {
  state.id = setTimeout(
    () => {
      // Trigger poll function
      fn();
      // Update the counter by doubling it, but limit it to 12
      state.counter = Math.min(state.counter * 2, 12);
      // Trigger next poller timeout
      startPoller(fn, state);
    },
    // Set the delay by multiplying the counter by 5 seconds
    state.counter * 5000,
  );
}
