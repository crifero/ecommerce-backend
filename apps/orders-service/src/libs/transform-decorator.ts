import { Transform } from 'class-transformer';

export const ToString = () =>
  Transform(({ value }) => (value !== undefined && value !== null ? String(value) : value));

export const ToNumber = () =>
  Transform(({ value }) => (value !== undefined && value !== null ? Number(value) : value));

export const ToBoolean = () =>
  Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  });
