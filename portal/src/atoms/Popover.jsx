import t from 'prop-types';
import { Popover as ArkPopover } from '@ark-ui/react/popover';
import { calcPlacement, getChildSlots } from '../helpers/atoms.js';

/**
 * An overlay that displays additional information or options when triggered.
 *
 * @param {Object} props Props object
 * @param {boolean} [props.open] Is the popover open.
 *  When provided, the component is controlled, using this flag to manage state.
 * @param {Function} [props.onOpenChange] Callback to handle open state changes.
 * @param {('bottom'|'top'|'left'|'right')} [props.position=bottom] Position of the popover relative to the trigger.
 * @param {('start'|'middle'|'end')} [props.alignment=start] Alignment of the popover relative to the trigger.
 * @param {JSX.Element|JSX.Element[]} [props.children] Elements to inject into
 *  - trigger: Component that toggles the popover.
 *  - content: Component that displays the popover content.
 */

export const Popover = ({
  open,
  onOpenChange,
  position,
  alignment,
  children,
}) => {
  const slots = getChildSlots(children, {
    componentName: 'Popover',
    requiredSlots: ['content'],
    optionalSlots: ['trigger'],
  });

  const placement = calcPlacement(position, alignment);

  return (
    <ArkPopover.Root
      open={open}
      onOpenChange={onOpenChange}
      positioning={{ placement }}
    >
      {slots.trigger && (
        <ArkPopover.Trigger asChild>{slots.trigger}</ArkPopover.Trigger>
      )}
      <ArkPopover.Positioner>
        <ArkPopover.Content className="relative p-6 bg-base-100 rounded-box shadow-2xl w-[30rem] max-w-[calc(100vw-2rem)] z-30">
          {slots.content}
        </ArkPopover.Content>
      </ArkPopover.Positioner>
    </ArkPopover.Root>
  );
};

Popover.propTypes = {
  open: t.bool,
  onOpenChange: t.func,
  position: t.oneOf(['bottom', 'top', 'left', 'right']),
  alignment: t.oneOf(['start', 'middle', 'end']),
  children: t.node,
};

Popover.CloseTrigger = ArkPopover.CloseTrigger;
