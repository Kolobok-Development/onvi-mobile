import { SendStatus } from '../../order/enum/send-status.enum';

export class SendResponseDto {
  sendStatus: SendStatus;
  errorMessage: string | null;
}
