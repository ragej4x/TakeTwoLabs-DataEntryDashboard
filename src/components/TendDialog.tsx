import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { toast } from 'sonner@2.0.3';
import type { Entry } from '../App';

interface TendDialogProps {
  entry: Entry;
  onUpdateEntry: (updates: Partial<Entry>) => void;
  onClose: () => void;
}

export function TendDialog({ entry, onUpdateEntry, onClose }: TendDialogProps) {
  const [serviceDetails, setServiceDetails] = useState({
    isShoeClean: '',
    serviceType: '',
    needsReglue: false,
    needsPaint: false,
    qcPassed: false,
    basicCleaning: '',
    receivedBy: '',
  });

  const [showBasicCleaning, setShowBasicCleaning] = useState(false);
  const [showReleaseForm, setShowReleaseForm] = useState(false);
  const [releaseData, setReleaseData] = useState({
    afterPhotos: [] as string[],
    additionalBilling: entry.additionalBilling?.toString() || '',
    deliveryOption: entry.deliveryOption || '',
    deliveryAddress: entry.deliveryAddress || '',
  });

  const handleServiceDetailsChange = (field: string, value: string | boolean) => {
    setServiceDetails(prev => ({ ...prev, [field]: value }));
    
    if (field === 'isShoeClean' && value === 'no') {
      setShowBasicCleaning(true);
    } else if (field === 'isShoeClean' && value === 'yes') {
      setShowBasicCleaning(false);
    }
  };

  const checkIfCanRelease = () => {
    const { isShoeClean, serviceType, qcPassed, basicCleaning, receivedBy } = serviceDetails;
    
    // Must have receivedBy filled
    if (!receivedBy) {
      return false;
    }
    
    // Must have isShoeClean answered
    if (!isShoeClean) {
      return false;
    }
    
    if (isShoeClean === 'yes') {
      // If shoe is clean, just need QC to pass
      return qcPassed;
    } else if (isShoeClean === 'no') {
      if (basicCleaning === 'yes') {
        // If basic cleaning is yes, just need QC to pass
        return qcPassed;
      } else if (basicCleaning === 'no') {
        // When basic cleaning is no, we need service type and QC to pass
        return serviceType && qcPassed;
      } else {
        // basicCleaning not answered yet
        return false;
      }
    }
    return false;
  };

  const handleRelease = () => {
    if (checkIfCanRelease()) {
      setShowReleaseForm(true);
    } else {
      toast.error('Please complete all required service steps before release');
    }
  };

  const handleAfterPhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newPhoto = e.target?.result as string;
          setReleaseData(prev => ({
            ...prev,
            afterPhotos: [...prev.afterPhotos, newPhoto]
          }));
          toast.success('After photo added successfully');
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeAfterPhoto = (index: number) => {
    setReleaseData(prev => ({
      ...prev,
      afterPhotos: prev.afterPhotos.filter((_, i) => i !== index)
    }));
    toast.success('Photo removed');
  };

  const handleFinalSubmit = () => {
    console.log('Final submit clicked'); // Debug log
    
    // Validate required fields
    if (releaseData.afterPhotos.length === 0) {
      toast.error('Please upload at least one after photo');
      return;
    }

    if (!releaseData.deliveryOption) {
      toast.error('Please select a delivery option');
      return;
    }

    // Validate delivery address if delivery option is selected
    if (releaseData.deliveryOption === 'delivery' && !releaseData.deliveryAddress.trim()) {
      toast.error('Delivery address is required when delivery option is selected');
      return;
    }

    // Create the updates object with all necessary data
    const updates: Partial<Entry> = {
      serviceDetails: {
        ...serviceDetails,
        isShoeClean: serviceDetails.isShoeClean,
        serviceType: serviceDetails.serviceType,
        needsReglue: serviceDetails.needsReglue,
        needsPaint: serviceDetails.needsPaint,
        qcPassed: serviceDetails.qcPassed,
        basicCleaning: serviceDetails.basicCleaning,
        receivedBy: serviceDetails.receivedBy,
      },
      afterPhotos: releaseData.afterPhotos,
      deliveryOption: releaseData.deliveryOption as 'pickup' | 'delivery',
      status: 'substantial-completion',
    };

    // Add additional billing if provided
    if (releaseData.additionalBilling.trim()) {
      updates.additionalBilling = parseFloat(releaseData.additionalBilling) || 0;
    }

    // Update delivery address if delivery option is selected
    if (releaseData.deliveryOption === 'delivery') {
      updates.deliveryAddress = releaseData.deliveryAddress;
    }

    console.log('Submitting updates:', updates); // Debug log

    onUpdateEntry(updates);
    toast.success('Entry moved to Substantial Completion');
    onClose();
  };

  const canSubmit = releaseData.afterPhotos.length > 0 && 
                   releaseData.deliveryOption && 
                   (releaseData.deliveryOption === 'pickup' || releaseData.deliveryAddress.trim());

  return (
    <div className="space-y-6">
      {/* Current Entry Info */}
      <div className="p-4 bg-muted rounded-lg">
        <h4 className="font-medium mb-2">Current Entry</h4>
        <p><span className="font-medium">Customer:</span> {entry.customerName}</p>
        <p><span className="font-medium">Item:</span> {entry.itemDescription}</p>
        <p><span className="font-medium">Service:</span> {entry.shoeService}</p>
      </div>

      {!showReleaseForm ? (
        <div className="space-y-4">
          {/* Received by */}
          <div>
            <Label>Received by</Label>
            <Select 
              value={serviceDetails.receivedBy} 
              onValueChange={(value) => handleServiceDetailsChange('receivedBy', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select receiver" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="taketwo">TakeTwo</SelectItem>
                <SelectItem value="gameville">Gameville</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Is shoe clean? */}
          <div>
            <Label>Is the shoe clean?</Label>
            <Select 
              value={serviceDetails.isShoeClean} 
              onValueChange={(value) => handleServiceDetailsChange('isShoeClean', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* If No - Service Type */}
          {serviceDetails.isShoeClean === 'no' && !showBasicCleaning && (
            <div>
              <Label>Select type of service</Label>
              <Select 
                value={serviceDetails.serviceType} 
                onValueChange={(value) => handleServiceDetailsChange('serviceType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="restoration">Restoration</SelectItem>
                  <SelectItem value="deep-cleaning">Deep Cleaning</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Basic Cleaning Option */}
          {showBasicCleaning && (
            <div>
              <Label>Basic cleaning?</Label>
              <Select 
                value={serviceDetails.basicCleaning} 
                onValueChange={(value) => handleServiceDetailsChange('basicCleaning', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Additional Service Requirements - Always Visible */}
          <div className="space-y-4">
            <h4 className="font-medium">Additional Service Requirements</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                <Checkbox
                  id="needsReglue"
                  checked={serviceDetails.needsReglue}
                  onCheckedChange={(checked) => handleServiceDetailsChange('needsReglue', checked as boolean)}
                />
                <Label htmlFor="needsReglue" className="cursor-pointer">
                  Does it need to be reglued?
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                <Checkbox
                  id="needsPaint"
                  checked={serviceDetails.needsPaint}
                  onCheckedChange={(checked) => handleServiceDetailsChange('needsPaint', checked as boolean)}
                />
                <Label htmlFor="needsPaint" className="cursor-pointer">
                  Shoe paint required?
                </Label>
              </div>
            </div>
          </div>

          {/* Additional Services - Conditional (keeping for backwards compatibility) */}
          {(serviceDetails.serviceType || serviceDetails.basicCleaning === 'no') && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                The above additional services can be selected as needed
              </p>
            </div>
          )}

          {/* QC Pass */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="qcPassed"
              checked={serviceDetails.qcPassed}
              onCheckedChange={(checked) => handleServiceDetailsChange('qcPassed', checked as boolean)}
            />
            <Label htmlFor="qcPassed">QC Pass</Label>
          </div>

          <Button 
            onClick={handleRelease} 
            className="w-full"
            disabled={!checkIfCanRelease()}
          >
            {checkIfCanRelease() ? 'Release Shoes' : 'Complete Service Steps First'}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <h4 className="font-medium">Release Form</h4>
          
          <div>
            <Label htmlFor="afterPhotos">Take photos of the shoes (After)</Label>
            <Input
              id="afterPhotos"
              type="file"
              accept="image/*"
              multiple
              onChange={handleAfterPhotoUpload}
              className="cursor-pointer"
            />
            {releaseData.afterPhotos.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-muted-foreground mb-2">
                  {releaseData.afterPhotos.length} photo(s) uploaded
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {releaseData.afterPhotos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={photo} 
                        alt={`After photo ${index + 1}`} 
                        className="w-full h-24 object-cover rounded border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                        onClick={() => removeAfterPhoto(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Billing Summary */}
          <div className="p-4 bg-muted rounded-lg space-y-3">
            <h4 className="font-medium">Billing Summary</h4>
            
            <div className="flex justify-between items-center">
              <Label>Service Bill Total:</Label>
              <span className="font-medium">₱{entry.billing || 0}</span>
            </div>
            
            <div>
              <Label htmlFor="additionalBilling">Additional Billing (Peso)</Label>
              <Input
                id="additionalBilling"
                type="number"
                placeholder="Enter additional amount (optional)"
                value={releaseData.additionalBilling}
                onChange={(e) => setReleaseData(prev => ({ ...prev, additionalBilling: e.target.value }))}
              />
            </div>
            
            <div className="border-t pt-2">
              <div className="flex justify-between items-center font-medium">
                <Label>Total Amount:</Label>
                <span>₱{(entry.billing || 0) + (parseFloat(releaseData.additionalBilling) || 0)}</span>
              </div>
            </div>
          </div>

          <div>
            <Label>Delivery Option</Label>
            <Select 
              value={releaseData.deliveryOption} 
              onValueChange={(value) => setReleaseData(prev => ({ ...prev, deliveryOption: value }))}
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

          {/* Delivery Address Verification */}
          {releaseData.deliveryOption === 'delivery' && (
            <div>
              <Label htmlFor="deliveryAddress">Delivery Address *</Label>
              <Input
                id="deliveryAddress"
                value={releaseData.deliveryAddress}
                onChange={(e) => setReleaseData(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                placeholder="Verify and edit delivery address"
                className={!releaseData.deliveryAddress.trim() ? 'border-destructive' : ''}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Address from New Entry. Please verify and edit if needed.
              </p>
            </div>
          )}

          {/* Form Validation Messages */}
          <div className="space-y-2">
            {releaseData.afterPhotos.length === 0 && (
              <p className="text-sm text-destructive">⚠️ Please upload at least one after photo</p>
            )}
            {!releaseData.deliveryOption && (
              <p className="text-sm text-destructive">⚠️ Please select a delivery option</p>
            )}
            {releaseData.deliveryOption === 'delivery' && !releaseData.deliveryAddress.trim() && (
              <p className="text-sm text-destructive">⚠️ Please enter a delivery address</p>
            )}
            
            <Button 
              onClick={handleFinalSubmit} 
              className="w-full"
              disabled={!canSubmit}
            >
              {!canSubmit 
                ? (releaseData.afterPhotos.length === 0 ? 'Upload Photos First' : 
                   !releaseData.deliveryOption ? 'Select Delivery Option' : 'Enter Delivery Address')
                : 'Done'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}