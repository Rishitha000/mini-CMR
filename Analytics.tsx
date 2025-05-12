
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCustomers, getOrders, getCampaigns } from '@/services/mockData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import Layout from '@/components/Layout';

const Analytics: React.FC = () => {
  const customers = getCustomers();
  const orders = getOrders();
  const campaigns = getCampaigns();
  
  // Calculate monthly revenue
  const monthlyRevenue = Array.from({ length: 6 }).map((_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - index);
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    
    const monthOrders = orders.filter(order => {
      const orderDate = new Date(order.date);
      return orderDate.getMonth() === date.getMonth() && orderDate.getFullYear() === date.getFullYear();
    });
    
    const revenue = monthOrders.reduce((sum, order) => sum + order.amount, 0);
    
    return {
      month: `${month} ${year}`,
      revenue,
    };
  }).reverse();
  
  // Calculate top product categories
  const productCategories = orders.flatMap(order => 
    order.items.map(item => item.name)
  ).reduce((acc, name) => {
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topProducts = Object.entries(productCategories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));
  
  // Customer acquisition
  const customerAcquisition = Array.from({ length: 6 }).map((_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - index);
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    
    // Simulate customer growth
    const baseCount = 20;
    const randomFactor = Math.random() * 10;
    const count = Math.floor(baseCount + randomFactor * index);
    
    return {
      month: `${month} ${year}`,
      customers: count,
    };
  }).reverse();
  
  // Campaign performance
  const sentCampaigns = campaigns.filter(c => c.status === 'sent');
  const campaignPerformance = sentCampaigns.map(campaign => ({
    name: campaign.name,
    deliveryRate: Math.round((campaign.deliveredCount / campaign.sentCount) * 100),
  }));
  
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500">Key metrics and performance indicators</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenue}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts} layout="vertical">
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip formatter={(value) => [`${value} orders`, 'Count']} />
                    <Bar dataKey="count" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Customer Acquisition</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={customerAcquisition}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} new customers`, 'Acquisition']} />
                    <Line type="monotone" dataKey="customers" stroke="#4338ca" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={campaignPerformance}>
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Delivery Rate']} />
                  <Bar dataKey="deliveryRate" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Analytics;
