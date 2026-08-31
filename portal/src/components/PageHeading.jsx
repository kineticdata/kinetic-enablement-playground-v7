import clsx from 'clsx';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from '../atoms/Icon.jsx';
import { useSelector } from 'react-redux';

export const PageHeading = ({
  title,
  before,
  after,
  backTo = './..',
  className,
  children,
}) => {
  const mobile = useSelector(state => state.view.mobile);
  const location = useLocation();
  const backPath = location.state?.backPath || backTo;

  return (
    <div className={clsx('relative flex-sc gap-3 mb-6', className)}>
      {!mobile && backPath && (
        <Link
          className="kbtn kbtn-ghost kbtn-lg kbtn-circle"
          to={backPath}
          aria-label="Back"
        >
          <Icon name="arrow-left" />
        </Link>
      )}
      {before}
      <span className="text-lg md:text-xl font-semibold">{title}</span>
      {after}
      {children}
    </div>
  );
};
