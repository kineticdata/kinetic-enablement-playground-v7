import t from 'prop-types';
import clsx from 'clsx';
import { Icon } from '../../atoms/Icon.jsx';

export const Loading = ({ className, size = 48, small, xsmall }) => (
  <div
    className={clsx(
      'flex justify-center items-center text-base-content/60',
      { 'p-6': !small && !xsmall, 'p-3': small, 'p-1': xsmall },
      className,
    )}
  >
    <Icon name="loader-2" className="animate-spin" size={size} />
  </div>
);

Loading.propTypes = {
  className: t.string,
  size: t.number,
  small: t.bool,
};
