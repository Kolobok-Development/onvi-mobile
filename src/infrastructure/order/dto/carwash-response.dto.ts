import { SendStatus } from '../enum/send-status.enum';

export class CarwashResponseDto {
  sendStatus: SendStatus;
  errorMessage: string | null;
}
