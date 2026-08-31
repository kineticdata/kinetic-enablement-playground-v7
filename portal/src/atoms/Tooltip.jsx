import t from 'prop-types';
import { Tooltip as ArkTooltip } from '@ark-ui/react/tooltip';
import { calcPlacement, getChildSlots } from '../helpers/atoms.js';

/**
 * A label that provides information on hover or focus.
 *
 * @param {Object} props Props object.
 * @param {string} [props.content] The content to display inside the tooltip.
 * @param {boolean} [props.interactive] Can the content of the tooltip be interacted with.
 * @param {('bottom'|'top'|'left'|'right')} [props.position=bottom] The position
 * of the tooltip relative to the trigger.
 * @param {('start'|'middle'|'end')} [props.alignment=start] The alignment of
 * the tooltip relative to the trigger.
 * @param {boolean} [props.open] Is the tooltip open.
 * @param {number} [props.openDelay=80] Delay before the tooltip opens.
 * @param {number} [props.closeDelay=0] Delay before the tooltip closes.
 * @param {boolean} [disabled] Is the tooltip disabled.
 * @param {JSX.Element|JSX.Element[]} [props.children] Elements to inject into
 *  available slots in the tooltip. Available slots are:
 * - trigger: Component that toggles the tooltip open state when interacted with.
 * - content: Optional slot to render JSX content instead of a string inside the tooltip.
 */

export const Tooltip = ({
  content,
  interactive,
  position,
  alignment,
  open,
  onOpenChange,
  openDelay = 80,
  closeDelay = 0,
  disabled,
  children,
}) => {
  const slots = getChildSlots(children, {
    componentName: 'Tooltip',
    requiredSlots: ['trigger'],
    optionalSlots: ['content'],
  });

  const placement = calcPlacement(position, alignment);

  return (
    <ArkTooltip.Root
      openDelay={openDelay}
      closeDelay={closeDelay}
      interactive={interactive}
      open={open}
      onOpenChange={onOpenChange}
      positioning={{ placement }}
      disabled={disabled}
    >
      {slots.trigger && (
        <ArkTooltip.Trigger asChild>{slots.trigger}</ArkTooltip.Trigger>
      )}
      <ArkTooltip.Positioner>
        <ArkTooltip.Content className="px-1 py-1.75 text-sm font-medium bg-neutral text-neutral-content rounded-lg max-w-96 shadow">
          {slots.content || content}
        </ArkTooltip.Content>
      </ArkTooltip.Positioner>
    </ArkTooltip.Root>
  );
};

Tooltip.propTypes = {
  content: t.string,
  interactive: t.bool,
  position: t.oneOf(['bottom', 'top', 'left', 'right']),
  alignment: t.oneOf(['start', 'middle', 'end']),
  open: t.bool,
  onOpenChange: t.func,
  openDelay: t.number,
  closeDelay: t.number,
  disabled: t.bool,
  children: t.node,
};
