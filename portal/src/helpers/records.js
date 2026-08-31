/******************************************************************************
 * Helper functions for dealing with kinetic data
 ******************************************************************************/

/**
 * Retrieves a single attribute value from a given record
 *
 * @param {Object} record A kinetic record that may contain attributes
 * @param {string} attributeName The name of the attribute to retrieve
 * @param {string} [defaultValue] The default value to return if the attribute
 *  is not found or doesn't have a value.
 * @returns {string} The value of the attribute, returning the first one if
 *  there are multiple, or the `defaultValue` if no value is found.
 */
export const getAttributeValue = (record, attributeName, defaultValue) =>
  (record &&
    (record.attributesMap
      ? record.attributesMap?.[attributeName]?.[0]
      : record.attributes?.find(attribute => attribute.name === attributeName)
          ?.values?.[0])) ||
  defaultValue;
