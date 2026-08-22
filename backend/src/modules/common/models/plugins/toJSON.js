// Shared across every model so the API always returns a flat `id` string
// instead of Mongo's `_id`/`__v`, and any per-model sensitive fields
// (declared via schema.set('hiddenFields', [...])) are stripped.
export function toJSONPlugin(schema) {
  schema.set("toJSON", {
    virtuals: true,
    transform(_doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      for (const field of schema.get("hiddenFields") || []) {
        delete ret[field];
      }
      return ret;
    },
  });
}
