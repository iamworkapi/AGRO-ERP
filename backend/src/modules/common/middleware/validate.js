import { ApiError } from "../utils/ApiError.js";

// Validates req.body (or req.query, via `source`) against a Zod schema,
// replacing it with the parsed+coerced result so controllers always see
// clean data.
export function validate(schema, source = "body") {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next(ApiError.badRequest("Validation failed.", result.error.flatten()));
    }
    req[source] = result.data;
    next();
  };
}
