import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';
import type { Entry } from '../App';

interface CompletedProps {
  entries: Entry[];
  onUpdateEntry: (id: string, updates: Partial<Entry>) => void;
}

export function Completed({ entries, onUpdateEntry }: CompletedProps) {
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [waiverPreviewOpen, setWaiverPreviewOpen] = useState(false);
  const [editData, setEditData] = useState<Partial<Entry>>({});
  const [sliderPosition, setSliderPosition] = useState(50);
  const [selectedBeforeIndex, setSelectedBeforeIndex] = useState(0);
  const [selectedAfterIndex, setSelectedAfterIndex] = useState(0);

  const handleViewDetails = (entry: Entry) => {
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
    setSliderPosition(50);
    setSelectedBeforeIndex(0);
    setSelectedAfterIndex(0);
    setDialogOpen(true);
  };

  const handleSaveChanges = () => {
    if (selectedEntry) {
      onUpdateEntry(selectedEntry.id, editData);
      toast.success('Changes saved successfully');
    }
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
          <CardTitle>Completed Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No completed entries found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Completed Entries</h2>
      
      <div className="grid gap-4">
        {entries.map((entry) => (
          <Card key={entry.id} className="p-4 cursor-pointer hover:bg-muted/50" onClick={() => handleViewDetails(entry)}>
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{entry.customerName}</h3>
                  <Badge>Completed</Badge>
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

                <p className="text-xs text-muted-foreground">
                  Completed: {entry.updatedAt.toLocaleDateString()}
                </p>
              </div>
              
              <Button variant="outline" onClick={(e) => { e.stopPropagation(); handleViewDetails(entry); }}>
                View Details
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Completed Entry Details - {selectedEntry?.customerName}</DialogTitle>
            <DialogDescription>
              View before/after comparison and edit details for this completed entry.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Before/After Image Comparison */}
            {selectedEntry?.beforePhotos && selectedEntry?.afterPhotos && 
             selectedEntry.beforePhotos.length > 0 && selectedEntry.afterPhotos.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium">Before & After Comparison</h4>
                
                {/* Image Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Select Before Image ({selectedEntry.beforePhotos.length} available)</Label>
                    <div className="flex gap-2 mt-2">
                      {selectedEntry.beforePhotos.map((photo, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedBeforeIndex(index)}
                          className={`w-16 h-16 rounded border-2 overflow-hidden ${
                            selectedBeforeIndex === index ? 'border-primary' : 'border-border'
                          }`}
                        >
                          <img 
                            src={photo} 
                            alt={`Before ${index + 1}`} 
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label>Select After Image ({selectedEntry.afterPhotos.length} available)</Label>
                    <div className="flex gap-2 mt-2">
                      {selectedEntry.afterPhotos.map((photo, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedAfterIndex(index)}
                          className={`w-16 h-16 rounded border-2 overflow-hidden ${
                            selectedAfterIndex === index ? 'border-primary' : 'border-border'
                          }`}
                        >
                          <img 
                            src={photo} 
                            alt={`After ${index + 1}`} 
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Slider Comparison */}
                <div className="relative w-full h-64 bg-muted rounded-lg overflow-hidden">
                  {/* Before Image */}
                  <img 
                    src={selectedEntry.beforePhotos[selectedBeforeIndex]} 
                    alt="Before service" 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  
                  {/* After Image with clipping */}
                  <div 
                    className="absolute inset-0 overflow-hidden"
                    style={{ clipPath: `polygon(${sliderPosition}% 0%, 100% 0%, 100% 100%, ${sliderPosition}% 100%)` }}
                  >
                    <img 
                      src={selectedEntry.afterPhotos[selectedAfterIndex]} 
                      alt="After service" 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Slider Handle */}
                  <div 
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize z-10"
                    style={{ left: `${sliderPosition}%` }}
                    onMouseDown={(e) => {
                      const startX = e.clientX;
                      const startPosition = sliderPosition;
                      const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                      
                      const handleMouseMove = (e: MouseEvent) => {
                        if (rect) {
                          const deltaX = e.clientX - startX;
                          const deltaPercentage = (deltaX / rect.width) * 100;
                          const newPosition = Math.min(100, Math.max(0, startPosition + deltaPercentage));
                          setSliderPosition(newPosition);
                        }
                      };
                      
                      const handleMouseUp = () => {
                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);
                      };
                      
                      document.addEventListener('mousemove', handleMouseMove);
                      document.addEventListener('mouseup', handleMouseUp);
                    }}
                  >
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Labels */}
                  <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                    Before ({selectedBeforeIndex + 1}/{selectedEntry.beforePhotos.length})
                  </div>
                  <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                    After ({selectedAfterIndex + 1}/{selectedEntry.afterPhotos.length})
                  </div>
                </div>
              </div>
            )}

            {/* Editable Details */}
            <div className="space-y-4">
              <h4 className="font-medium">Edit Details</h4>
              <div className="p-3 bg-muted rounded flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Signed Waiver</p>
                  {selectedEntry?.waiverUrl ? (
                    <p className="text-xs text-muted-foreground">Waiver uploaded</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">No waiver uploaded</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setWaiverPreviewOpen(true)}
                    disabled={!selectedEntry?.waiverUrl}
                  >
                    View Waiver
                  </Button>
                  <a
                    href={selectedEntry?.waiverUrl || '#'}
                    target="_blank"
                    rel="noreferrer"
                    aria-disabled={!selectedEntry?.waiverUrl}
                  >
                    <Button disabled={!selectedEntry?.waiverUrl}>Open in new tab</Button>
                  </a>
                </div>
              </div>
              
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
            </div>

            {/* Service Details */}
            {selectedEntry?.serviceDetails && (
              <div className="space-y-2">
                <h4 className="font-medium">Service Details</h4>
                <div className="bg-muted p-4 rounded-lg text-sm space-y-1">
                  {selectedEntry.serviceDetails.receivedBy && (
                    <p><span className="font-medium">Received by:</span> {selectedEntry.serviceDetails.receivedBy.charAt(0).toUpperCase() + selectedEntry.serviceDetails.receivedBy.slice(1)}</p>
                  )}
                  <p><span className="font-medium">Shoe Clean:</span> {selectedEntry.serviceDetails.isShoeClean}</p>
                  {selectedEntry.serviceDetails.serviceType && (
                    <p><span className="font-medium">Service Type:</span> {selectedEntry.serviceDetails.serviceType}</p>
                  )}
                  {selectedEntry.serviceDetails.basicCleaning && (
                    <p><span className="font-medium">Basic Cleaning:</span> {selectedEntry.serviceDetails.basicCleaning}</p>
                  )}
                  <p><span className="font-medium">Needs Reglue:</span> {selectedEntry.serviceDetails.needsReglue ? 'Yes' : 'No'}</p>
                  <p><span className="font-medium">Needs Paint:</span> {selectedEntry.serviceDetails.needsPaint ? 'Yes' : 'No'}</p>
                  <p><span className="font-medium">QC Passed:</span> {selectedEntry.serviceDetails.qcPassed ? 'Yes' : 'No'}</p>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveChanges} className="flex-1">
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {selectedEntry?.waiverUrl && (
        <Dialog open={waiverPreviewOpen} onOpenChange={setWaiverPreviewOpen}>
          <DialogContent className="max-w-5xl w-[90vw] h-[85vh]">
            <DialogHeader>
              <DialogTitle>Waiver Preview</DialogTitle>
            </DialogHeader>
            <div className="h-full">
              <iframe
                src={selectedEntry.waiverUrl}
                title="Waiver PDF"
                className="w-full h-[70vh] border"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}