import { Test } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { ClientEntity } from '../entity/client.entity';
import { CardEntity } from '../entity/card.entity';
import { AccountRespository } from './account.respository';

describe('Account Repository', () => {
  let accountRespository: AccountRespository;
  let clientRepository: Repository<ClientEntity>;
  let cardRepository: Repository<CardEntity>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [AccountRespository],
    });
  });
});
