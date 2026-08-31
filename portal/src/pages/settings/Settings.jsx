import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { updateSpace } from '@kineticdata/react';
import { Icon } from '../../atoms/Icon.jsx';
import { Menu } from '../../atoms/Menu.jsx';
import { Loading } from '../../components/states/Loading.jsx';
import { PageHeading } from '../../components/PageHeading.jsx';
import { openConfirm } from '../../helpers/confirm.js';
import { getAttributeValue } from '../../helpers/records.js';
import { appActions } from '../../helpers/state.js';
import { toastError, toastSuccess } from '../../helpers/toasts.js';

export const SettingsCard = ({
  icon = 'settings',
  to,
  state,
  label,
  description,
}) => {
  const mobile = useSelector(state => state.view.mobile);
  return (
    <Link
      to={to}
      state={state}
      className={clsx(
        // Non mobile styles
        'md:col-start-1 md:col-end-5 md:grid md:grid-cols-[subgrid]',
        // Common styles
        'group relative',
      )}
    >
      <div
        className={clsx(
          // Mobile first styles
          'flex py-1.25 px-3',
          // Non mobile styles
          'md:col-start-1 md:col-end-5 md:grid md:grid-cols-[subgrid] md:py-2.75 md:px-6',
          // Common styles
          'group relative gap-3 items-center min-h-16 rounded-box bg-base-100 border transition',
          'hover:bg-base-200 focus-within:bg-base-200',
        )}
      >
        <div className="icon-box flex-none">
          <Icon name={icon} />
        </div>
        {mobile ? (
          <div className="flex flex-col gap-1 min-w-0">
            <div className="font-medium leading-4 line-clamp-2">{label}</div>
            <div className="text-gray-900 text-xs line-clamp-2">
              {description}
            </div>
          </div>
        ) : (
          <>
            <div className="font-medium leading-5 line-clamp-2">{label}</div>
            <div className="text-gray-900 line-clamp-2">{description}</div>
          </>
        )}
      </div>
    </Link>
  );
};

export const Settings = ({ settings }) => {
  const mobile = useSelector(state => state.view.mobile);
  const { profile, space } = useSelector(state => state.app);
  const portalKappSlug = getAttributeValue(
    space,
    'Service Portal Kapp Slug',
    'service-portal',
  );

  return (
    <div className="max-w-screen-lg pt-1 pb-6">
      <PageHeading title="Settings" backTo="/">
        {profile?.spaceAdmin && (space?.kapps || []).length > 1 && (
          <Menu
            alignment="end"
            items={[
              {
                type: 'group',
                label: 'Select Portal Kapp',
                children: (space?.kapps || []).map(k => ({
                  label: (
                    <>
                      {k.name}
                      {k.slug === portalKappSlug && (
                        <span className="ml-2 kbadge kbadge-neutral kbadge-sm">
                          Current
                        </span>
                      )}
                    </>
                  ),
                  onClick: () => {
                    if (portalKappSlug !== k.slug) {
                      openConfirm({
                        title: 'Change Portal Kapp',
                        description: `Are you sure you want to change the portal kapp to ${k.name}?`,
                        acceptLabel: 'Yes',
                        accept: () => {
                          updateSpace({
                            space: {
                              attributesMap: {
                                'Service Portal Kapp Slug': [k.slug],
                              },
                            },
                            include: 'attributesMap,kapps',
                          }).then(({ error, space }) => {
                            if (error) {
                              toastError({
                                title: 'Failed to update portal kapp',
                                description: error.message,
                              });
                            } else {
                              toastSuccess({
                                title: 'Successfully updated portal kapp',
                              });
                              appActions.setSpace({ space });
                            }
                          });
                        },
                      });
                    }
                  },
                })),
              },
            ]}
          >
            <button
              slot="trigger"
              type="button"
              className="ml-auto kbtn kbtn-lg"
            >
              Change Kapp
            </button>
          </Menu>
        )}
      </PageHeading>

      <div className="flex flex-col gap-4 mb-4 md:mb-6 md:grid md:grid-cols-[auto_auto_1fr]">
        {!settings ? (
          mobile ? (
            <Loading xsmall size={36} />
          ) : (
            <Loading className="col-start-1 col-end-5" />
          )
        ) : (
          settings.map(link => <SettingsCard key={link.to} {...link} />)
        )}
      </div>
    </div>
  );
};
