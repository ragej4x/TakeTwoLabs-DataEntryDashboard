import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner@2.0.3';
import type { Entry } from '../App';

interface SubstantialCompletionProps {
  entries: Entry[];
  onUpdateEntry: (id: string, updates: Partial<Entry>) => void;
}

export function SubstantialCompletion({ entries, onUpdateEntry }: SubstantialCompletionProps) {
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editData, setEditData] = useState<Partial<Entry>>({});

  const handleEditEntry = (entry: Entry) => {
    setSelectedEntry(entry);
    setEditData({
      customerName: entry.customerName,
      customerPhone: entry.customerPhone,
      customerEmail: entry.customerEmail,
      itemDescription: entry.itemDescription,
      billing: entry.billing,
      additionalBilling: entry.additionalBilling,
      deliveryOption: entry.deliveryOption,
      deliveryAddress: entry.deliveryAddress,
      markedAs: entry.markedAs,
    });
    setDialogOpen(true);
  };

  const handleSaveChanges = () => {
    if (selectedEntry) {
      onUpdateEntry(selectedEntry.id, editData);
      toast.success('Changes saved successfully');
      setDialogOpen(false);
    }
  };

  const handleMarkAsDone = (entryId: string) => {
    onUpdateEntry(entryId, { status: 'completed' });
    toast.success('Entry marked as completed');
  };

  const getStatusBadgeVariant = (status?: string) => {
    switch (status) {
      case 'paid-delivered': return 'default';
      case 'paid': return 'secondary';
      case 'delivered': return 'outline';
      case 'in-progress': return 'destructive';
      default: return 'outline';
    }
  };

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Substantial Completion</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No entries in substantial completion stage.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Substantial Completion</h2>
      
      <div className="grid gap-4">
        {entries.map((entry) => (
          <Card key={entry.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{entry.customerName}</h3>
                  <Badge variant="outline">Substantial Complete</Badge>
                  {entry.markedAs && (
                    <Badge variant={getStatusBadgeVariant(entry.markedAs)}>
                      {entry.markedAs.replace('-', ' ').toUpperCase()}
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground">{entry.itemDescription}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Phone:</span> {entry.customerPhone || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {entry.customerEmail || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Total:</span> ₱{((entry.billing || 0) + (entry.additionalBilling || 0))}
                  </div>
                  <div>
                    <span className="font-medium">Delivery:</span> {entry.deliveryOption || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Received by:</span> {entry.serviceDetails?.receivedBy ? entry.serviceDetails.receivedBy.charAt(0).toUpperCase() + entry.serviceDetails.receivedBy.slice(1) : 'N/A'}
                  </div>
                </div>


                <div className="flex gap-4">
                  {entry.beforePhotos && entry.beforePhotos.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Before ({entry.beforePhotos.length})</p>
                      <div className="flex gap-1">
                        {entry.beforePhotos.slice(0, 2).map((photo, index) => (
                          <img 
                            key={index}
                            src={photo} 
                            alt={`Before ${index + 1}`} 
                            className="w-16 h-16 object-cover rounded border"
                          />
                        ))}
                        {entry.beforePhotos.length > 2 && (
                          <div className="w-16 h-16 bg-muted rounded border flex items-center justify-center text-xs">
                            +{entry.beforePhotos.length - 2}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {entry.afterPhotos && entry.afterPhotos.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">After ({entry.afterPhotos.length})</p>
                      <div className="flex gap-1">
                        {entry.afterPhotos.slice(0, 2).map((photo, index) => (
                          <img 
                            key={index}
                            src={photo} 
                            alt={`After ${index + 1}`} 
                            className="w-16 h-16 object-cover rounded border"
                          />
                        ))}
                        {entry.afterPhotos.length > 2 && (
                          <div className="w-16 h-16 bg-muted rounded border flex items-center justify-center text-xs">
                            +{entry.afterPhotos.length - 2}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button variant="outline" onClick={() => handleEditEntry(entry)}>
                  Edit Details
                </Button>
                <Button onClick={() => handleMarkAsDone(entry.id)}>
                  Mark as Done
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Entry Details - {selectedEntry?.customerName}</DialogTitle>
            <DialogDescription>
              Edit customer information and billing details for this entry.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editCustomerName">Customer Name</Label>
                <Input
                  id="editCustomerName"
                  value={editData.customerName || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, customerName: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="editCustomerPhone">Phone</Label>
                <Input
                  id="editCustomerPhone"
                  value={editData.customerPhone || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, customerPhone: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="editCustomerEmail">Email</Label>
              <Input
                id="editCustomerEmail"
                value={editData.customerEmail || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, customerEmail: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="editItemDescription">Item Description</Label>
              <Textarea
                id="editItemDescription"
                value={editData.itemDescription || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, itemDescription: e.target.value }))}
              />
            </div>

            {/* Billing Section */}
            <div className="p-4 bg-muted rounded-lg space-y-3">
              <h4 className="font-medium">Billing Details</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editServiceBilling">Service Bill (Peso)</Label>
                  <Input
                    id="editServiceBilling"
                    type="number"
                    value={editData.billing || ''}
                    onChange={(e) => setEditData(prev => ({ ...prev, billing: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="editAdditionalBilling">Additional Billing (Peso)</Label>
                  <Input
                    id="editAdditionalBilling"
                    type="number"
                    value={editData.additionalBilling || ''}
                    onChange={(e) => setEditData(prev => ({ ...prev, additionalBilling: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              
              <div className="border-t pt-2">
                <div className="flex justify-between items-center font-medium">
                  <Label>Total Amount:</Label>
                  <span>₱{((editData.billing || 0) + (editData.additionalBilling || 0))}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Delivery Option</Label>
                <Select 
                  value={editData.deliveryOption || ''} 
                  onValueChange={(value) => setEditData(prev => ({ ...prev, deliveryOption: value as 'pickup' | 'delivery' }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pickup">Pick Up</SelectItem>
                    <SelectItem value="delivery">Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {editData.deliveryOption === 'delivery' && (
                <div>
                  <Label htmlFor="editDeliveryAddress">Delivery Address</Label>
                  <Input
                    id="editDeliveryAddress"
                    value={editData.deliveryAddress || ''}
                    onChange={(e) => setEditData(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                  />
                </div>
              )}
            </div>

            <div>
              <Label>Marked As</Label>
              <Select 
                value={editData.markedAs || ''} 
                onValueChange={(value) => setEditData(prev => ({ ...prev, markedAs: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid-delivered">Paid & Delivered</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveChanges} className="flex-1">
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}