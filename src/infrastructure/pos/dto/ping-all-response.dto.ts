export class BayStatusDto {
  bayNumber: number;
  status: string;
  type?: string;
  errorMessage?: string;
}

export class PingAllResponseDto {
  carWashId: number;
  bayType: string;
  bayStatuses: BayStatusDto[];
  timestamp: Date;
}