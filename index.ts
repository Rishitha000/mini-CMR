
export interface Customer {
  id: string;
  name: string;
  email: string;
  totalSpent: number;
  lastPurchaseDate: string;
  purchaseCount: number;
  tags: string[];
}

export interface Order {
  id: string;
  customerId: string;
  date: string;
  amount: number;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Campaign {
  id: string;
  name: string;
  segmentRules: SegmentRule[];
  message: string;
  createdAt: string;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  audienceSize: number;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
}

export interface SegmentRule {
  id: string;
  field: 'totalSpent' | 'purchaseCount' | 'lastPurchase' | 'tag';
  operator: '>' | '<' | '=' | '≥' | '≤' | 'contains' | 'does_not_contain' | 'between' | 'in';
  value: string | number | string[] | [number, number];
  conjunction?: 'AND' | 'OR';
}

export interface CommunicationLog {
  id: string;
  campaignId: string;
  customerId: string;
  messageContent: string;
  status: 'sent' | 'delivered' | 'failed';
  sentAt: string;
  deliveredAt?: string;
  failedAt?: string;
  failureReason?: string;
}
