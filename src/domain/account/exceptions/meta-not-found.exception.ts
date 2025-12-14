import { NotFoundException } from '../../../infrastructure/common/exceptions/base.exceptions';
import { META_NOT_FOUND_EXCEPTION_CODE } from '../../../infrastructure/common/constants/constants';

export class MetaNotFoundExceptions extends NotFoundException {
  constructor(metaId: number) {
    super(
      META_NOT_FOUND_EXCEPTION_CODE,
      `Metadata metaId= ${metaId} is not found`,
    );
  }
}
