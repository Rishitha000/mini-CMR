
import React, { useState } from 'react';
import { getCustomers } from '@/services/mockData';
import { Customer } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { SearchIcon } from 'lucide-react';
import Layout from '@/components/Layout';

const Customers: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const customers = getCustomers();
  
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
            <p className="text-gray-500">Manage your customer database</p>
          </div>
          <Button>+ Add Customer</Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">Filter</Button>
        </div>
        
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Last Purchase</TableHead>
                <TableHead>Tags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.slice(0, 10).map((customer) => (
                <CustomerRow key={customer.id} customer={customer} />
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing 1-10 of {filteredCustomers.length} customers
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const CustomerRow: React.FC<{ customer: Customer }> = ({ customer }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  return (
    <TableRow>
      <TableCell className="font-medium">{customer.name}</TableCell>
      <TableCell>{customer.email}</TableCell>
      <TableCell>${customer.totalSpent}</TableCell>
      <TableCell>{customer.purchaseCount}</TableCell>
      <TableCell>{formatDate(customer.lastPurchaseDate)}</TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {customer.tags.map(tag => (
            <Badge key={tag} variant="secondary">
              {tag.replace('_', ' ')}
            </Badge>
          ))}
        </div>
      </TableCell>
    </TableRow>
  );
};

export default Customers;
