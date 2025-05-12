
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Campaign, Customer } from '@/types';
import { getCampaigns, getCustomers } from '@/services/mockData';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const CampaignDetail = () => {
  const { id } = useParams();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [targetedCustomers, setTargetedCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    if (id) {
      const foundCampaign = getCampaigns().find(c => c.id === id);
      if (foundCampaign) {
        setCampaign(foundCampaign);
        
        // Get customers that match segment rules
        const customers = getCustomers();
        const matchingCustomers = customers.filter(customer => {
          let result = evaluateRule(customer, foundCampaign.segmentRules[0]);
          
          for (let i = 1; i < foundCampaign.segmentRules.length; i++) {
            const conjunction = foundCampaign.segmentRules[i-1].conjunction || 'AND';
            const nextResult = evaluateRule(customer, foundCampaign.segmentRules[i]);
            
            if (conjunction === 'AND') {
              result = result && nextResult;
            } else {
              result = result || nextResult;
            }
          }
          
          return result;
        });
        
        setTargetedCustomers(matchingCustomers.slice(0, 10)); // Just show first 10 for preview
      }
    }
  }, [id]);

  // Helper function to evaluate rule
  const evaluateRule = (customer: Customer, rule: any) => {
    switch (rule.field) {
      case 'totalSpent':
        return compareNumeric(customer.totalSpent, rule.operator, rule.value);
      case 'purchaseCount':
        return compareNumeric(customer.purchaseCount, rule.operator, rule.value);
      case 'lastPurchase': {
        const lastPurchase = new Date(customer.lastPurchaseDate);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - lastPurchase.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return compareNumeric(diffDays, rule.operator, rule.value);
      }
      case 'tag':
        if (rule.operator === 'contains') {
          return customer.tags.includes(rule.value);
        } else if (rule.operator === 'does_not_contain') {
          return !customer.tags.includes(rule.value);
        }
        return false;
      default:
        return false;
    }
  };
  
  // Helper function for numeric comparisons
  const compareNumeric = (a: number, operator: string, b: number) => {
    switch (operator) {
      case '>': return a > b;
      case '<': return a < b;
      case '=': return a === b;
      case '≥': return a >= b;
      case '≤': return a <= b;
      default: return false;
    }
  };

  // Format operator for display
  const formatOperator = (operator: string) => {
    switch (operator) {
      case '>': return 'greater than';
      case '<': return 'less than';
      case '=': return 'equals';
      case '≥': return 'greater than or equal to';
      case '≤': return 'less than or equal to';
      case 'contains': return 'contains';
      case 'does_not_contain': return 'does not contain';
      case 'between': return 'between';
      case 'in': return 'in';
      default: return operator;
    }
  };

  if (!campaign) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <p>Campaign not found</p>
        </div>
      </Layout>
    );
  }

  // Prepare data for the delivery chart
  const deliveryData = [
    {
      name: 'Delivered',
      value: campaign.deliveredCount,
      color: '#10B981'
    },
    {
      name: 'Failed',
      value: campaign.failedCount,
      color: '#EF4444'
    }
  ];

  // Prepare performance data for the area chart (mock data)
  const generatePerformanceData = () => {
    // Create 7 days of data
    return Array.from({ length: 7 }).map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      // Generate some random but sensible values
      const deliveryRate = 90 + Math.random() * 10; // 90-100%
      const openRate = 20 + Math.random() * 30; // 20-50% 
      const clickRate = 5 + Math.random() * 15; // 5-20%
      
      return {
        date: dateString,
        deliveryRate,
        openRate,
        clickRate
      };
    });
  };

  const performanceData = generatePerformanceData();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{campaign.name}</h1>
            <p className="text-gray-500">Campaign created on {new Date(campaign.createdAt).toLocaleDateString()}</p>
          </div>
          <Badge className={`px-3 py-1 ${
            campaign.status === 'draft' ? 'bg-gray-500' : 
            campaign.status === 'scheduled' ? 'bg-blue-500' : 
            campaign.status === 'sent' ? 'bg-green-500' : 'bg-red-500'
          }`}>
            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Segment Rules</CardTitle>
              <CardDescription>Audience targeting criteria</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {campaign.segmentRules.map((rule, index) => (
                  <li key={rule.id} className="border-b pb-2 last:border-0">
                    {index > 0 && (
                      <span className="text-sm font-medium text-gray-500 block mb-1">
                        {rule.conjunction}
                      </span>
                    )}
                    <span className="font-medium">{rule.field.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                    {' is '}
                    <span className="font-medium">{formatOperator(rule.operator)}</span>
                    {' '}
                    <span className="font-medium">
                      {Array.isArray(rule.value) ? rule.value.join(', ') : rule.value}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Message Content</CardTitle>
              <CardDescription>What customers will receive</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 p-4 rounded">
                {campaign.message}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Results</CardTitle>
              <CardDescription>Current delivery status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={deliveryData} 
                      cx="50%" 
                      cy="50%" 
                      labelLine={false}
                      outerRadius={80} 
                      fill="#8884d8" 
                      dataKey="value"
                      nameKey="name"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {deliveryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-100 p-3 rounded text-center">
                  <p className="text-sm text-gray-500">Sent</p>
                  <p className="text-2xl font-bold">{campaign.sentCount}</p>
                </div>
                <div className="bg-gray-100 p-3 rounded text-center">
                  <p className="text-sm text-gray-500">Audience Size</p>
                  <p className="text-2xl font-bold">{campaign.audienceSize}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Over Time</CardTitle>
              <CardDescription>Tracking key metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="deliveryRate" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.3} name="Delivery Rate %" />
                    <Area type="monotone" dataKey="openRate" stackId="2" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} name="Open Rate %" />
                    <Area type="monotone" dataKey="clickRate" stackId="3" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} name="Click Rate %" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sample Audience</CardTitle>
            <CardDescription>First 10 customers who will receive this campaign</CardDescription>
          </CardHeader>
          <CardContent>
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {targetedCustomers.length > 0 ? (
                  targetedCustomers.map(customer => (
                    <tr key={customer.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{customer.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{customer.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">${customer.totalSpent}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {customer.tags.map(tag => (
                          <Badge key={tag} className="mr-1">{tag}</Badge>
                        ))}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center">No customers match these criteria</td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CampaignDetail;
