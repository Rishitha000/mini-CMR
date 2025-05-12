
import React from 'react';
import { Button } from '@/components/ui/button';
import { BellIcon, SettingsIcon, HelpCircleIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Header: React.FC = () => {
  return (
    <header className="border-b px-4 py-3 flex items-center justify-between bg-white">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold text-brand-primary">Mini CRM Platform</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon">
          <BellIcon className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <HelpCircleIcon className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <SettingsIcon className="h-5 w-5" />
        </Button>
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback>XD</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium hidden md:inline-block">User</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
