export class GazpromUpdateDto{
    id: number;
    start_at: Date;
    expiration_at: Date;
    updated_at: Date;
    refreshed_at: Date;
    status: string;
    client: ClientDto;
    promotion: PromotionDto
}

export class ClientDto{
    partner_id: number;
    partner_user_id: number;
    phone_number: string;
}

export class PromotionDto{
    id: number;
    public_id: string;
    type: string;
    status: string;
    state: string;
    created_at: Date;
}