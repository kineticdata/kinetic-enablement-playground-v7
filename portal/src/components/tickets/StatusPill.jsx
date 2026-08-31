import clsx from 'clsx';
import t from 'prop-types';

export const StatusPill = ({ className, status }) => {
  const visibleStatus = status === 'Submitted' ? 'Open' : status;
  return (
    <div className={clsx('flex-sc gap-2 font-light', className)}>
      {visibleStatus}
      <StatusDot status={status} />
    </div>
  );
};

StatusPill.propTypes = {
  status: t.oneOf([
    'Open',
    'Closed',
    'Draft',
    'Submitted',
    'Success',
    'Failure',
    'None',
  ]),
};

export const StatusDot = ({ status }) => (
  <div
    className={clsx('kstatus shadow-sm mb-2.5', {
      'kstatus-info': status === 'Draft',
      'kstatus-success':
        status === 'Submitted' || status === 'Open' || status === 'Success',
      'kstatus-warning': status === 'Failure',
      'bg-base-300': status === 'Closed' || status === 'None',
    })}
  />
);

StatusDot.propTypes = {
  status: t.oneOf([
    'Open',
    'Closed',
    'Draft',
    'Submitted',
    'Success',
    'Failure',
    'None',
  ]),
};
