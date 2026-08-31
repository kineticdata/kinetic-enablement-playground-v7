import t from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { Icon } from './Icon.jsx';
import { useSelector } from 'react-redux';
import { forwardRef } from 'react';

/**
 * Component for rendering a chip style button.
 *
 * @param {string} [className]
 * @param {boolean} [active] Is the chip in an active state.
 * @param {string} [icon] Icon to render at the end of the chip.
 * @param {JSX.Element|JSX.Element[]} [children] The content of the button.
 * @param {Object} [passThroughProps] Any additional props will we passed
 *  through to the component.
 */
export const ChipButton = ({
  className,
  active,
  icon,
  children,
  ...passThroughProps
}) => {
  const mobile = useSelector(state => state.view.mobile);
  return (
    <button
      type="button"
      className={clsx(
        'kbtn',
        active && 'kbtn-neutral',
        !active && 'kbtn-outline kbtn-base',
        className,
      )}
      {...passThroughProps}
    >
      {children}
      {icon && (
        <Icon name={icon} size={mobile ? 12 : 20} className="flex-none" />
      )}
    </button>
  );
};

ChipButton.propTypes = {
  className: t.string,
  active: t.bool,
  icon: t.string,
  children: t.node,
};

/**
 * Component for rendering a styled close button.
 *
 * @param {string} [className]
 * @param {('sm'|'md'|'lg')} [size=lg] The size of the button.
 * @param {Object} [passThroughProps] Any additional props will we passed
 *  through to the component.
 */
export const CloseButton = ({
  className,
  size = 'lg',
  ...passThroughProps
}) => (
  <button
    type="button"
    className={clsx(
      'kbtn kbtn-ghost kbtn-circle bg-transparent border-transparent',
      'opacity-70 hover:opacity-100 focus-visible:opacity-100',
      className,
    )}
    aria-label="Close"
    {...passThroughProps}
  >
    <Icon
      name="circle-x"
      filled
      size={size === 'sm' ? 24 : size === 'md' ? 28 : 32}
    />
  </button>
);

CloseButton.propTypes = {
  className: t.string,
  size: t.oneOf(['sm', 'md', 'lg']),
  inverse: t.bool,
};
