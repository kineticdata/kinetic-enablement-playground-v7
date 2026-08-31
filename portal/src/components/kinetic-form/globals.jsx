// Below is an example of exposing a library globally so that it can be used in
// the content of a Kinetic Core form. The library itself will determine
// somewhat how this happens, for example some like the one shown below return
// something that you have to manually add to 'window'. Some libraries might add
// themselves to the window when loaded or some might decorate something else,
// like a jQuery plugin.

import jquery from 'jquery';
import moment from 'moment';
import { format } from 'date-fns';
import { utc } from '@date-fns/utc';

jquery.ajaxSetup({
  xhrFields: {
    withCredentials: true,
  },
});

window.$ = jquery;
window.jQuery = jquery;
window.moment = moment;

// Import widgets so they're available when compiling
import './widgets/widgets.js';

window.bundle = window.bundle || {};
window.bundle.config = window.bundle.config || {};
window.bundle.config.fields = {
  date: { render: renderDateTimePickers },
  datetime: { render: renderDateTimePickers },
  time: { render: renderDateTimePickers },
};

function renderDateTimePickers(field, trigger) {
  const isDateTime = field.type() === 'datetime';
  const toElementValue = isDateTime ? formatToIso : v => v;
  const toPickerValue = isDateTime ? formatFromIso : v => v;

  // Get input element
  const element = field.element()?.[0];
  // Clone input element
  const picker = element.cloneNode();
  // Remove id from the original element and hide it
  element.removeAttribute('id');
  element.style.display = 'none';
  // Remove name from the picker element since it's only used for display
  picker.removeAttribute('name');
  // Remove the data-element-type attribute from the picker so there's only one
  picker.removeAttribute('data-element-type');
  // Set the type of the picker element
  picker.setAttribute('type', isDateTime ? 'datetime-local' : field.type());
  // Set picker value
  picker.value = toPickerValue(element.value);

  // Use keydown and keyup events to track when the field is interacted with
  // via the keyboard so we can delay the change event until blur
  picker.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== 'Space') picker.isTyping = true;
  });
  picker.addEventListener('keyup', function () {
    picker.isTyping = false;
  });
  // Add change event to picker that updates the field value and triggers the
  // change events, but only when the picker value is not being changed via
  // keyboard interactions with the value itself
  picker.addEventListener('change', function (e) {
    if (!picker.isTyping) {
      const newElementValue = toElementValue(e.target.value);
      if (element.value !== newElementValue) {
        element.value = newElementValue;
        trigger();
      }
    }
  });
  // Add blur event to picker that updates the field value and triggers the
  // change events. This is used to delay updating the field value until the
  // user is done "typing" in a value.
  picker.addEventListener('blur', function (e) {
    const newElementValue = toElementValue(e.target.value);
    if (element.value !== newElementValue) {
      element.value = newElementValue;
      trigger();
    }
  });

  // Add change event to field to sync the picker if the field is updated via
  // its api
  field.on('change', function ({ newValue }) {
    const newPickerValue = toPickerValue(newValue);
    if (picker.value !== newPickerValue) {
      picker.value = newPickerValue;
    }
  });

  // Append the picker after the element
  element.after(picker);

  // Update enable and disable function to also affect the picker
  const originalEnable = field.enable;
  const originalDisable = field.disable;
  field.enable = function () {
    originalEnable();
    picker.removeAttribute('disabled');
  };
  field.disable = function () {
    originalDisable();
    picker.setAttribute('disabled', 'disabled');
  };
}

function formatToIso(value) {
  return value ? format(value, "yyyy-MM-dd'T'HH:mm:ssxxx", { in: utc }) : value;
}

function formatFromIso(value) {
  return value ? format(value, "yyyy-MM-dd'T'HH:mm") : value;
}
