import {ClientException} from "../../../infrastructure/common/exceptions/base.exceptions";
import {BAY_IS_BUSY_ERROR_CODE} from "../../../infrastructure/common/constants/constants";

export class BayBusyException extends ClientException {
    constructor(bayNumber: number) {
        super(
            BAY_IS_BUSY_ERROR_CODE,
            `Пост № ${bayNumber} занят`,
        );
    }
}