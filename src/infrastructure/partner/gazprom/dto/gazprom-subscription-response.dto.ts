export class GazpromSubscriptionResponseDto {
  items: Item[];
  count: number;

  constructor(items: Item[], count: number) {
    this.items = items;
    this.count = count;
  }
}

class Item {
  id: string;
  partner_user_id: string;
  start_at: string;
  created_at: string;
  expiration_at: string;
  updated_at: string;
  status: string;
  promotion: {
    id: string;
    public_id: string;
  };
  refreshed_at: string;
}
