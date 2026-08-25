import { z } from "zod";

// Mongo ObjectId: 24 hex characters. Reused wherever a validator needs to
// accept a reference to another document (adminId, warehouseId, etc.).
export const objectId = (label = "id") => z.string().regex(/^[0-9a-fA-F]{24}$/, `Invalid ${label}.`);

// Base64 data URI for a small inline photo (Employee.avatarUrl,
// User.avatarUrl) - capped well under MongoDB's document limit and
// Express's JSON body limit; ~700k chars is roughly a 500KB image after
// base64 overhead. Not a general file store, just a profile picture.
// Profile photo: accepts Data URI (base64) up to 3MB, HTTP/HTTPS URL, or empty string.
export const avatarUrl = z
  .string()
  .max(4_000_000, "Photo is too large - please use an image under 2MB.")
  .refine(
    (val) => !val || val.startsWith("http://") || val.startsWith("https://") || val.startsWith("data:image/"),
    { message: "Photo must be a valid image URL or image file upload." }
  )
  .optional()
  .or(z.literal(""))
  .or(z.null());
