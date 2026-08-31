import { useEffect, useState } from 'react';
import { ColorPicker, parseColor } from '@ark-ui/react/color-picker';
import clsx from 'clsx';
import { callIfFn } from '../helpers/index.js';
import { calcPlacement } from '../helpers/atoms.js';
import { Icon } from './Icon.jsx';

export const ColorField = ({
  value,
  onChange,
  position,
  alignment,
  ...props
}) => {
  const placement = calcPlacement(position, alignment);
  const [color, setColor] = useState(parseColor(value || '#ffffff'));

  useEffect(() => {
    callIfFn(onChange, null, [color.toString('hex')]);
  }, [color, onChange]);

  return (
    <div className="field">
      <ColorPicker.Root
        {...props}
        onValueChange={e => setColor(e.value)}
        defaultValue={parseColor(value || '#ffffff')}
        positioning={{ placement }}
      >
        <ColorPicker.Control className={clsx('relative')}>
          <ColorPicker.ChannelInput channel="hex" className={clsx('!pl-12')} />
          <ColorPicker.Trigger
            className={clsx('!absolute top-0 left-0 m-1.25 z-1')}
          >
            <ColorPicker.ValueSwatch
              className={clsx('block p-4 border-1 rounded-full')}
            />
          </ColorPicker.Trigger>
        </ColorPicker.Control>
        <ColorPicker.Positioner>
          <ColorPicker.Content
            tabIndex={-1}
            className="p-4 bg-base-100 border border-base-300 rounded-sm min-w-[18rem] shadow-lg z-30"
          >
            <div className="flex flex-col gap-4">
              <ColorPicker.Area className="w-full h-32">
                <ColorPicker.AreaBackground className="h-full rounded" />
                <ColorPicker.AreaThumb className="w-3 h-3 rounded-full border-2 border-white" />
              </ColorPicker.Area>
              <ColorPicker.ChannelSlider channel="hue">
                <ColorPicker.ChannelSliderTrack className="w-full h-3 rounded-full" />
                <ColorPicker.ChannelSliderThumb className="w-3 h-3 rounded-full border-2 border-white !top-0" />
              </ColorPicker.ChannelSlider>
              <ColorPicker.View format="rgba" className={clsx('flex gap-4')}>
                <ColorPicker.ChannelInput
                  channel="hex"
                  className={clsx('shrink !w-1 flex-1')}
                />
                <ColorPicker.EyeDropperTrigger asChild>
                  <button type="button" className="kbtn kbtn-lg kbtn-outline">
                    <Icon name="color-picker" />
                  </button>
                </ColorPicker.EyeDropperTrigger>
              </ColorPicker.View>
            </div>
          </ColorPicker.Content>
        </ColorPicker.Positioner>
        <ColorPicker.HiddenInput />
      </ColorPicker.Root>
    </div>
  );
};
