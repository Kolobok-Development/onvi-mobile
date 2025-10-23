import { Injectable } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { DeviceType } from 'src/domain/order/enum/device-type.enum';
import { PingAllResponseDto } from 'src/infrastructure/pos/dto/ping-all-response.dto';
import { IPosService } from 'src/infrastructure/pos/interface/pos.interface';

@Injectable()
export class PingAllUseCase {
  constructor(
    private readonly posService: IPosService,
    private readonly logger: Logger,
  ) {}

  async execute(
    carWashId: number, 
    bayNumbers: number[], 
    bayType?: DeviceType
  ): Promise<PingAllResponseDto> {
    try {
      const results = await Promise.all(
        bayNumbers.map(bayNumber =>
          this.posService.ping({
            posId: carWashId,
            bayNumber: bayNumber,
            type: bayType,
          }),
        ),
      );

      const formattedResults = results.map((result, index) => ({
        bayNumber: bayNumbers[index],
        status: result.status,
        type: result.type,
        errorMessage: result.errorMessage,
      }));

      return {
        carWashId,
        bayType,
        bayStatuses: formattedResults,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Error in PingAllUseCase: ${error.message}`, error.stack);
      throw error;
    }
  }
}