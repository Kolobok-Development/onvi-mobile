// Basic valid mock
import { ICreateCardDto } from '../../../../domain/dto/account-create-card.dto';
import { ICreateClientDto } from '../../../../domain/dto/account-create-client.dto';
import { ClientType } from '../../../../domain/account/client/enum/clinet-type.enum';
import { Tariff } from '../../../../domain/account/card/model/tariff';

/*
    ________________CARD DATA_______________
 */
export const validCreateCardDto: ICreateCardDto = {
  clientId: 12345,
  nomer: '1234567890123456',
  devNomer: '1234567890123456',
  cardTypeId: 5, // Assuming CardType is an enum with STANDARD value
  beginDate: new Date('2023-01-01T00:00:00Z'),
  isDel: 0,
};

// Mock with minimal values
export const minimalCreateCardDto: ICreateCardDto = {
  clientId: 1,
  nomer: '1000000000000000',
  devNomer: '1000000000000000',
  cardTypeId: 5, // Assuming CardType is an enum with BASIC value
  beginDate: new Date('2022-01-01T00:00:00Z'),
  isDel: 0,
};

// Mock with maximum values
export const maximalCreateCardDto: ICreateCardDto = {
  clientId: 999999999,
  nomer: '9999999999999999',
  devNomer: '9999999999999999',
  cardTypeId: 5, // Assuming CardType is an enum with PREMIUM value
  beginDate: new Date('2030-12-31T23:59:59Z'),
  isDel: 1,
};

// Mock with deleted status
export const deletedCreateCardDto: ICreateCardDto = {
  clientId: 54321,
  nomer: '5432109876543210',
  devNomer: '5432109876543210',
  cardTypeId: 5,
  beginDate: new Date('2021-06-15T12:30:45Z'),
  isDel: 1,
};

// Future date mock
export const futureCreateCardDto: ICreateCardDto = {
  clientId: 67890,
  nomer: '6789012345678901',
  devNomer: '6789012345678901',
  cardTypeId: 5, // Assuming CardType is an enum with GOLD value
  beginDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days in the future
  isDel: 0,
};

// ========== BASIC MOCK DATA FOR ICreateClientDto ==========

// Basic valid mock without cards
export const validCreateClientDto: ICreateClientDto = {
  rawPhone: '+79123456789',
  clientType: ClientType.INDIVIDUAL, // Adjust according to your actual enum values
  refreshToken:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ',
  cards: [],
};

// Mock with minimal values
export const minimalCreateClientDto: ICreateClientDto = {
  rawPhone: '+71234567890',
  clientType: ClientType.INDIVIDUAL, // Adjust according to your actual enum values
  refreshToken: 'minimal-refresh-token-123',
  cards: [],
};

// ========== BASIC MOCK DATA FOR Tariff ==========

// Basic valid tariff
export const standardTariff = {
  cardTypeId: 1,
  name: 'Standard Tariff',
  code: 'STD',
  bonus: 5, // 5%
  createdDate: new Date('2023-01-01T00:00:00Z'),
  countryCode: 7, // Russia
};
