import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  CheckCircle, 
  Archive,
  Trash2,
  BarChart3, 
  FileText 
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void | undefined;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ activeView, onViewChange, collapsed, onToggleCollapse }: SidebarProps) {
  const buttons = [
    { id: 'new-entry', label: 'New Entry', icon: Plus },
    { id: 'pending', label: 'Pending', icon: Clock },
    { id: 'substantial-completion', label: 'Substantial Completion', icon: CheckCircle },
    { id: 'completed', label: 'Completed', icon: Archive },
    { id: 'deleted', label: 'Deleted', icon: Trash2 },
    { id: 'analytics', label: 'Analysis', icon: BarChart3 },
    { id: 'report', label: 'Report', icon: FileText },
  ];

  return (
    <Card className={`${collapsed ? 'w-16' : 'w-64'} h-fit m-4 p-4 border-border transition-all duration-300`}>
      <div className="space-y-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="w-full mb-2"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
        
        {buttons.map((button) => {
          const IconComponent = button.icon;
          return (
            <Button
              key={button.id}
              variant={activeView === button.id ? 'default' : 'ghost'}
              className={`w-full ${collapsed ? 'justify-center px-2' : 'justify-start'}`}
              onClick={() => onViewChange(button.id)}
              title={collapsed ? button.label : undefined}
            >
              {collapsed ? (
                <IconComponent className="h-4 w-4" />
              ) : (
                <>
                  <IconComponent className="h-4 w-4 mr-2" />
                  {button.label}
                </>
              )}
            </Button>
          );
        })}
      </div>
    </Card>
  );
}