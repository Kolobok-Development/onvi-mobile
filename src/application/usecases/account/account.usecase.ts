import { Injectable } from '@nestjs/common';
import { IAccountRepository } from '../../../domain/account/interface/account-repository.interface';
import { IDate } from '../../../infrastructure/common/interfaces/date.interface';
import { Client } from '../../../domain/account/client/model/client';
import { Card } from '../../../domain/account/card/model/card';

@Injectable()
export class AccountUsecase {
  constructor(
    private readonly accountRepository: IAccountRepository,
    private readonly dateService: IDate,
  ) {}

}
