import t from 'prop-types';
import { Link } from 'react-router-dom';
import { Menu as ArkMenu } from '@ark-ui/react/menu';
import { calcPlacement, getChildSlots } from '../helpers/atoms.js';
import { Icon } from './Icon.jsx';
import clsx from 'clsx';

const itemStyle =
  'flex gap-1 items-center py-1.5 px-4 min-w-full hover:bg-base-200 data-[highlighted]:bg-base-200';

/**
 * Renderer for a button menu item.
 */
const ButtonItem = ({ label, onClick, icon }) => (
  <ArkMenu.Item value={label} asChild tabIndex={-1}>
    <button type="button" onClick={onClick} className={clsx(itemStyle)}>
      {icon && <Icon name={icon} size={20}></Icon>}
      {label}
    </button>
  </ArkMenu.Item>
);

/**
 * Renderer for a link manu item, which can be relative (internal) or absolute
 * (external).
 */
const LinkItem = ({ label, to, href, icon, target }) => (
  <ArkMenu.Item value={label} asChild>
    {href || to.startsWith('http') ? (
      <a
        href={href || to}
        target={target}
        className={clsx(itemStyle)}
        tabIndex={-1}
      >
        {icon && <Icon name={icon} size={20}></Icon>}
        {label}
      </a>
    ) : (
      <Link to={to} className={clsx(itemStyle)} tabIndex={-1}>
        {icon && <Icon name={icon} size={20}></Icon>}
        {label}
      </Link>
    )}
  </ArkMenu.Item>
);

/**
 * Renderer for a divider menu item.
 */
const DividerItem = () => (
  <ArkMenu.Separator className="my-2 border-base-300" />
);

/**
 * Renderer for a group menu item, which renders a header with items below it.
 */
const GroupItem = ({ label, children = [] }) => {
  return (
    <ArkMenu.ItemGroup>
      <ArkMenu.ItemGroupLabel className="flex gap-1 items-center py-1.5 px-4 min-w-full font-medium">
        {label}
      </ArkMenu.ItemGroupLabel>
      <Items items={children} />
    </ArkMenu.ItemGroup>
  );
};

/**
 * Renders a list of items, selecting the correct renderer for each.
 */
const Items = ({ items = [] }) =>
  items.map((item, index) => {
    if (item.type === 'group') {
      return <GroupItem {...item} key={`group-${index}`} />;
    } else if (item.type === 'divider') {
      return <DividerItem key={`divider-${index}`} />;
    } else if (typeof item.onClick === 'function') {
      return <ButtonItem {...item} key={`button-${index}`} />;
    } else if (typeof item.to === 'string' || typeof item.href === 'string') {
      return <LinkItem {...item} key={`link-${index}`} />;
    } else {
      return null;
    }
  });

/**
 * @typedef {Object} MenuItem An object defining the properties of a menu item.
 *  The `type`, `onClick`, and `to` properties are mutually exclusive and are
 *  used to determine the type of menu item to render.
 * @property {string} [label] Text label of the menu item.
 * @property {string} [icon] Icon name for the menu item.
 * @property {('group'|'divider')} [type] Type of special menu item.
 * @property {Function} [onClick] Click handler for button menu items. Used when
 *  `type` is not provided.
 * @property {string} [to] Path for link menu items. Can be relative or
 *  absolute. Used when `type` and `onClick` are not provided.
 * @property {string} [target] Target attribute for anchor tag for link menu
 *  items.
 */

/**
 * A dropdown menu of actionable items.
 *
 * @param {Object} props Props object
 * @param {MenuItem[]} props.items A list of items to render in the menu.
 * @param {boolean} [props.open] Is the menu open.
 *  When provided, the component will be set to controlled mode, and this flag
 *  will be used to determine if it's open or not. If omitted, the component
 *  will be set to uncontrolled mode.
 * @param {Function} [props.onOpenChange] If the component is controlled, this
 *  function is triggered when the open state should be changed, and it should
 *  modify the `open` prop. If the component is uncontrolled, this function is
 *  a callback that is triggered whenever the open state changes.
 *  The function is passed one parameter, which is an object with an `open`
 *  property defining what the new state of the component is or should be.
 * @param {('bottom'|'top'|'left'|'right')} [props.position=bottom] The position
 *  of the menu relative to the trigger.
 * @param {('start'|'middle'|'end')} [props.alignment=start] The alignment of
 *  the menu relative to the trigger.
 * @param {JSX.Element|JSX.Element[]} [props.children] Elements to inject into
 *  available slots in the menu. Available slots are:
 *  - trigger: Component that toggles the menu open state when interacted with.
 */
export const Menu = ({
  items,
  open,
  onOpenChange,
  position,
  alignment,
  children,
}) => {
  const slots = getChildSlots(children, {
    componentName: 'Menu',
    requiredSlots: [],
    optionalSlots: ['trigger'],
  });
  const placement = calcPlacement(position, alignment);

  return (
    <ArkMenu.Root
      open={open}
      onOpenChange={onOpenChange}
      positioning={{ placement }}
    >
      {slots.trigger && (
        <ArkMenu.Trigger asChild>{slots.trigger}</ArkMenu.Trigger>
      )}
      <ArkMenu.Positioner>
        <ArkMenu.Content className="py-3 bg-base-100 border border-base-300 rounded-box min-w-[10rem] outline-0 shadow-lg z-30">
          <Items items={items} />
        </ArkMenu.Content>
      </ArkMenu.Positioner>
    </ArkMenu.Root>
  );
};

const itemType = {
  label: t.oneOfType([t.string, t.node]),
  icon: t.string,
  onClick: t.func,
  to: t.string,
  target: t.string,
  type: t.oneOf(['group', 'divider']),
};
itemType.children = t.arrayOf(t.shape(itemType));

ButtonItem.propTypes = {
  label: itemType.label,
  icon: itemType.icon,
  onClick: itemType.onClick,
};

LinkItem.propTypes = {
  label: itemType.label,
  icon: itemType.icon,
  to: itemType.to,
  target: itemType.target,
};

DividerItem.propTypes = {
  type: t.oneOf(['divider']),
};

GroupItem.propTypes = {
  type: t.oneOf(['group']),
  label: itemType.label,
  children: itemType.children,
};

Menu.propTypes = {
  items: t.arrayOf(t.shape(itemType)),
  open: t.bool,
  onOpenChange: t.func,
  position: t.oneOf(['bottom', 'top', 'left', 'right']),
  alignment: t.oneOf(['start', 'middle', 'end']),
  children: t.node,
};
