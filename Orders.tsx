
import React from 'react';
import { getOrders, getCustomers } from '@/services/mockData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import Layout from '@/components/Layout';

const Orders: React.FC = () => {
  const orders = getOrders();
  const customers = getCustomers();
  
  // Get just the most recent orders for display
  const recentOrders = orders
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);
  
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500">View and manage customer orders</p>
        </div>
        
        <Card>
          <div className="rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Items</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => {
                  const customer = customers.find(c => c.id === order.customerId);
                  
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono">{order.id.split('-')[0]}</TableCell>
                      <TableCell>{customer?.name || 'Unknown'}</TableCell>
                      <TableCell>{format(new Date(order.date), 'MMM d, yyyy')}</TableCell>
                      <TableCell>${order.amount.toFixed(2)}</TableCell>
                      <TableCell>{order.items.length} items</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Orders;
