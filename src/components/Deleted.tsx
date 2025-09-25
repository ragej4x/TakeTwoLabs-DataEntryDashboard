import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { toast } from 'sonner';
import type { Entry } from '../App';

interface DeletedProps {
  entries: Entry[];
  onRestoreEntry: (id: string) => Promise<void>;
  onPermanentDelete: (id: string) => Promise<void>;
}

export function Deleted({ entries, onRestoreEntry, onPermanentDelete }: DeletedProps) {
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRestore = async (entry: Entry) => {
    try {
      setIsRestoring(true);
      await onRestoreEntry(entry.id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRestoring(false);
      setSelectedEntry(null);
    }
  };

  const handlePermanentDelete = async (entry: Entry) => {
    try {
      setIsDeleting(true);
      await onPermanentDelete(entry.id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
      setSelectedEntry(null);
    }
  };

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Deleted Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No deleted entries found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Deleted Entries</h2>
      
      <div className="grid gap-4">
        {entries.map((entry) => (
          <Card key={entry.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{entry.customerName}</h3>
                  <Badge variant="destructive">Deleted</Badge>
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
                    <span className="font-medium">Amount:</span> ₱{(entry.billing || 0) + (entry.additionalBilling || 0)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                  <div>
                    <span className="font-medium">Delivery:</span> {entry.deliveryOption || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Address:</span> {entry.deliveryAddress || 'N/A'}
                  </div>
                </div>

                {entry.beforePhotos && entry.beforePhotos.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground mb-1">Photos ({entry.beforePhotos.length})</p>
                    <div className="flex gap-1">
                      {entry.beforePhotos.slice(0, 3).map((photo, index) => (
                        <img 
                          key={index}
                          src={photo} 
                          alt={`Photo ${index + 1}`} 
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
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="ml-4" onClick={() => setSelectedEntry(entry)}>
                    Restore Entry
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Restore Entry</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to restore this entry? It will be moved back to its original status.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isRestoring}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => selectedEntry && handleRestore(selectedEntry)}
                      disabled={isRestoring}
                    >
                      {isRestoring ? 'Restoring...' : 'Restore Entry'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="ml-2" onClick={() => setSelectedEntry(entry)}>
                    Delete Permanently
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Permanently</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the entry.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => selectedEntry && handlePermanentDelete(selectedEntry)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete Permanently'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}