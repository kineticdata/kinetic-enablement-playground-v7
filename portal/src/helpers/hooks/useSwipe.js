import { useCallback, useState } from 'react';
import { callIfFn } from '../index.js';

/**
 * Provides swipe functionality to allow triggering callbacks when an item is
 *  swiped a certain distance and direction.
 *
 * @param {Object} [options]
 * @param {number} [options.threshold] The distance the swipe must pass for a
 *  callback to be triggered.
 * @param {Function} [options.onLeftSwipe] The callback to trigger when the
 *  swipe is in the left direction and passes the `threshold` distance.
 * @param {Function} [options.onRightSwipe] The callback to trigger when the
 *  swipe is in the right direction and passes the `threshold` distance.
 * @returns {SwipeState} A state object of relevant data and event handlers for
 *  the swipe functionality.
 */
const useSwipe = ({ threshold = 64, onLeftSwipe, onRightSwipe } = {}) => {
  if (typeof threshold !== 'number' || threshold < 1) {
    throw new Error('useSwipe requires `threshold` to be a positive number');
  }

  const [startX, setStartX] = useState(null);
  const [endX, setEndX] = useState(null);

  const resetX = useCallback(() => {
    setEndX(null);
    setStartX(null);
  }, []);

  const onTouchStart = e => {
    setEndX(e.targetTouches[0].clientX);
    setStartX(e.targetTouches[0].clientX);
  };

  const onTouchMove = e => setEndX(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!startX || !endX) return;
    const distance = startX - endX;

    // If swiped left
    if (distance >= threshold) {
      callIfFn(onLeftSwipe);
    }

    // If swiped right
    if (distance + threshold <= 0) {
      callIfFn(onRightSwipe);
    }

    resetX();
  };

  const active = startX && endX;
  const distance = active ? startX - endX : 0;

  return {
    left:
      typeof onLeftSwipe === 'function' && distance > 0
        ? Math.max(distance * -1, threshold * -1)
        : undefined,
    right:
      typeof onRightSwipe === 'function' && distance < 0
        ? Math.max(distance, threshold * -1)
        : undefined,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
};

export default useSwipe;

/**
 * @typedef {Object} SwipeState The state of the swipe event.
 * @property {Function} onTouchStart Event handler to pass to the swipable item.
 * @property {Function} onTouchMove Event handler to pass to the swipable item.
 * @property {Function} onTouchEnd Event handler to pass to the swipable item.
 * @property {number} left Left offset for the item representing the distance
 *  swiped in that direction.
 * @property {number} right Right offset for the item representing the distance
 *  swiped in that direction.
 */
