import { JSONSchema7 } from "json-schema";
import * as yup from "yup";

import { WidgetConfigMap } from "core/form/types";
import { isDefined } from "utils/common";

/**
 * Returns yup.schema for validation
 *
 * This method builds yup schema based on jsonSchema ${@link JSONSchema7} and widgetConfig ${@link WidgetConfigMap}.
 * Every property is walked through recursively in case it is condition | object | array.
 *
 * uiConfig is used to select currently selected oneOf conditions to build proper schema
 * As uiConfig widget paths are .dot based (key1.innerModule1.innerModule2) propertyKey is provided recursively
 * @param jsonSchema
 * @param uiConfig uiConfig of widget currently selected in form
 * @param parentSchema used in recursive schema building as required fields can be described in parentSchema
 * @param propertyKey used in recursive schema building for building path for uiConfig
 * @param propertyPath constructs path of property
 */
export const buildYupFormForJsonSchema = (
  jsonSchema: JSONSchema7,
  uiConfig?: WidgetConfigMap,
  parentSchema?: JSONSchema7,
  propertyKey?: string,
  propertyPath: string | undefined = propertyKey
): yup.AnySchema => {
  let schema:
    | yup.NumberSchema
    | yup.StringSchema
    | yup.AnyObjectSchema
    | yup.ArraySchema<yup.AnySchema>
    | yup.BooleanSchema
    | null = null;

  if (jsonSchema.oneOf && uiConfig && propertyPath) {
    let selectedSchema = jsonSchema.oneOf.find(
      (condition) => typeof condition !== "boolean" && uiConfig[propertyPath]?.selectedItem === condition.title
    );

    // Select first oneOf path if no item selected
    selectedSchema = selectedSchema ?? jsonSchema.oneOf[0];

    if (selectedSchema && typeof selectedSchema !== "boolean") {
      return buildYupFormForJsonSchema(
        { type: jsonSchema.type, ...selectedSchema },
        uiConfig,
        jsonSchema,
        propertyKey,
        propertyPath
      );
    }
  }

  console.log("Final schema:", schema);
  switch (jsonSchema.type) {
    case "string":
      schema = yup.string().trim();

      if (jsonSchema?.pattern !== undefined) {
        schema = schema.matches(new RegExp(jsonSchema.pattern), "form.pattern.error");
      }
      if (jsonSchema?.type === "string" && jsonSchema?.format === "date-time") {
        schema = yup
          .string()
          .trim()
          .test("is-valid-date-time", "Invalid date-time format", (value) => {
            return (
              value === null || value === undefined || /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?/.test(value)
            );
          });
      }
      break;
    case "boolean":
      schema = yup.boolean();
      break;
    case "integer":
      schema = yup
        .number()
        .nullable(true)
        .transform((_, val) => (val ? Number(val) : null))
        .test("is-valid-number", "Invalid number", (value) => {
          if (value === null || value === undefined) {
            // Allow null or undefined values
            return true;
          }
          if (typeof value === "number" && !isNaN(value)) {
            return true; // Value is a valid number
          }
          return false;
        }) as yup.NumberSchema;

      if (jsonSchema?.minimum !== undefined) {
        schema = schema.min(jsonSchema?.minimum);
      }

      if (jsonSchema?.maximum !== undefined) {
        schema = schema.max(jsonSchema?.maximum);
      }
      break;
    case "array":
      if (typeof jsonSchema.items === "object" && typeof jsonSchema.items === "string") {
        schema = yup.array().of(yup.string().trim()).ensure();

        // Check if the array is required and apply the required validation conditionally
        const isRequired =
          !jsonSchema.default &&
          parentSchema &&
          Array.isArray(parentSchema.required) &&
          parentSchema.required.find((item) => item === propertyKey);

        if (isRequired) {
          schema = schema.required("form.empty.error");
        }
      }
      break;
    case "object":
      let objectSchema = yup.object();

      const keyEntries = Object.entries(jsonSchema.properties || {}).map(([propertyKey, condition]) => [
        propertyKey,
        typeof condition !== "boolean"
          ? buildYupFormForJsonSchema(
              condition,
              uiConfig,
              jsonSchema,
              propertyKey,
              propertyPath ? `${propertyPath}.${propertyKey}` : propertyKey
            )
          : yup.mixed(),
      ]);

      if (keyEntries.length) {
        objectSchema = objectSchema.shape(Object.fromEntries(keyEntries));
      } else {
        objectSchema = objectSchema.default({});
      }

      schema = objectSchema;
  }

  if (schema) {
    const hasDefault = isDefined(jsonSchema.default);

    if (hasDefault) {
      // @ts-expect-error can't infer correct type here so lets just use default from json_schema
      schema = schema.default(jsonSchema.default);
    }

    if (!hasDefault && jsonSchema.const) {
      // @ts-expect-error can't infer correct type here so lets just use default from json_schema
      schema = schema.oneOf([jsonSchema.const]).default(jsonSchema.const);
    }

    if (jsonSchema.enum) {
      // @ts-expect-error as enum is array we are going to use it as oneOf for yup
      schema = schema.oneOf(jsonSchema.enum);
    }

    const isRequired =
      !hasDefault &&
      parentSchema &&
      Array.isArray(parentSchema?.required) &&
      parentSchema.required.find((item) => item === propertyKey);

    if (schema && isRequired) {
      schema = schema.required("form.empty.error");
    }
  }

  return schema || yup.mixed();
};
