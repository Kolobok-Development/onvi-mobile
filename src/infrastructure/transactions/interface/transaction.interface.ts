import { AddRequestDto } from '../dto/add-request.dto';
import { WithdrawRequestDto } from '../dto/withdraw-request.dto';

export interface ITransactionService {
  add(data: AddRequestDto): Promise<any>;
  withdraw(date: WithdrawRequestDto): Promise<any>;
}
