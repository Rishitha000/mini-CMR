
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { UsersIcon, ShoppingCartIcon, SendIcon, HomeIcon, BarChartIcon, TagIcon } from 'lucide-react';

interface SidebarItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ href, icon: Icon, label, active }) => {
  return (
    <Link 
      to={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all w-full",
        active 
          ? "bg-brand-primary text-white" 
          : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  );
};

const Sidebar: React.FC = () => {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <aside className="bg-white border-r w-64 h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold text-brand-primary">Xeno CRM</h2>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        <SidebarItem 
          href="/" 
          icon={HomeIcon} 
          label="Dashboard" 
          active={pathname === '/'} 
        />
        <SidebarItem 
          href="/customers" 
          icon={UsersIcon} 
          label="Customers" 
          active={pathname === '/customers'} 
        />
        <SidebarItem 
          href="/orders" 
          icon={ShoppingCartIcon} 
          label="Orders" 
          active={pathname === '/orders'} 
        />
        <SidebarItem 
          href="/campaigns" 
          icon={SendIcon} 
          label="Campaigns" 
          active={pathname === '/campaigns' || pathname.startsWith('/campaigns/')}  
        />
        <SidebarItem 
          href="/analytics" 
          icon={BarChartIcon} 
          label="Analytics" 
          active={pathname === '/analytics'} 
        />
        <SidebarItem 
          href="/segments" 
          icon={TagIcon} 
          label="Segments" 
          active={pathname === '/segments'} 
        />
      </nav>
      <div className="p-4 border-t">
        <div className="text-xs text-gray-500">
          Xeno SDE Internship
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
