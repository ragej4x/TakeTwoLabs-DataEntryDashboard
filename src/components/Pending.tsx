import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { TendDialog } from './TendDialog';
import type { Entry } from '../App';

interface PendingProps {
  entries: Entry[];
  onUpdateEntry: (id: string, updates: Partial<Entry>) => void;
}

export function Pending({ entries, onUpdateEntry }: PendingProps) {
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleTend = (entry: Entry) => {
    setSelectedEntry(entry);
    setDialogOpen(true);
  };

  const handleUpdateEntry = (updates: Partial<Entry>) => {
    if (selectedEntry) {
      onUpdateEntry(selectedEntry.id, updates);
      setDialogOpen(false);
      setSelectedEntry(null);
    }
  };

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No pending entries found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Pending Entries</h2>
      
      <div className="grid gap-4">
        {entries.map((entry) => (
          <Card key={entry.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{entry.customerName}</h3>
                  <Badge variant="outline">Pending</Badge>
                </div>
                
                <p className="text-sm text-muted-foreground">{entry.itemDescription}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Phone:</span> {entry.customerPhone || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {entry.customerEmail || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Service:</span> {entry.shoeService || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Assigned:</span> {entry.assignedTo || 'N/A'}
                  </div>
                </div>

                {entry.beforePhotos && entry.beforePhotos.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground mb-1">Before Photos ({entry.beforePhotos.length})</p>
                    <div className="flex gap-1">
                      {entry.beforePhotos.slice(0, 3).map((photo, index) => (
                        <img 
                          key={index}
                          src={photo} 
                          alt={`Before ${index + 1}`} 
                          className="w-16 h-16 object-cover rounded border"
                        />
                      ))}
                      {entry.beforePhotos.length > 3 && (
                        <div className="w-16 h-16 bg-muted rounded border flex items-center justify-center text-xs">
                          +{entry.beforePhotos.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <Button onClick={() => handleTend(entry)}>
                Tend
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Service Details - {selectedEntry?.customerName}</DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <TendDialog
              entry={selectedEntry}
              onUpdateEntry={handleUpdateEntry}
              onClose={() => setDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}