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
import { Auth } from './components/Auth';
import { toast } from 'sonner@2.0.3';
import { listEntries, createEntry, updateEntryApi, deleteEntry, type EntryDTO, type EntryCreateDTO, setAuthToken, onGlobalLoadingChange } from './api';
import { Toaster } from 'sonner@2.0.3';
import { LoadingOverlay } from './components/ui/loading-overlay';

export type Entry = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: string;
  itemDescription: string;
  shoeCondition: string;
  shoeService?: string;
  waiverSigned: boolean;
  waiverUrl?: string;
  waiverPdf?: File | null;
  beforePhotos: string[];
  assignedTo?: string;
  needsReglue?: boolean;
  needsPaint?: boolean;
  status: 'pending' | 'substantial-completion' | 'completed';
  serviceDetails?: {
    isShoeClean?: string; // 'yes' | 'no'
    serviceType?: string; // 'restoration' | 'deep-cleaning'
    needsReglue?: boolean;
    needsPaint?: boolean;
    qcPassed?: boolean;
    basicCleaning?: string; // 'yes' | 'no'
    receivedBy?: string; // 'taketwo' | 'gameville'
  };
  afterPhotos: string[];
  billing?: number; // Service bill from NewEntry
  additionalBilling?: number; // Additional billing that can be added in Pending
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return !!localStorage.getItem('tt_token');
    } catch {
      return false;
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // subscribe to global API loading state
    const unsubscribe = onGlobalLoadingChange((count) => setIsLoading(count > 0));
    return () => unsubscribe();
  }, []);

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
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
    // In a real app, you would clear auth tokens and redirect to login
    localStorage.removeItem('tt_token');
    setAuthToken(null);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    toast.success('Logged in successfully');
    const token = localStorage.getItem('tt_token');
    if (token) setAuthToken(token);
  };

  const handleProfile = () => {
    setProfileDialogOpen(true);
  };

  // Initialize token and validate session on first load or when becoming authenticated
  useEffect(() => {
    const token = localStorage.getItem('tt_token');
    if (!token) {
      setAuthToken(null);
      return;
    }
    setAuthToken(token);
    (async () => {
      try {
        setIsLoading(true);
        const data = await listEntries();
        const mapped: Entry[] = data.map((e: EntryDTO) => ({
          id: e.id,
          customerName: e.customerName,
          customerPhone: e.customerPhone,
          customerEmail: e.customerEmail,
          deliveryAddress: e.deliveryAddress,
          itemDescription: e.itemDescription,
          shoeCondition: e.shoeCondition,
          shoeService: e.shoeService,
          waiverSigned: e.waiverSigned,
          waiverUrl: e.waiverUrl,
          waiverPdf: null,
          beforePhotos: e.beforePhotos,
          assignedTo: e.assignedTo,
          needsReglue: e.needsReglue,
          needsPaint: e.needsPaint,
          status: (e.status as Entry['status']) ?? 'pending',
          serviceDetails: e.serviceDetails,
          afterPhotos: e.afterPhotos,
          billing: e.billing,
          additionalBilling: e.additionalBilling,
          deliveryOption: e.deliveryOption as Entry['deliveryOption'],
          markedAs: e.markedAs as Entry['markedAs'],
          createdAt: new Date(e.createdAt),
          updatedAt: new Date(e.updatedAt),
        }));
        setEntries(mapped);
        setIsAuthenticated(true);
      } catch (err) {
        console.error(err);
        // Token invalid or server error
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('tt_token');
        setAuthToken(null);
        setIsAuthenticated(false);
      } finally { setIsLoading(false); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const addEntry = async (entry: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { waiverPdf, ...rest } = entry as any;
      const payload: EntryCreateDTO = {
        ...rest,
      };
      const created = await createEntry(payload);
      const mapped: Entry = {
        id: created.id,
        customerName: created.customerName,
        customerPhone: created.customerPhone,
        customerEmail: created.customerEmail,
        deliveryAddress: created.deliveryAddress,
        itemDescription: created.itemDescription,
        shoeCondition: created.shoeCondition,
        shoeService: created.shoeService,
        waiverSigned: created.waiverSigned,
        waiverUrl: (created as any).waiverUrl,
        waiverPdf: null,
        beforePhotos: created.beforePhotos,
        assignedTo: created.assignedTo,
        needsReglue: created.needsReglue,
        needsPaint: created.needsPaint,
        status: (created.status as Entry['status']) ?? 'pending',
        serviceDetails: created.serviceDetails,
        afterPhotos: created.afterPhotos,
        billing: created.billing,
        additionalBilling: created.additionalBilling,
        deliveryOption: created.deliveryOption as Entry['deliveryOption'],
        markedAs: created.markedAs as Entry['markedAs'],
        createdAt: new Date(created.createdAt),
        updatedAt: new Date(created.updatedAt),
      };
      setEntries(prev => [...prev, mapped]);
      toast.success('Entry saved');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save entry');
    }
  };

  const updateEntry = async (id: string, updates: Partial<Entry>) => {
    try {
      const { waiverPdf, createdAt, updatedAt, ...rest } = updates as any;
      const updated = await updateEntryApi(id, rest);
      setEntries(prev => 
        prev.map(entry => 
          entry.id === id 
            ? {
                ...entry,
                ...rest,
                updatedAt: new Date(updated.updatedAt),
              }
            : entry
        )
      );
      toast.success('Entry updated');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update entry');
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      await deleteEntry(id);
      setEntries(prev => prev.filter(entry => entry.id !== id));
      toast.success('Entry deleted successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete entry');
    }
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
        return <Completed 
          entries={entries.filter(e => e.status === 'completed')} 
          onUpdateEntry={updateEntry}
          onDeleteEntry={handleDeleteEntry}
        />;
      case 'analytics':
        return <Analytics entries={entries} />;
      case 'report':
        return <Report entries={entries} />;
      default:
        return <NewEntry onAddEntry={addEntry} />;
    }
  };

  // Show authentication screen if not logged in (ensure Toaster mounts here too)
  if (!isAuthenticated) {
    return (
      <>
        <Toaster richColors closeButton position="top-right" theme={isDark ? 'dark' : 'light'} />
        <LoadingOverlay show={false} />
        <Auth onLogin={handleLogin} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LoadingOverlay show={isLoading} />
      <Toaster richColors closeButton position="top-right" theme={isDark ? 'dark' : 'light'} />
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-border">
        <div className="flex items-baseline gap-4">
          <h1 className="text-2xl font-bold">TAKETWO Dashboard</h1>
        </div>
        
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