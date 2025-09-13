import React, { useState, useEffect } from 'react';
import { Settings, User, LogOut } from 'lucide-react';
import { Button } from './components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './components/ui/dropdown-menu';
import { Sidebar } from './components/Sidebar';
import { NewEntry } from './components/NewEntry';
import { Pending } from './components/Pending';
import { SubstantialCompletion } from './components/SubstantialCompletion';
import { Completed } from './components/Completed';
import { Analytics } from './components/Analytics';
import { Report } from './components/Report';
import { ProfileDialog } from './components/ProfileDialog';
import { toast } from 'sonner@2.0.3';

export type Entry = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  itemDescription: string;
  shoeCondition: string;
  shoeService?: string;
  waiverSigned: boolean;
  beforePhotos: string[];
  assignedTo?: string;
  status: 'pending' | 'substantial-completion' | 'completed';
  serviceDetails?: {
    isShoeClean?: boolean;
    serviceType?: string;
    needsReglue?: boolean;
    needsPaint?: boolean;
    qcPassed?: boolean;
    basicCleaning?: boolean;
    receivedBy?: string;
  };
  afterPhotos: string[];
  billing?: number;
  deliveryOption?: 'pickup' | 'delivery';
  markedAs?: 'paid-delivered' | 'paid' | 'delivered' | 'in-progress';
  createdAt: Date;
  updatedAt: Date;
};

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [activeView, setActiveView] = useState('new-entry');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleLogout = () => {
    toast.success('Logged out successfully');
    // In a real app, you would clear auth tokens and redirect to login
  };

  const handleProfile = () => {
    setProfileDialogOpen(true);
  };

  const addEntry = (entry: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newEntry: Entry = {
      ...entry,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setEntries(prev => [...prev, newEntry]);
  };

  const updateEntry = (id: string, updates: Partial<Entry>) => {
    setEntries(prev => 
      prev.map(entry => 
        entry.id === id 
          ? { ...entry, ...updates, updatedAt: new Date() }
          : entry
      )
    );
  };

  const renderContent = () => {
    switch (activeView) {
      case 'new-entry':
        return <NewEntry onAddEntry={addEntry} />;
      case 'pending':
        return <Pending entries={entries.filter(e => e.status === 'pending')} onUpdateEntry={updateEntry} />;
      case 'substantial-completion':
        return <SubstantialCompletion 
          entries={entries.filter(e => e.status === 'substantial-completion')} 
          onUpdateEntry={updateEntry} 
        />;
      case 'completed':
        return <Completed entries={entries.filter(e => e.status === 'completed')} onUpdateEntry={updateEntry} />;
      case 'analytics':
        return <Analytics entries={entries} />;
      case 'report':
        return <Report entries={entries} />;
      default:
        return <NewEntry onAddEntry={addEntry} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-border">
        <h1 className="text-2xl font-bold">Take Two Labs Data Entry Dashboard</h1>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleProfile}>
              <User className="h-4 w-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={toggleTheme}>
              <Settings className="h-4 w-4 mr-2" />
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <Sidebar 
          activeView={activeView} 
          onViewChange={setActiveView} 
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        />
        
        {/* Main Content */}
        <div className="flex-1 p-6 transition-all duration-300">
          {renderContent()}
        </div>
      </div>

      <ProfileDialog 
        open={profileDialogOpen} 
        onOpenChange={setProfileDialogOpen} 
      />
    </div>
  );
}