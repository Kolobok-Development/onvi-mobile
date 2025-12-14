import { Injectable } from '@nestjs/common';
import { ICardRepository } from '../../../domain/account/card/card-repository.abstract';
import { Card } from '../../../domain/account/card/model/card';

@Injectable()
export class FindMethodsCardUseCase {
  constructor(private readonly cardRepository: ICardRepository) {}

  async getAllByClientId(clientId: number): Promise<Card[]> {
    return await this.cardRepository.findByClientId(clientId);
  }

  async getOneByDevNomer(devNomer: string): Promise<Card> {
    return await this.cardRepository.findOneByDevNomer(devNomer);
  }

  async getOneByDevNomerWithUserId(devNomer: string): Promise<Card> {
    return await this.cardRepository.findOneByDevNomerWithUserId(devNomer);
  }
}
