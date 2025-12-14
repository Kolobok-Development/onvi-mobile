import { NotFoundException } from '../../../infrastructure/common/exceptions/base.exceptions';
import { META_EXISTS_CLIENT_EXCEPTION_CODE } from '../../../infrastructure/common/constants/constants';

export class MetaExistsExceptions extends NotFoundException {
  constructor(clientId: number) {
    super(
      META_EXISTS_CLIENT_EXCEPTION_CODE,
      `Metadata clientId= ${clientId} already exists`,
    );
  }
}
