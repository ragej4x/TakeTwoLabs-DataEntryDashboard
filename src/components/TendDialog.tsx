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
    billing: '',
    deliveryOption: '',
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
    const { isShoeClean, serviceType, needsReglue, needsPaint, qcPassed, basicCleaning } = serviceDetails;
    
    if (isShoeClean === 'yes') {
      return qcPassed;
    } else if (isShoeClean === 'no') {
      if (basicCleaning === 'yes') {
        return qcPassed;
      } else if (basicCleaning === 'no') {
        // When basic cleaning is no, we need service type and QC to pass
        // All additional services (reglue, paint) are optional
        return serviceType && qcPassed;
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
    if (releaseData.afterPhotos.length === 0 || !releaseData.billing || !releaseData.deliveryOption) {
      toast.error('Please complete all release form fields including at least one after photo');
      return;
    }

    onUpdateEntry({
      serviceDetails,
      afterPhotos: releaseData.afterPhotos,
      billing: parseFloat(releaseData.billing),
      deliveryOption: releaseData.deliveryOption as 'pickup' | 'delivery',
      status: 'substantial-completion',
    });

    toast.success('Entry moved to Substantial Completion');
    onClose();
  };

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

          {/* Additional Services */}
          {(serviceDetails.serviceType || serviceDetails.basicCleaning === 'no') && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="needsReglue"
                  checked={serviceDetails.needsReglue}
                  onCheckedChange={(checked) => handleServiceDetailsChange('needsReglue', checked as boolean)}
                />
                <Label htmlFor="needsReglue">Does it need to be reglued?</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="needsPaint"
                  checked={serviceDetails.needsPaint}
                  onCheckedChange={(checked) => handleServiceDetailsChange('needsPaint', checked as boolean)}
                />
                <Label htmlFor="needsPaint">Shoe paint required?</Label>
              </div>
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

          <div>
            <Label htmlFor="billing">Billing (Peso)</Label>
            <Input
              id="billing"
              type="number"
              placeholder="Enter amount"
              value={releaseData.billing}
              onChange={(e) => setReleaseData(prev => ({ ...prev, billing: e.target.value }))}
            />
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

          <Button onClick={handleFinalSubmit} className="w-full">
            Done
          </Button>
        </div>
      )}
    </div>
  );
}