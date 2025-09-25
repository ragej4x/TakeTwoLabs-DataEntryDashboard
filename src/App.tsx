import React, { useState, useEffect } from 'react';
import { Settings, User, LogOut } from 'lucide-react';
import { Button } from './components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './components/ui/dropdown-menu';
import { Sidebar } from './components/Sidebar';
import { NewEntry } from './components/NewEntry';
import { Pending } from './components/Pending';
import { SubstantialCompletion } from './components/SubstantialCompletion';
import { Completed } from './components/Completed';
import { Deleted } from './components/Deleted';
import { Analytics } from './components/Analytics';
import { Report } from './components/Report';
import { ProfileDialog } from './components/ProfileDialog';
import { Auth } from './components/Auth';
import { toast } from 'sonner';
import { listEntries, createEntry, updateEntryApi, deleteEntry, listDeletedEntries, restoreEntry, permanentDeleteEntry, type EntryDTO, type EntryCreateDTO, setAuthToken, onGlobalLoadingChange } from './api';
import { Toaster } from 'sonner';
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

type ViewType = 'new-entry' | 'pending' | 'substantial-completion' | 'completed' | 'analytics' | 'report' | 'deleted';

const mapEntry = (e: EntryDTO): Entry => ({
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
});

function App() {
  // State
  const [isDark, setIsDark] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>('new-entry');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [deletedEntries, setDeletedEntries] = useState<Entry[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return !!localStorage.getItem('tt_token');
    } catch {
      return false;
    }
  });

  // Data loading functions
  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const data = await listEntries();
      setEntries(data.map(mapEntry));
    } catch (err) {
      console.error('Failed to load entries', err);
      toast.error('Failed to load entries');
      localStorage.removeItem('tt_token');
      setAuthToken(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }
    try {
      const deletedData = await listDeletedEntries();
      setDeletedEntries(deletedData.map(mapEntry));
    } catch (err) {
      console.warn('Failed to load deleted entries', err);
      setDeletedEntries([]);
      // do not log the user out just because deleted list failed
    } finally {
      setIsLoading(false);
    }
  };

  // Auth handlers
  const handleLogin = () => {
    setIsAuthenticated(true);
    toast.success('Logged in successfully');
    const token = localStorage.getItem('tt_token');
    if (token) {
      setAuthToken(token);
      loadAllData();
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
    localStorage.removeItem('tt_token');
    setAuthToken(null);
    setEntries([]);
    setDeletedEntries([]);
  };

  // UI handlers
  const toggleTheme = () => setIsDark(prev => !prev);
  const toggleSidebar = () => setSidebarCollapsed(prev => !prev);
  const handleProfile = () => setProfileDialogOpen(true);

  // Entry handlers
  const handleRestoreEntry = async (id: string) => {
    try {
      await restoreEntry(id);
      await loadAllData();
      toast.success('Entry restored successfully');
    } catch (err) {
      console.error('Failed to restore entry:', err);
      toast.error('Failed to restore entry');
    }
  };

  

  // Subscribe to global API loading state
  useEffect(() => {
    const unsubscribe = onGlobalLoadingChange((count) => setIsLoading(count > 0));
    return () => {
      // Ensure cleanup returns void regardless of unsubscribe's return type
      try {
        (unsubscribe as unknown as () => void)();
      } catch {
        // no-op
      }
    };
  }, []);

  // Theme effect
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  

  // Data loading effect
  useEffect(() => {
    const token = localStorage.getItem('tt_token');
    if (!token) {
      setAuthToken(null);
      return;
    }
    setAuthToken(token);
    loadAllData();
  }, []);

  

  

  

  

  

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
      // Find the entry before deleting so we can reflect it in Deleted list immediately
      let deletedSnapshot: Entry | null = null;
      setEntries(prev => {
        const found = prev.find(e => e.id === id) || null;
        deletedSnapshot = found ? { ...found } : null;
        return prev.filter(entry => entry.id !== id);
      });
      await deleteEntry(id);
      if (deletedSnapshot) {
        setDeletedEntries(prev => [deletedSnapshot as Entry, ...prev]);
      }
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
        return <Pending entries={entries.filter(e => e.status === 'pending')} onUpdateEntry={updateEntry} onDeleteEntry={handleDeleteEntry} />;
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
      case 'deleted':
        return <Deleted entries={deletedEntries} onRestoreEntry={handleRestoreEntry} onPermanentDelete={async (id: string) => {
          try {
            await permanentDeleteEntry(id);
            setDeletedEntries(prev => prev.filter(e => e.id !== id));
            toast.success('Entry permanently deleted');
          } catch (err) {
            console.error('Failed to permanently delete:', err);
            toast.error('Failed to permanently delete');
          }
        }} />;
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
          onViewChange={(view) => setActiveView(view as ViewType)} 
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

export default App;