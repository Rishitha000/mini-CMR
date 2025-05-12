
import { Campaign, Customer, Order, CommunicationLog, SegmentRule } from "../types";
import { v4 as uuidv4 } from 'uuid';

// Generate random date in the past (up to maxDaysAgo days ago)
const randomPastDate = (maxDaysAgo = 365) => {
  const today = new Date();
  const daysAgo = Math.floor(Math.random() * maxDaysAgo);
  const date = new Date(today);
  date.setDate(today.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

// Generate mock customers
export const generateMockCustomers = (count = 100): Customer[] => {
  const tags = ['high_value', 'frequent_buyer', 'new_customer', 'churned', 'promotional_sensitive', 'discount_lover'];
  
  return Array.from({ length: count }).map((_, index) => {
    const purchaseCount = Math.floor(Math.random() * 20);
    const totalSpent = Math.round(purchaseCount * (Math.random() * 100 + 50));
    const lastPurchaseDate = randomPastDate();
    
    // Randomly assign 0-2 tags
    const customerTags: string[] = [];
    const tagCount = Math.floor(Math.random() * 3);
    for (let i = 0; i < tagCount; i++) {
      const randomTag = tags[Math.floor(Math.random() * tags.length)];
      if (!customerTags.includes(randomTag)) {
        customerTags.push(randomTag);
      }
    }
    
    return {
      id: uuidv4(),
      name: `Customer ${index + 1}`,
      email: `customer${index + 1}@example.com`,
      totalSpent,
      lastPurchaseDate,
      purchaseCount,
      tags: customerTags,
    };
  });
};

// Generate mock orders
export const generateMockOrders = (customers: Customer[], count = 200): Order[] => {
  const productNames = ['T-shirt', 'Jeans', 'Sneakers', 'Watch', 'Bag', 'Sunglasses', 'Hat', 'Socks'];
  
  return Array.from({ length: count }).map(() => {
    const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
    const itemCount = Math.floor(Math.random() * 5) + 1;
    
    const items = Array.from({ length: itemCount }).map(() => {
      const price = Math.floor(Math.random() * 100) + 10;
      const quantity = Math.floor(Math.random() * 3) + 1;
      
      return {
        id: uuidv4(),
        name: productNames[Math.floor(Math.random() * productNames.length)],
        price,
        quantity,
      };
    });
    
    const amount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    return {
      id: uuidv4(),
      customerId: randomCustomer.id,
      date: randomPastDate(180),
      amount,
      items,
    };
  });
};

// Generate mock campaigns
export const generateMockCampaigns = (): Campaign[] => {
  return [
    {
      id: uuidv4(),
      name: "High Value Customers",
      segmentRules: [
        {
          id: uuidv4(),
          field: 'totalSpent',
          operator: '>',
          value: 1000,
        }
      ],
      message: "Thank you for being a valued customer! Here's a 15% discount on your next purchase.",
      createdAt: "2024-05-01",
      sentCount: 245,
      deliveredCount: 230,
      failedCount: 15,
      audienceSize: 245,
      status: 'sent',
    },
    {
      id: uuidv4(),
      name: "Win-back Campaign",
      segmentRules: [
        {
          id: uuidv4(),
          field: 'lastPurchase',
          operator: '>',
          value: 90,
          conjunction: 'AND'
        },
        {
          id: uuidv4(),
          field: 'totalSpent',
          operator: '>',
          value: 500,
        }
      ],
      message: "We miss you! Come back and enjoy 20% off your next order.",
      createdAt: "2024-04-15",
      sentCount: 180,
      deliveredCount: 165,
      failedCount: 15,
      audienceSize: 180,
      status: 'sent',
    },
    {
      id: uuidv4(),
      name: "New Summer Collection",
      segmentRules: [
        {
          id: uuidv4(),
          field: 'tag',
          operator: 'contains',
          value: 'frequent_buyer',
        }
      ],
      message: "Be the first to shop our new summer collection! Exclusive early access for our best customers.",
      createdAt: "2024-05-05",
      sentCount: 0,
      deliveredCount: 0,
      failedCount: 0,
      audienceSize: 320,
      status: 'draft',
    }
  ];
};

// Generate mock communication logs
export const generateMockCommunicationLogs = (campaigns: Campaign[], customers: Customer[]): CommunicationLog[] => {
  const logs: CommunicationLog[] = [];
  
  campaigns.filter(c => c.status === 'sent').forEach(campaign => {
    // Create logs for a subset of customers
    const campaignCustomers = customers.slice(0, campaign.sentCount);
    
    campaignCustomers.forEach((customer, index) => {
      const isFailed = index >= (campaign.sentCount - campaign.failedCount);
      const sentAt = new Date(campaign.createdAt);
      
      const log: CommunicationLog = {
        id: uuidv4(),
        campaignId: campaign.id,
        customerId: customer.id,
        messageContent: campaign.message.replace("{name}", customer.name),
        status: isFailed ? 'failed' : 'delivered',
        sentAt: sentAt.toISOString(),
      };
      
      if (isFailed) {
        log.failedAt = sentAt.toISOString();
        log.failureReason = Math.random() > 0.5 ? "Bounce" : "Invalid email address";
      } else {
        const deliveredAt = new Date(sentAt);
        deliveredAt.setMinutes(sentAt.getMinutes() + Math.floor(Math.random() * 10));
        log.deliveredAt = deliveredAt.toISOString();
      }
      
      logs.push(log);
    });
  });
  
  return logs;
};

// Initialize mock data
let mockCustomers: Customer[] = [];
let mockOrders: Order[] = [];
let mockCampaigns: Campaign[] = [];
let mockCommunicationLogs: CommunicationLog[] = [];

export const initializeMockData = () => {
  mockCustomers = generateMockCustomers();
  mockOrders = generateMockOrders(mockCustomers);
  mockCampaigns = generateMockCampaigns();
  mockCommunicationLogs = generateMockCommunicationLogs(mockCampaigns, mockCustomers);
};

// Data access functions
export const getCustomers = () => mockCustomers;
export const getOrders = () => mockOrders;
export const getCampaigns = () => mockCampaigns;
export const getCommunicationLogs = () => mockCommunicationLogs;

// Add a new campaign
export const addCampaign = (campaign: Omit<Campaign, 'id' | 'createdAt' | 'sentCount' | 'deliveredCount' | 'failedCount'>) => {
  const newCampaign: Campaign = {
    ...campaign,
    id: uuidv4(),
    createdAt: new Date().toISOString().split('T')[0],
    sentCount: 0,
    deliveredCount: 0,
    failedCount: 0,
    status: 'draft',
  };
  
  mockCampaigns.push(newCampaign);
  return newCampaign;
};

// Get customer count by segment rules
export const getCustomerCountByRules = (rules: SegmentRule[]): number => {
  if (!rules.length) return 0;
  
  return mockCustomers.filter(customer => {
    let result = evaluateRule(customer, rules[0]);
    
    for (let i = 1; i < rules.length; i++) {
      const conjunction = rules[i-1].conjunction || 'AND';
      const nextResult = evaluateRule(customer, rules[i]);
      
      if (conjunction === 'AND') {
        result = result && nextResult;
      } else {
        result = result || nextResult;
      }
    }
    
    return result;
  }).length;
};

// Evaluate a single rule against a customer
const evaluateRule = (customer: Customer, rule: SegmentRule): boolean => {
  switch (rule.field) {
    case 'totalSpent':
      return compareNumeric(customer.totalSpent, rule.operator, rule.value as number);
    
    case 'purchaseCount':
      return compareNumeric(customer.purchaseCount, rule.operator, rule.value as number);
    
    case 'lastPurchase': {
      const lastPurchase = new Date(customer.lastPurchaseDate);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - lastPurchase.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return compareNumeric(diffDays, rule.operator, rule.value as number);
    }
    
    case 'tag':
      if (rule.operator === 'contains') {
        return customer.tags.includes(rule.value as string);
      } else if (rule.operator === 'does_not_contain') {
        return !customer.tags.includes(rule.value as string);
      }
      return false;
    
    default:
      return false;
  }
};

// Helper function for numeric comparisons
const compareNumeric = (a: number, operator: string, b: number): boolean => {
  switch (operator) {
    case '>': return a > b;
    case '<': return a < b;
    case '=': return a === b;
    case '≥': return a >= b;
    case '≤': return a <= b;
    default: return false;
  }
};

// Initialize mock data
initializeMockData();
