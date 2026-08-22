import { ApiError } from "../utils/ApiError.js";

// Coarse gate: does this role even have a shot at this route.
// Fine-grained scoping (e.g. "this admin's warehouse specifically") happens
// per-resource in the service layer via assertCanAccessWarehouse.
export function authorize(...allowedRoles) {
  return (req, _res, next) => {
    if (!allowedRoles.includes(req.user.profile.role)) {
      return next(ApiError.forbidden(`This action requires one of: ${allowedRoles.join(", ")}.`));
    }
    next();
  };
}
