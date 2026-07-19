import { AppError } from "../utils/AppError.js";

export const allowRoles = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError(403, "You do not have permission to perform this action."));
  }
  next();
};
