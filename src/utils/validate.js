import { toast } from "./toast";

// Validates `data` against a zod `schema`. On failure, every issue is
// surfaced as a toast (the same global notification surface every other
// error in the app uses - see apiClient.js) and this returns null so the
// caller can bail out of its submit handler. On success, returns the
// parsed/coerced data.
export function validateOrToast(schema, data) {
  const result = schema.safeParse(data);
  if (result.success) return result.data;

  for (const issue of result.error.issues) {
    toast.error(issue.message);
  }
  return null;
}
