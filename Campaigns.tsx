
import React from 'react';
import { getCampaigns } from '@/services/mockData';
import { Campaign } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, PlusIcon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { formatDistanceToNow } from 'date-fns';
import Layout from '@/components/Layout';

const Campaigns: React.FC = () => {
  const campaigns = getCampaigns();
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
            <p className="text-gray-500">Create and manage your marketing campaigns</p>
          </div>
          <Button asChild>
            <Link to="/campaigns/new">
              <PlusIcon className="mr-2 h-4 w-4" /> Create Campaign
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

const CampaignCard: React.FC<{ campaign: Campaign }> = ({ campaign }) => {
  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'sent': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const createdDate = new Date(campaign.createdAt);
  const timeAgo = formatDistanceToNow(createdDate, { addSuffix: true });
  
  const deliveryRate = campaign.status === 'sent' 
    ? Math.round((campaign.deliveredCount / campaign.sentCount) * 100) 
    : 0;
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg">{campaign.name}</h3>
          <Badge className={getStatusColor(campaign.status)}>
            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
          </Badge>
        </div>
        
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{campaign.message}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Created</span>
            <span>{timeAgo}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Audience Size</span>
            <span>{campaign.audienceSize} customers</span>
          </div>
          
          {campaign.status === 'sent' && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Delivery Rate</span>
                <span>{deliveryRate}%</span>
              </div>
              <Progress value={deliveryRate} className="h-1" />
            </>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {campaign.segmentRules.length} segment rule{campaign.segmentRules.length !== 1 ? 's' : ''}
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/campaigns/${campaign.id}`}>
              View Details <ArrowRightIcon className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Campaigns;
