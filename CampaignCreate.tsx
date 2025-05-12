
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCustomerCountByRules, addCampaign } from '@/services/mockData';
import { SegmentRule, Campaign } from '@/types';
import { XIcon, PlusIcon, ChevronLeftIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';

const CampaignCreate: React.FC = () => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [audienceSize, setAudienceSize] = useState(0);
  const [rules, setRules] = useState<SegmentRule[]>([
    {
      id: crypto.randomUUID(),
      field: 'totalSpent',
      operator: '>',
      value: 0,
      conjunction: 'AND'
    }
  ]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const debouncedUpdateAudienceSize = setTimeout(() => {
      if (rules.length > 0) {
        const count = getCustomerCountByRules(rules);
        setAudienceSize(count);
      }
    }, 500);
    
    return () => clearTimeout(debouncedUpdateAudienceSize);
  }, [rules]);

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
        description: "You need at least one rule to define your audience segment",
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

  const handleSave = () => {
    if (!name.trim()) {
      toast({
        title: "Campaign name required",
        description: "Please provide a name for your campaign",
        variant: "destructive"
      });
      return;
    }
    
    if (!message.trim()) {
      toast({
        title: "Message required",
        description: "Please provide a message for your campaign",
        variant: "destructive"
      });
      return;
    }
    
    const newCampaign: Omit<Campaign, 'id' | 'createdAt' | 'sentCount' | 'deliveredCount' | 'failedCount'> = {
      name,
      message,
      segmentRules: rules,
      audienceSize,
      status: 'draft',
    };
    
    addCampaign(newCampaign);
    
    toast({
      title: "Campaign created",
      description: "Your campaign has been saved successfully",
    });
    
    navigate('/campaigns');
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
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => navigate('/campaigns')}
        >
          <ChevronLeftIcon className="mr-2 h-4 w-4" /> Back to Campaigns
        </Button>
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Campaign</h1>
          <p className="text-gray-500">Define audience segments and create personalized messages</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">Campaign Name</label>
                  <Input
                    id="name"
                    placeholder="e.g., Summer Sale Promotion"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-1">Message Content</label>
                  <Textarea
                    id="message"
                    placeholder="Enter your campaign message here..."
                    className="min-h-[100px]"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Audience Segments</CardTitle>
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                      
                      {index < rules.length - 1 && (
                        <div>
                          <label className="block text-sm font-medium mb-1">Join with</label>
                          <Select
                            value={rule.conjunction}
                            onValueChange={(value: any) => handleRuleChange(rule.id, 'conjunction', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Join with" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="AND">AND</SelectItem>
                              <SelectItem value="OR">OR</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Campaign Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Audience Size</h3>
                  <div className="text-3xl font-bold text-brand-primary mt-2">{audienceSize}</div>
                  <p className="text-sm text-gray-500 mt-1">customers match your criteria</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium">Campaign Preview</h3>
                  <div className="bg-gray-50 p-3 rounded-lg mt-2 text-sm">
                    <strong>Name:</strong> {name || '(Not set)'}
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg mt-2 text-sm">
                    <strong>Message:</strong><br />
                    {message || '(No message content)'}
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button 
                    className="w-full" 
                    onClick={handleSave}
                    disabled={!name || !message || audienceSize === 0}
                  >
                    Save Campaign
                  </Button>
                  <Button variant="outline" className="w-full mt-2">
                    Send Campaign
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

export default CampaignCreate;
