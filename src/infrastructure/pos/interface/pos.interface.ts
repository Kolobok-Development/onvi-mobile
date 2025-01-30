import { SendRequestDto } from '../dto/send-request.dto';
import { SendResponseDto } from '../dto/send-response.dto';
import { PingRequestDto } from '../dto/ping-request.dto';
import { PingResponseDto } from '../dto/ping-response.dto';

export abstract class IPosService {
  abstract ping(data: PingRequestDto): Promise<PingResponseDto>;
  abstract send(data: SendRequestDto): Promise<SendResponseDto>;
}
