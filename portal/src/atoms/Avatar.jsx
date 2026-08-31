import clsx from 'clsx';
import t from 'prop-types';
import { Link, useLocation } from 'react-router-dom';

/**
 *
 * @param {string} username The username of the user, used for rendering the
 *  first letter.
 * @param {('sm'|'md'|'lg'|'xl')} [size=sm] The size of the avatar.
 * @param {('primary'|'neutral')} [color] The color of the avatar.
 * @param {('button'|'a'|'link')} [as] The tag to use for rendering the avatar.
 * @param {string} [className] Additional classes to add to the avatar
 * @param {Object} [passThroughProps] Any additional props will we passed
 *  through to the component.
 */
export const Avatar = ({
  username = '',
  size = 'sm',
  color,
  as,
  className,
  ...passThroughProps
}) => {
  const location = useLocation();
  const isLink = as === 'link';
  const isActionable = isLink || ['a', 'button'].includes(as);
  const Tag = isLink ? Link : as || 'div';
  const additionalProps = !isLink
    ? {}
    : { state: { backPath: location.pathname } };

  return (
    <Tag
      className={clsx(
        'kavatar kavatar-placeholder',
        isActionable && 'kavatar-actionable',
        {
          'kavatar-primary': color === 'primary',
          'kavatar-neutral': color === 'neutral',
        },
        {
          'kavatar-xs': size === 'xs',
          'kavatar-sm': size === 'sm',
          'kavatar-lg': size === 'lg',
          'kavatar-xl': size === 'xl',
          'kavatar-2xl': size === '2xl',
        },
        className,
      )}
      {...additionalProps}
      {...passThroughProps}
    >
      <div>{username.slice(0, 1)}</div>
    </Tag>
  );
};

Avatar.propTypes = {
  username: t.string.isRequired,
  size: t.oneOf(['sm', 'md', 'lg', 'xl', '2xl']),
  className: t.string,
};
