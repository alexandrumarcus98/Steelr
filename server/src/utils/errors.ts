import mongoose from "mongoose";

export const isDuplicateKeyError = (error: unknown): boolean => {
  if (error instanceof mongoose.Error.ValidationError) return false;
  return (
    typeof (error as Record<string, unknown>)?.code === "number" &&
    (error as Record<string, unknown>).code === 11000
  );
};

export const isValidationError = (error: unknown): boolean => {
  return error instanceof mongoose.Error.ValidationError;
};
