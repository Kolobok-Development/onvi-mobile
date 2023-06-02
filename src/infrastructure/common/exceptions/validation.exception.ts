import { ValidationError } from '@nestjs/common';
import { ClientException } from './base.exceptions';

export const VALIDATION_ERROR_CODE = 40;

export class ValidationException extends ClientException {
  constructor(errors: ValidationError[]) {
    const errorMessage = errors
      .map((error) => Object.values(error.constraints))
      .join(', ');
    super(VALIDATION_ERROR_CODE, errorMessage);
  }
}
