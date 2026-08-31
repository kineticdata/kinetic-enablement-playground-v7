import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import clsx from 'clsx';
import t from 'prop-types';
import { CoreForm, generateKey, KineticLib } from '@kineticdata/react';
import { registerWidget, validateContainer, WidgetAPI } from './index.js';
import { Modal } from '../../../atoms/Modal.jsx';
import { getChildSlots } from '../../../helpers/atoms.js';
import { asArray, callIfFn } from '../../../helpers/index.js';
import { Loading as Pending } from '../../states/Loading.jsx';

// Asynchronously import the global dependencies that are used in the embedded
// forms. Note that we deliberately do this as a const so that it should start
// immediately without making the initial application load wait, but the
// CoreForm component will wait for this to be loaded.
const globals = import('../globals.jsx');

const SubformLayout = ({
  inline,
  title,
  modalSize,
  toasterId,
  destroy,
  children,
}) => {
  const slots = getChildSlots(children, {
    componentName: 'SubformLayout',
    requiredSlots: ['content'],
    optionalSlots: ['save', 'errors'],
  });

  return inline ? (
    <div className="flex flex-col items-stretch gap-5 w-full">
      {slots.errors}
      {slots.content}
      {slots.save}
    </div>
  ) : (
    <Modal
      open={true}
      onOpenChange={({ open }) => !open && destroy()}
      title={title}
      size={modalSize}
      toasterId={toasterId}
    >
      <div slot="body">
        {slots.errors}
        {slots.content}
      </div>
      <div slot="footer">{slots.save}</div>
    </Modal>
  );
};

SubformLayout.propTypes = {
  inline: t.bool,
  title: t.string,
  formFn: t.object,
  toasterId: t.string,
  destroy: t.func,
  children: t.node,
};

/**
 * @param {SubformWidgetConfig} props
 */
const SubformComponent = forwardRef((props, ref) =>
  !props.fields ? (
    <KineticSubformComponent {...props} ref={ref}></KineticSubformComponent>
  ) : (
    <CustomSubformComponent {...props} ref={ref}></CustomSubformComponent>
  ),
);

SubformComponent.propTypes = {
  fields: t.arrayOf(
    t.shape({
      label: t.string,
      property: t.string.isRequired,
      type: t.oneOf(['text', 'checkbox', 'date', 'datetime', 'time']),
      defaultValue: t.any,
      required: t.bool,
      disabled: t.bool,
      validate: t.func,
    }),
  ),
  kappSlug: t.string,
  formSlug: t.string,
  submissionId: t.string,
  values: t.object,
  disabled: t.bool,
  onLoad: t.func,
  onSave: t.func,
  onError: t.func,
  inline: t.bool,
  modalTitle: t.string,
  modalSize: t.string,
  saveLabel: t.string,
  destroy: t.func,
};

const KineticSubformComponent = forwardRef(
  (
    {
      kappSlug,
      formSlug,
      submissionId,
      values,
      disabled,
      onLoad,
      onSave,
      onError,
      inline,
      modalTitle,
      modalSize,
      saveLabel = 'Save',
      destroy,
    },
    ref,
  ) => {
    // Id used for the modal toaster element so we can render toasts in the
    // modal if needed
    const toasterId = useMemo(
      () => (!inline ? generateKey() : undefined),
      [inline],
    );

    // State for tracking if the subform was loaded and its api is ready
    const [ready, setReady] = useState(false);
    const [errors, setErrors] = useState([]);
    // Ref to store the kinetic form object
    const kFormRef = useRef(null);
    // API function for getting the kinetic form object for the subform
    const kForm = useCallback(() => {
      if (kFormRef.current) return kFormRef.current;
      console.log(
        "Subform Widget: The API function `kForm` isn't available until the form is fully loaded.",
      );
    }, []);

    // Loaded callback to set ready state and kFormRef value
    const loaded = useCallback(
      form => {
        setReady(!!form);
        kFormRef.current = form;
        callIfFn(onLoad, null, [{ kForm, destroy, toasterId }]);
      },
      [onLoad, kForm, destroy, toasterId],
    );

    // Error callback
    const error = useCallback(() => {
      callIfFn(onError, null, [{ destroy, toasterId }]);
    }, [onError, destroy, toasterId]);

    // Save callback
    const save = useCallback(() => {
      if (kFormRef.current) {
        const validation = Object.entries(kFormRef.current.validate());
        setErrors(validation);
        if (validation.length === 0) {
          const data = kFormRef.current.serialize();
          callIfFn(onSave, null, [
            data,
            {
              submit: kFormRef.current.submitPage,
              kForm,
              destroy,
              toasterId,
            },
          ]);
        }
      }
    }, [onSave, kForm, destroy, toasterId]);

    // API function for returning the current data object
    const getData = useCallback(() => {
      return kFormRef.current?.serialize();
    }, []);

    // Define API ref
    const api = useRef({ kForm, toasterId, data: getData });
    // Update API ref when its contents change
    useEffect(() => {
      Object.assign(api.current, { toasterId });
    }, [toasterId]);

    return (
      <WidgetAPI ref={ref} api={api.current}>
        <KineticLib globals={globals} locale="en">
          <SubformLayout
            inline={inline}
            title={modalTitle || kFormRef.current?.name() || 'Loading...'}
            modalSize={modalSize}
            toasterId={toasterId}
            destroy={destroy}
          >
            {errors?.length > 0 && (
              <div
                slot="errors"
                className="kalert kalert-error kalert-vertical w-full justify-start justify-items-start text-left gap-1 mb-5"
                role="alert"
                aria-live="assertive"
                tabIndex={0}
              >
                <p className="font-semibold">Errors</p>
                <ul>
                  {errors.map(([key, error]) => (
                    <li key={key}>{error.join('\n')}</li>
                  ))}
                </ul>
              </div>
            )}
            <CoreForm
              slot="content"
              submission={submissionId}
              kapp={kappSlug}
              form={formSlug}
              values={values}
              review={disabled}
              components={{ Pending }}
              onLoaded={loaded}
              onNotFound={error}
              onError={error}
            />
            {ready && !disabled && onSave && (
              <button
                slot="save"
                type="button"
                className="flex-1 kbtn kbtn-lg kbtn-primary"
                onClick={save}
              >
                {saveLabel}
              </button>
            )}
          </SubformLayout>
        </KineticLib>
      </WidgetAPI>
    );
  },
);

const getDefaultValueForType = type => {
  switch (type) {
    case 'text':
    case 'date':
    case 'datetime':
    case 'time':
      return '';
    case 'checkbox':
      return false;
    default:
      return null;
  }
};

const Label = ({ label, id, required, children }) => (
  <label htmlFor={id}>
    {children}
    {label}
    {required && <em className="sr-only">Required</em>}
  </label>
);

const buildInputField =
  type =>
  ({ label, value, required, disabled, onChange }) => {
    const id = useMemo(() => generateKey(12), []);
    return (
      <div className={clsx('field', { required })}>
        <Label label={label} id={id} required={required} />
        <input
          type={type}
          id={id}
          value={value}
          onChange={e => onChange(e.target.value)}
          required={!!required}
          disabled={!!disabled}
        />
      </div>
    );
  };

const TextField = buildInputField('text');
const DateField = buildInputField('date');
const DateTimeField = buildInputField('datetime-local');
const TimeField = buildInputField('time');

const CheckboxField = ({ label, value, required, disabled, onChange }) => {
  const id = useMemo(() => generateKey(12), []);
  return (
    <div className={clsx('field', { required })}>
      <Label label={label} id={id} required={required}>
        <input
          type="checkbox"
          id={id}
          checked={value}
          onChange={e => onChange(e.target.checked)}
          required={!!required}
          disabled={!!disabled}
        />
      </Label>
    </div>
  );
};

const getFieldRendererForType = type => {
  switch (type) {
    case 'text':
      return TextField;
    case 'date':
      return DateField;
    case 'datetime':
      return DateTimeField;
    case 'time':
      return TimeField;
    case 'checkbox':
      return CheckboxField;
    default:
      return null;
  }
};

const CustomSubformComponent = forwardRef(
  (
    {
      fields,
      values,
      disabled,
      onLoad,
      onSave,
      inline,
      modalTitle,
      modalSize,
      saveLabel = 'Save',
      destroy,
    },
    ref,
  ) => {
    // Id used for the modal toaster element so we can render toasts in the
    // modal if needed
    const toasterId = useMemo(
      () => (!inline ? generateKey() : undefined),
      [inline],
    );

    const [data, setData] = useState(
      fields.reduce(
        (d, field) => ({
          ...d,
          [field.property]:
            values?.[field.property] ||
            (!values ? field.defaultValue : null) ||
            getDefaultValueForType(field.type),
        }),
        {},
      ),
    );
    const updateData = useCallback((property, value) => {
      setData(d => ({ ...d, [property]: value }));
    }, []);
    const [errors, setErrors] = useState([]);
    const dataRef = useRef(data);
    useEffect(() => {
      dataRef.current = data;
    }, [data]);

    // Loaded callback
    useEffect(() => {
      callIfFn(onLoad, null, [{ destroy, toasterId }]);
    }, [onLoad, destroy, toasterId]);

    // Save callback
    const save = useCallback(() => {
      const validation = Object.entries(
        fields.reduce((e, field) => {
          const value = data[field.property];
          if (field.required && !value) {
            return { ...e, [field.property]: [`${field.label} is required`] };
          }
          const invalid = callIfFn(field.validate, null, [value, data]);
          if (invalid && asArray(invalid).length > 0) {
            return { ...e, [field.property]: asArray(invalid) };
          }
          return e;
        }, {}),
      );
      setErrors(validation);
      if (validation.length === 0) {
        callIfFn(onSave, null, [data, { destroy, toasterId }]);
      }
    }, [onSave, data, fields, destroy, toasterId]);

    const getData = useCallback(() => {
      return dataRef.current;
    }, []);

    return (
      <WidgetAPI ref={ref} api={{ toasterId, data: getData }}>
        <SubformLayout
          inline={inline}
          title={modalTitle || 'Loading...'}
          modalSize={modalSize}
          toasterId={toasterId}
          destroy={destroy}
        >
          {errors?.length > 0 && (
            <div
              slot="errors"
              className="kalert kalert-error kalert-vertical w-full justify-start justify-items-start text-left gap-1 mb-5"
              role="alert"
              aria-live="assertive"
              tabIndex={0}
            >
              <p className="font-semibold">Errors</p>
              <ul>
                {errors.map(([key, error]) => (
                  <li key={key}>{error.join('\n')}</li>
                ))}
              </ul>
            </div>
          )}
          <div slot="content" className="flex flex-col gap-5">
            {fields.map(field => {
              const Field = getFieldRendererForType(field.type);
              return (
                Field && (
                  <Field
                    key={field.property}
                    disabled={disabled}
                    {...field}
                    value={data[field.property]}
                    onChange={value => updateData(field.property, value)}
                  />
                )
              );
            })}
          </div>
          {!disabled && onSave && (
            <button
              slot="save"
              type="button"
              className="flex-1 kbtn kbtn-lg kbtn-primary"
              onClick={save}
            >
              {saveLabel}
            </button>
          )}
        </SubformLayout>
      </WidgetAPI>
    );
  },
);

/**
 * Additional validations to be performed on the configurations of this widget.
 */
const validateConfig = config => {
  let valid = true;

  // Make sure either fields or form/submission data are provided
  if (
    !config.fields &&
    (!config.kappSlug || !config.formSlug) &&
    !config.submissionId
  ) {
    console.error(
      'Subform Widget Error: You must provide either a `kappSlug` + `formSlug` or a `submissionId` to render a Kinetic form, or a custom `fields` list to render a custom form.',
    );
    valid = false;
  }

  // Validate custom fields
  if (config.fields) {
    if (
      !Array.isArray(config.fields) ||
      config.fields.some(f => typeof f !== 'object') ||
      config.fields.length === 0
    ) {
      console.error(
        'Subform Widget Error: The `fields` property must be an array of objects and cannot be empty.',
      );
      valid = false;
    } else if (config.fields.some(f => !f.property)) {
      console.error(
        'Subform Widget Error: Each field in the `fields` property must define a `property`.',
      );
      valid = false;
    } else if (
      config.fields.reduce(
        ([rM, rF], f) =>
          rF ? [null, rF] : [{ ...rM, [f.property]: true }, rM[f.property]],
        [{}, false],
      )[1]
    ) {
      console.error(
        'Subform Widget Error: Each object in the `fields` property must have a unique `property` value.',
      );
      valid = false;
    }
  }

  return valid;
};

/**
 * Function that initializes a Subform widget. This function validates the
 * provided parameters, and then registers the widget, which will create an
 * instance of the widget and render it into the provided container.
 *
 * @param {HTMLElement} container HTML Element into which to render the widget.
 * @param {SubformWidgetConfig} config Configuration object for the widget.
 * @param {string} [id] Optional id that can be used to retrieve a reference to
 *  the widget's API functions using the `Subform.get` function.
 */
export const Subform = ({ container, config, id } = {}) => {
  if (validateContainer(container, 'Subform') && validateConfig(config)) {
    return registerWidget(Subform, {
      container,
      Component: SubformComponent,
      props: { ...config },
      id,
    });
  }
  return Promise.reject(
    'The Subform widget parameters are invalid. See the console for more details.',
  );
};

/**
 * @typedef {Object} SubformWidgetConfig
 * @property {CustomField[]} [fields] A list of custom field definitions to
 *  render as a form instead of using a Kinetic form.
 * @property {string} [kappSlug] The slug of the kapp in which the subform you
 *  want to render exists.
 * @property {string} [formSlug] The slug of the form you want to render.
 * @property {string} [submissionId] The submission id of the submission you
 *  want to render.
 * @property {Object} [values] Map of default field values to use for the form.
 * @property {boolean} [disabled] Should the form be rendered with disabled fields.
 * @property {Function} [onLoad] Function that's called when the subform is
 *  loaded.
 * @property {Function} [onSave] Function that's called when the save button of
 *  the widget is clicked. If omitted, the save button will not be rendered.
 * @property {Function} [onError] Function that's called when the subform fails
 *  to load.
 * @property {boolean} [inline] Should the form render inline instead of in a
 *  modal.
 * @property {string} [modalTitle] The title for the modal when the subform is
 *  rendered in a modal.
 * @property {string} [modalSize] The size of the modal.
 * @property {string} [saveLabel] The label for the save button.
 */

/**
 * @typedef {Object} CustomField
 * @property {string} [label] The label of the field.
 * @property {string} property The property name that this field's data will be
 *  stored under in the resulting data object.
 * @property {string} [type] The type of field to render.
 * @property {*} [defaultValue] The default value for the field, used if the
 *  values configuration is not provided.
 * @property {boolean} [required] Should the field be required. Defaults to
 *  false.
 * @property {boolean} [disabled] Should the field be disabled. Defaults to
 *  false.
 * @property {Function} [validate] Validation function for validating this
 *  field. it is passed the field value and full data object as parameters, and
 *  should return an array of error messages if the field is invalid.
 */
