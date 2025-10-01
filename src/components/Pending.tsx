import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { toast } from 'sonner';
import { TendDialog } from './TendDialog';
import type { Entry } from '../App';

interface PendingProps {
  entries: Entry[];
  onUpdateEntry: (id: string, updates: Partial<Entry>) => void;
  onDeleteEntry?: (id: string) => void;
}

export function Pending({ entries, onUpdateEntry, onDeleteEntry }: PendingProps) {
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState<Partial<Entry>>({});

  const handleTend = (entry: Entry) => {
    setSelectedEntry(entry);
    setDialogOpen(true);
  };

  const handleEdit = (entry: Entry) => {
    setSelectedEntry(entry);
    setEditData({
      customerName: entry.customerName,
      customerPhone: entry.customerPhone,
      customerEmail: entry.customerEmail,
      itemDescription: entry.itemDescription,
      deliveryAddress: entry.deliveryAddress,
      assignedTo: entry.assignedTo,
      billing: entry.billing,
      beforePhotos: entry.beforePhotos || [],
    });
    setEditOpen(true);
  };

  const handleUpdateEntry = (updates: Partial<Entry>) => {
    if (selectedEntry) {
      onUpdateEntry(selectedEntry.id, updates);
      setDialogOpen(false);
      setSelectedEntry(null);
    }
  };

  const handleSaveEdit = () => {
    if (selectedEntry) {
      onUpdateEntry(selectedEntry.id, editData);
      setEditOpen(false);
      setSelectedEntry(null);
      toast.success('Entry updated');
    }
  };

  const handleEditPhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const newPhotos: string[] = [];
    let processed = 0;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) newPhotos.push(result);
        processed += 1;
        if (processed === files.length) {
          setEditData((prev) => ({
            ...prev,
            beforePhotos: [ ...(prev.beforePhotos || []), ...newPhotos ],
          }));
          toast.success('Photo(s) added');
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeEditPhoto = (index: number) => {
    setEditData((prev) => ({
      ...prev,
      beforePhotos: (prev.beforePhotos || []).filter((_, i) => i !== index),
    }));
    toast.success('Photo removed');
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

                {entry.waiverUrl && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Waiver uploaded
                  </div>
                )}

                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mt-2">
                  <div>
                    <span className="font-medium">Service Bill:</span> ₱{entry.billing || 0}
                  </div>
                  <div>
                    <span className="font-medium">Delivery Address:</span> {entry.deliveryAddress || 'N/A'}
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
              
              <div className="flex items-center gap-2">
                <Button onClick={() => handleTend(entry)}>
                  Tend
                </Button>
                <Button variant="outline" onClick={() => handleEdit(entry)}>
                  Edit
                </Button>
              {onDeleteEntry && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                      <Button variant="outline" className="ml-2">Delete</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Entry</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this entry? You can restore it later from Deleted.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDeleteEntry(entry.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Service Details - {selectedEntry?.customerName}</DialogTitle>
            <DialogDescription>
              Manage service details and complete the workflow for this entry.
            </DialogDescription>
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

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Entry - {selectedEntry?.customerName}</DialogTitle>
            <DialogDescription>
              Update customer and job details for this pending entry.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm" htmlFor="editCustomerName">Customer Name</label>
                <input
                  id="editCustomerName"
                  className="mt-1 w-full border rounded px-3 py-2 bg-background"
                  value={editData.customerName || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, customerName: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm" htmlFor="editCustomerPhone">Phone</label>
                <input
                  id="editCustomerPhone"
                  className="mt-1 w-full border rounded px-3 py-2 bg-background"
                  value={editData.customerPhone || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, customerPhone: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="text-sm" htmlFor="editCustomerEmail">Email</label>
              <input
                id="editCustomerEmail"
                className="mt-1 w-full border rounded px-3 py-2 bg-background"
                value={editData.customerEmail || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, customerEmail: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm" htmlFor="editDeliveryAddress">Delivery Address</label>
              <input
                id="editDeliveryAddress"
                className="mt-1 w-full border rounded px-3 py-2 bg-background"
                value={editData.deliveryAddress || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, deliveryAddress: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm" htmlFor="editItemDescription">Item Description</label>
              <textarea
                id="editItemDescription"
                className="mt-1 w-full border rounded px-3 py-2 bg-background"
                value={editData.itemDescription || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, itemDescription: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm" htmlFor="editBeforePhotos">Before Photos</label>
              <input
                id="editBeforePhotos"
                type="file"
                accept="image/*"
                multiple
                onChange={handleEditPhotoUpload}
                className="hidden"
              />
              <div className="mt-2">
                <Button asChild>
                  <label htmlFor="editBeforePhotos" className="cursor-pointer">Upload photos</label>
                </Button>
              </div>
              {(editData.beforePhotos && editData.beforePhotos.length > 0) && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground mb-1">{editData.beforePhotos.length} photo(s)</p>
                  <div className="flex flex-wrap gap-2">
                    {editData.beforePhotos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img src={photo} alt={`Before ${index + 1}`} className="w-16 h-16 object-cover rounded border" />
                        <button
                          type="button"
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 text-xs"
                          onClick={() => removeEditPhoto(index)}
                          aria-label="Remove photo"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm" htmlFor="editAssignedTo">Assigned To</label>
                <input
                  id="editAssignedTo"
                  className="mt-1 w-full border rounded px-3 py-2 bg-background"
                  value={editData.assignedTo || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, assignedTo: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm" htmlFor="editBilling">Billing (₱)</label>
                <input
                  id="editBilling"
                  type="number"
                  className="mt-1 w-full border rounded px-3 py-2 bg-background"
                  value={editData.billing ?? ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, billing: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSaveEdit} className="flex-1">Save</Button>
              <Button variant="outline" onClick={() => setEditOpen(false)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}