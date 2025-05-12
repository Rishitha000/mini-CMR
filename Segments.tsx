
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getCustomerCountByRules, getCustomers } from '@/services/mockData';
import { SegmentRule } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PlusIcon, XIcon, UsersIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/Layout';

const Segments: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState<SegmentRule[]>([
    {
      id: crypto.randomUUID(),
      field: 'totalSpent',
      operator: '>',
      value: 0,
      conjunction: 'AND'
    }
  ]);
  const [customerCount, setCustomerCount] = useState(0);
  const { toast } = useToast();
  
  const handleAddRule = () => {
    setRules([
      ...rules,
      {
        id: crypto.randomUUID(),
        field: 'totalSpent',
        operator: '>',
        value: 0,
        conjunction: 'AND'
      }
    ]);
  };

  const handleRemoveRule = (id: string) => {
    if (rules.length > 1) {
      setRules(rules.filter(rule => rule.id !== id));
    } else {
      toast({
        title: "Cannot remove rule",
        description: "You need at least one rule to define your segment",
        variant: "destructive"
      });
    }
  };

  const handleRuleChange = (id: string, field: keyof SegmentRule, value: any) => {
    setRules(prevRules => 
      prevRules.map(rule => 
        rule.id === id ? { ...rule, [field]: value } : rule
      )
    );
  };
  
  const handlePreviewSegment = () => {
    const count = getCustomerCountByRules(rules);
    setCustomerCount(count);
    
    toast({
      title: "Segment Preview",
      description: `This segment contains ${count} customers.`,
    });
  };

  const handleSaveSegment = () => {
    if (!name) {
      toast({
        title: "Name required",
        description: "Please provide a name for your segment",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Segment saved",
      description: `"${name}" segment has been saved successfully.`,
    });
  };

  const getOperatorOptions = (fieldType: string) => {
    switch (fieldType) {
      case 'totalSpent':
      case 'purchaseCount':
        return [
          { value: '>', label: '>' },
          { value: '<', label: '<' },
          { value: '=', label: '=' },
          { value: '≥', label: '>=' },
          { value: '≤', label: '<=' }
        ];
      case 'lastPurchase':
        return [
          { value: '>', label: 'More than X days ago' },
          { value: '<', label: 'Less than X days ago' }
        ];
      case 'tag':
        return [
          { value: 'contains', label: 'Has tag' },
          { value: 'does_not_contain', label: 'Does not have tag' }
        ];
      default:
        return [
          { value: '>', label: '>' },
          { value: '<', label: '<' },
          { value: '=', label: '=' }
        ];
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audience Segments</h1>
          <p className="text-gray-500">Create and save customer segments for targeted campaigns</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Segment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">Segment Name</label>
                  <Input
                    id="name"
                    placeholder="e.g., High Value Customers"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-1">Description (Optional)</label>
                  <Textarea
                    id="description"
                    placeholder="Describe what this segment represents..."
                    className="min-h-[80px]"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Segment Rules</CardTitle>
                <Button size="sm" variant="outline" onClick={handleAddRule}>
                  <PlusIcon className="h-4 w-4 mr-1" /> Add Rule
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {rules.map((rule, index) => (
                  <div key={rule.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="font-medium">Rule {index + 1}</div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleRemoveRule(rule.id)}
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Field</label>
                        <Select
                          value={rule.field}
                          onValueChange={(value: any) => handleRuleChange(rule.id, 'field', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Field" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="totalSpent">Total Spent</SelectItem>
                            <SelectItem value="purchaseCount">Purchase Count</SelectItem>
                            <SelectItem value="lastPurchase">Last Purchase</SelectItem>
                            <SelectItem value="tag">Customer Tag</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Operator</label>
                        <Select
                          value={rule.operator}
                          onValueChange={(value: any) => handleRuleChange(rule.id, 'operator', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Operator" />
                          </SelectTrigger>
                          <SelectContent>
                            {getOperatorOptions(rule.field).map(op => (
                              <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Value</label>
                        {rule.field === 'tag' ? (
                          <Select
                            value={rule.value as string}
                            onValueChange={(value) => handleRuleChange(rule.id, 'value', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select tag" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high_value">high_value</SelectItem>
                              <SelectItem value="frequent_buyer">frequent_buyer</SelectItem>
                              <SelectItem value="new_customer">new_customer</SelectItem>
                              <SelectItem value="churned">churned</SelectItem>
                              <SelectItem value="promotional_sensitive">promotional_sensitive</SelectItem>
                              <SelectItem value="discount_lover">discount_lover</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            type="number"
                            value={rule.value as number}
                            onChange={(e) => handleRuleChange(rule.id, 'value', Number(e.target.value))}
                          />
                        )}
                      </div>
                    </div>
                    
                    {index < rules.length - 1 && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium mb-1">Logic</label>
                        <div className="flex space-x-2">
                          <Badge 
                            onClick={() => handleRuleChange(rule.id, 'conjunction', 'AND')} 
                            className={`cursor-pointer ${rule.conjunction === 'AND' ? 'bg-brand-primary' : 'bg-gray-200 hover:bg-gray-300'}`}
                          >
                            AND
                          </Badge>
                          <Badge 
                            onClick={() => handleRuleChange(rule.id, 'conjunction', 'OR')} 
                            className={`cursor-pointer ${rule.conjunction === 'OR' ? 'bg-brand-primary' : 'bg-gray-200 hover:bg-gray-300'}`}
                          >
                            OR
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Segment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center py-6">
                  <div className="bg-brand-light text-brand-primary p-4 rounded-full mb-4">
                    <UsersIcon className="h-10 w-10" />
                  </div>
                  {customerCount > 0 ? (
                    <div className="text-center">
                      <div className="text-3xl font-bold">{customerCount}</div>
                      <div className="text-sm text-gray-500">customers in this segment</div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      <div className="font-medium">Preview your segment</div>
                      <div className="text-sm">to see customer count</div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Button className="w-full" onClick={handlePreviewSegment}>
                    Preview Segment
                  </Button>
                  <Button 
                    className="w-full" 
                    variant="outline" 
                    onClick={handleSaveSegment} 
                    disabled={!name}
                  >
                    Save Segment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Segments;
