import {DeviceType} from "../../../domain/order/enum/device-type.enum";

export class PingRequestDto {
  posId: number;
  bayNumber: number;
  type?: DeviceType;
}
