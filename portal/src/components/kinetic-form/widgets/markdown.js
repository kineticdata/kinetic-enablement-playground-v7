import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import t from 'prop-types';
import { Editor, Viewer } from '@toast-ui/react-editor';
import clsx from 'clsx';
import {
  registerWidget,
  validateContainer,
  validateField,
  WidgetAPI,
} from './index.js';

/**
 * @param {MarkdownWidgetConfig} props
 * @param {Object} props.field Kinetic field object
 */
const MarkdownComponent = forwardRef(
  ({ className, disabled, content, field, editorProps }, ref) => {
    const editorRef = useRef();

    // Function to get the value from the Kinetic field
    const getValue = useCallback(
      () => (field ? field.value() : content),
      [field, content],
    );
    // Function to update the value externally
    const setValue = useCallback(
      v => editorRef.current?.getInstance().setMarkdown(v),
      [],
    );

    // State for disabled state of the editor
    const [isDisabled, setIsDisabled] = useState(
      disabled ?? (!field || field.form().reviewMode()),
    );

    // Change handler for the editor to have it update the Kinetic field
    const handleChange = () => {
      if (field) field.value(editorRef.current.getInstance().getMarkdown());
    };

    // Define API ref
    const api = useRef({
      enable: field ? () => setIsDisabled(false) : undefined,
      disable: field ? () => setIsDisabled(true) : undefined,
      getValue,
      setValue,
    });
    // Update API ref when its contents change
    useEffect(() => {
      Object.assign(api.current, { getValue });
    }, [getValue]);

    return (
      <WidgetAPI ref={ref} api={api.current}>
        <div
          className={clsx(className, 'w-full', {
            'markdown-editor': !isDisabled,
            'markdown-viewer': !!isDisabled,
          })}
        >
          {!isDisabled ? (
            <Editor
              height="auto"
              initialEditType="wysiwyg"
              {...editorProps}
              ref={editorRef}
              initialValue={getValue() || ''}
              onChange={handleChange}
            />
          ) : (
            <Viewer
              height="auto"
              linkAttribute={{
                target: '_blank',
                contenteditable: 'false',
                rel: 'noopener noreferrer',
              }}
              initialValue={getValue() || ''}
            />
          )}
        </div>
      </WidgetAPI>
    );
  },
);

MarkdownComponent.propTypes = {
  className: t.string,
  disabled: t.bool,
  content: t.string,
  field: t.object,
  editorProps: t.object,
};

/**
 * Additional validations to be performed on the configurations of this widget.
 */
const validateConfig = (field, config) => {
  let valid = true;

  // Field must be a text field with 2+ rows so it's a textarea to properly
  // save the whitespace of markdown
  if (field) {
    valid = !!validateField(field, 'text', 'Markdown');
    if (valid && field?.element()?.[0]?.tagName !== 'TEXTAREA') {
      console.error(
        'Markdown Widget Error: The field parameter must be a Kinetic field of type "text" with 2 or more rows.',
      );
      valid = false;
    }
  } else {
    if (typeof config.content !== 'string') {
      console.error(
        'Markdown Widget Error: The `content` property must be provided if a Kinetic field is not used.',
      );
      valid = false;
    }
  }

  return valid;
};

/**
 * Function that initializes a Markdown widget. This function validates the
 * provided parameters, and then registers the widget, which will create an
 * instance of the widget and render it into the provided container.
 *
 * @param {HTMLElement} container HTML Element into which to render the widget.
 * @param {Object} field Kinetic text field with 2 or more rows.
 * @param {MarkdownWidgetConfig} config Configuration object for the widget.
 * @param {string} [id] Optional id that can be used to retrieve a reference to
 *  the widget's API functions using the `Markdown.get` function.
 */
export const Markdown = ({ container, field, config, id } = {}) => {
  if (
    validateContainer(container, 'Markdown') &&
    validateConfig(field, config)
  ) {
    return registerWidget(Markdown, {
      container,
      Component: MarkdownComponent,
      props: { ...config, field },
      id,
    });
  }
  return Promise.reject(
    'The Markdown widget parameters are invalid. See the console for more details.',
  );
};

/**
 * @typedef {Object} MarkdownWidgetConfig
 * @property {string} [className] Classes to add to the widget wrapper.
 * @property {boolean} [content] Content to render when a field isn't provided.
 * @property {boolean} [disabled] Should the markdown editor be disabled.
 *  If omitted, will use the reviewMode of the form to determine.
 * @property {Object} [editorProps] Object of props to pass through to the
 *  editor component. See the @toast-ui/react-editor Editor component for valid
 *  options.
 */
