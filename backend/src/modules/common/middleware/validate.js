import { ApiError } from "../../common/utils/ApiError.js";

// Validates req.body (or req.query, via `source`) against a Zod schema,
// replacing it with the parsed+coerced result so controllers always see
// clean data.
export function validate(schema, source = "body") {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const flattened = result.error.flatten();
      const firstField = Object.entries(flattened.fieldErrors)[0];
      const fieldMsg = firstField ? `${firstField[0]}: ${firstField[1][0]}` : null;
      const formMsg = flattened.formErrors[0];
      const message = formMsg || fieldMsg || "Validation failed.";
      return next(ApiError.badRequest(message, flattened));
    }
    req[source] = result.data;
    next();
  };
}
