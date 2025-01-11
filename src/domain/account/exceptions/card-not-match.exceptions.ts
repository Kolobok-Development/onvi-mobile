import {NotFoundException} from "../../../infrastructure/common/exceptions/base.exceptions";
import {
    CARD_NOT_MATCH_EXCEPTION_CODE
} from "../../../infrastructure/common/constants/constants";

export class CardNotMatchExceptions extends NotFoundException {
    constructor(phone: string) {
        super(
            CARD_NOT_MATCH_EXCEPTION_CODE,
            `card= ${phone} is not match`,
        );
    }
}