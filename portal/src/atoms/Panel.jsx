import t from 'prop-types';
import { useRef } from 'react';
import { Dialog } from '@ark-ui/react/dialog';
import { Portal } from '@ark-ui/react/portal';
import { getChildSlots } from '../helpers/atoms.js';

/**
 * A panel that opens in the designated panel container.
 *
 * @param {Object} props Props object
 * @param {boolean} [props.open] Is the panel open.
 *  When provided, the component will be set to controlled mode, and this flag
 *  will be used to determine if it's open or not. If omitted, the component
 *  will be set to uncontrolled mode.
 * @param {Function} [props.onOpenChange] If the component is controlled, this
 *  function is triggered when the open state should be changed, and it should
 *  modify the `open` prop. If the component is uncontrolled, this function is
 *  a callback that is triggered whenever the open state changes.
 *  The function is passed one parameter, which is an object with an `open`
 *  property defining what the new state of the component is or should be.
 * @param {Function} [props.onExitComplete] Function to call after the panel
 *  finishes closing.
 * @param {boolean} [props.closeOnEscape=true] Should the panel close when the
 *  escape key is pressed.
 * @param {boolean} [props.closeOnInteractOutside=true] Should the panel close
 *  when the user interacts with the area outside the panel.
 * @param {JSX.Element|JSX.Element[]} [props.children] Elements to inject into
 *  available slots in the panel. Available slots are:
 *  - trigger: Component that toggles the panel open state when interacted with.
 *  - content: Main content of the panel.
 */
export const Panel = ({
  open,
  onOpenChange,
  onExitComplete,
  closeOnEscape,
  closeOnInteractOutside,
  children,
}) => {
  const ref = useRef(document.getElementById('app-panels'));

  const slots = getChildSlots(children, {
    componentName: 'Panel',
    requiredSlots: ['content'],
    optionalSlots: ['trigger'],
  });

  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
      onExitComplete={onExitComplete}
      closeOnEscape={closeOnEscape}
      closeOnInteractOutside={closeOnInteractOutside}
      lazyMount
      unmountOnExit
    >
      {slots.trigger && (
        <Dialog.Trigger asChild>{slots.trigger}</Dialog.Trigger>
      )}
      <Portal container={ref}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            className="relative p-6 md:py-8 md:px-10 bg-base-100 overflow-auto scrollbar-white z-30"
            asChild
          >
            {slots.content}
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

Panel.propTypes = {
  open: t.bool,
  onOpenChange: t.func,
  onExitComplete: t.func,
  closeOnEscape: t.bool,
  closeOnInteractOutside: t.bool,
  children: t.node,
};
