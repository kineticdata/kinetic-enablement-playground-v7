import { useSelector } from 'react-redux';
import { useCallback, useState } from 'react';
import { produce } from 'immer';
import { Panel } from '../../atoms/Panel.jsx';
import { Popover } from '../../atoms/Popover.jsx';
import { ChipButton } from '../../atoms/Button.jsx';
import t from 'prop-types';
import { StatusDot } from './StatusPill.jsx';
import { Icon } from '../../atoms/Icon.jsx';
import clsx from 'clsx';

export const TicketFilters = ({ type, filters, setFilters }) => {
  const mobile = useSelector(state => state.view.mobile);

  // Handler for changing individual filter values
  const handleFilterChange = useCallback(
    (name, property, value) => () => {
      setFilters(f =>
        produce(f, f => {
          f[name][property] = value;
        }),
      );
    },
    [setFilters],
  );
  // Temp filters to use while the panel/popover is open that we can then apply
  const [tempFilters, setTempFilters] = useState(filters);
  // Handler for changing individual temp filter values
  const handleTempFilterChange = useCallback(
    (name, property, value) => () => {
      setTempFilters(f =>
        produce(f, f => {
          f[name][property] = value;
        }),
      );
    },
    [],
  );
  // Handler to reset all filters to false so we show all records
  const handleTempFilterClearAll = useCallback(() => {
    setTempFilters(f =>
      produce(f, f => {
        Object.keys(f).forEach(name =>
          Object.keys(f[name]).forEach(property => {
            f[name][property] = false;
          }),
        );
      }),
    );
  }, []);
  // Handler for applying the temp filters from the popover/panel
  const handleApplyTempFilters = useCallback(() => {
    setFilters(tempFilters);
    setOpen(false);
  }, [setFilters, tempFilters]);

  // Open state for the filters popover/panel
  const [open, setOpen] = useState(false);
  // Handler for changing of the popover/panel open state
  const handleOnOpenChange = useCallback(
    ({ open }) => {
      // Reset the temp filters with the latest values
      setTempFilters(filters);
      setOpen(open);
    },
    [filters],
  );

  // Is an assignment filter value set
  const hasAssignment = Object.values(filters.assignment || {}).some(v => v);
  // Is a status filter value set
  const hasStatus = Object.values(filters.status || {}).some(v => v);
  // Are all filter values unset
  const hasNone = !hasAssignment && !hasStatus;
  // Are all temp filter values unset
  const hasNoneTemp =
    !Object.values(tempFilters.assignment || {}).some(v => v) &&
    !Object.values(tempFilters.status || {}).some(v => v);

  // Select a component to use for showing the filters based on the screen size
  const FilterComponent = mobile ? Panel : Popover;

  return (
    <div className="flex-bc gap-2 md:gap-5 items-center ml-auto">
      {!hasNone && (
        <div className="flex-ec gap-2 md:gap-4 flex-wrap">
          {hasAssignment && (
            <div className="flex-ec flex-wrap gap-x-2 gap-y-1">
              <span className="text-sm font-medium">Assigned to</span>
              {filters.assignment.mine && (
                <ChipButton
                  active={true}
                  icon="x"
                  onClick={handleFilterChange('assignment', 'mine', false)}
                >
                  Me
                </ChipButton>
              )}
              {filters.assignment.teams && (
                <ChipButton
                  active={true}
                  icon="x"
                  onClick={handleFilterChange('assignment', 'teams', false)}
                >
                  My teams
                </ChipButton>
              )}
            </div>
          )}
          {hasStatus && (
            <div className="flex-ec flex-wrap gap-x-2 gap-y-1">
              <span className="text-sm font-medium">Status</span>
              {filters.status.open && (
                <ChipButton
                  active={true}
                  icon="x"
                  onClick={handleFilterChange('status', 'open', false)}
                >
                  Open
                  <StatusDot status="Open" />
                </ChipButton>
              )}
              {filters.status.closed && (
                <ChipButton
                  active={true}
                  icon="x"
                  onClick={handleFilterChange('status', 'closed', false)}
                >
                  Closed
                  <StatusDot status="Closed" />
                </ChipButton>
              )}
              {filters.status.draft && (
                <ChipButton
                  active={true}
                  icon="x"
                  onClick={handleFilterChange('status', 'draft', false)}
                >
                  Draft
                  <StatusDot status="Draft" />
                </ChipButton>
              )}
            </div>
          )}
        </div>
      )}

      <FilterComponent
        open={open}
        onOpenChange={handleOnOpenChange}
        alignment={!mobile ? 'end' : undefined}
      >
        <button
          type="button"
          className={clsx('kbtn', {
            'kbtn-circle': !hasNone,
            'kbtn-lg': !mobile,
          })}
          slot="trigger"
        >
          {hasNone && `All ${type}`}
          <Icon name={hasNone ? 'chevron-down' : 'filter'} />
        </button>
        <div slot="content" className="flex-c-st gap-6">
          <div className="flex-bc gap-3">
            <span className="h3">Filter</span>
            <button
              className="kbtn kbtn-sm kbtn-circle kbtn-ghost absolute right-2 top-2"
              onClick={() => setOpen(false)}
            >
              <Icon name="x" size={20} />
            </button>
          </div>

          <div className="px-4 pt-1 pb-3 flex-c-st gap-4 border-b border-base-300">
            <div className="flex gap-5 flex-wrap">
              <ChipButton
                active={hasNoneTemp}
                icon={hasNoneTemp ? 'check' : null}
                onClick={handleTempFilterClearAll}
                disabled={hasNoneTemp}
                className="disabled:text-base-content"
              >
                All {type}
              </ChipButton>
            </div>
          </div>

          {tempFilters.assignment && (
            <div className="px-4 pt-1 pb-3 flex-c-st gap-4 border-b border-base-300">
              <span className="font-medium">Assigned to</span>
              <div className="flex gap-5 flex-wrap">
                <ChipButton
                  active={tempFilters.assignment.mine}
                  icon={tempFilters.assignment.mine ? 'check' : null}
                  onClick={handleTempFilterChange(
                    'assignment',
                    'mine',
                    !tempFilters.assignment.mine,
                  )}
                >
                  Me
                </ChipButton>
                <ChipButton
                  active={tempFilters.assignment.teams}
                  icon={tempFilters.assignment.teams ? 'check' : null}
                  onClick={handleTempFilterChange(
                    'assignment',
                    'teams',
                    !tempFilters.assignment.teams,
                  )}
                >
                  My teams
                </ChipButton>
              </div>
            </div>
          )}

          {tempFilters.status && (
            <div className="px-4 pt-1 pb-3 flex-c-st gap-4">
              <span className="font-medium">Status</span>
              <div className="flex gap-5 flex-wrap">
                <ChipButton
                  active={tempFilters.status.open}
                  icon={tempFilters.status.open ? 'check' : null}
                  onClick={handleTempFilterChange(
                    'status',
                    'open',
                    !tempFilters.status.open,
                  )}
                >
                  Open
                  <StatusDot status="Open" />
                </ChipButton>
                <ChipButton
                  active={tempFilters.status.closed}
                  icon={tempFilters.status.closed ? 'check' : null}
                  onClick={handleTempFilterChange(
                    'status',
                    'closed',
                    !tempFilters.status.closed,
                  )}
                >
                  Closed
                  <StatusDot status="Closed" />
                </ChipButton>
                {typeof tempFilters.status.draft === 'boolean' && (
                  <ChipButton
                    active={tempFilters.status.draft}
                    icon={tempFilters.status.draft ? 'check' : null}
                    onClick={handleTempFilterChange(
                      'status',
                      'draft',
                      !tempFilters.status.draft,
                    )}
                  >
                    Draft
                    <StatusDot status="Draft" />
                  </ChipButton>
                )}
              </div>
            </div>
          )}

          <button
            type="button"
            className="kbtn kbtn-primary mt-auto"
            onClick={handleApplyTempFilters}
          >
            Show Results
          </button>
        </div>
      </FilterComponent>
    </div>
  );
};

TicketFilters.propTypes = {
  type: t.oneOf(['actions', 'requests']).isRequired,
  filters: t.object.isRequired,
  setFilters: t.func.isRequired,
};
