import { DeviceType } from "src/domain/order/enum/device-type.enum";

export class PingAllRequestDto {
  carWashId: number;
  bayNumbers: string;
  bayType: DeviceType; 
}