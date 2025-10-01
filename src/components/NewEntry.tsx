import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { toast } from 'sonner@2.0.3';
import type { Entry } from '../App';
import { uploadWaiver } from '../api';
import { PDFViewer } from './PDFViewer';

interface NewEntryProps {
  onAddEntry: (entry: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

interface ServiceOption {
  id: string;
  name: string;
  price: number;
  isVariable?: boolean; // For services that start at a price
}

const SERVICE_OPTIONS: ServiceOption[] = [
  { id: 'basic-clean', name: 'Basic Clean', price: 399 },
  { id: 'deep-clean', name: 'Deep Clean', price: 499 },
  { id: 'unyellow', name: 'Unyellow', price: 600, isVariable: true },
  { id: 'restoration', name: 'Restoration', price: 600, isVariable: true },
  { id: 'customization', name: 'Customization', price: 600, isVariable: true },
];

export function NewEntry({ onAddEntry }: NewEntryProps) {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    deliveryAddress: '',
    itemDescription: '',
    shoeCondition: '',
    waiverSigned: false,
    waiverPdf: null as File | null,
    beforePhotos: [] as string[],
    assignedTo: '',
  });

  const [selectedServices, setSelectedServices] = useState<{[key: string]: boolean}>({});
  const [servicePrices, setServicePrices] = useState<{[key: string]: number}>({});
  const [totalAmount, setTotalAmount] = useState(0);

  // Initialize service prices with default values
  useEffect(() => {
    const initialPrices: {[key: string]: number} = {};
    SERVICE_OPTIONS.forEach(service => {
      initialPrices[service.id] = service.price;
    });
    setServicePrices(initialPrices);
  }, []);

  // Calculate total amount whenever services or prices change
  useEffect(() => {
    const total = Object.entries(selectedServices).reduce((sum, [serviceId, isSelected]) => {
      if (isSelected) {
        return sum + (servicePrices[serviceId] || 0);
      }
      return sum;
    }, 0);
    setTotalAmount(total);
  }, [selectedServices, servicePrices]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => ({
      ...prev,
      [serviceId]: !prev[serviceId]
    }));
  };

  const handleServicePriceChange = (serviceId: string, price: number) => {
    setServicePrices(prev => ({
      ...prev,
      [serviceId]: price
    }));
  };

  const handleTotalAmountChange = (amount: number) => {
    setTotalAmount(amount);
  };

  const handleWaiverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (
      file.type === 'application/pdf' ||
      file.type === 'image/jpeg' ||
      file.type === 'image/png'
    )) {
      try {
        // store locally for UI, and upload to backend to get public URL
        setFormData(prev => ({ ...prev, waiverPdf: file, waiverSigned: true }));
        const { url } = await uploadWaiver(file);
        setFormData(prev => ({ ...prev, waiverPdf: file, waiverSigned: true, waiverUrl: url as any }));
        toast.success('Signed waiver uploaded successfully');
      } catch (e) {
        console.error(e);
        toast.error('Failed to upload waiver');
      }
    } else {
      toast.error('Please upload a PDF, JPEG, or PNG file');
    }
  };

  const removeWaiver = () => {
    setFormData(prev => ({ ...prev, waiverPdf: null, waiverSigned: false }));
    toast.success('Waiver removed');
  };

  const handleBeforePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newPhoto = e.target?.result as string;
          setFormData(prev => ({
            ...prev,
            beforePhotos: [...prev.beforePhotos, newPhoto]
          }));
          toast.success('Before photo added successfully');
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeBeforePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      beforePhotos: prev.beforePhotos.filter((_, i) => i !== index)
    }));
    toast.success('Photo removed');
  };

  const validateForm = () => {
    const errors: string[] = [];

    // Phone number is mandatory
    if (!formData.customerPhone.trim()) {
      errors.push('Phone number is required');
    }

    // Delivery address is mandatory
    if (!formData.deliveryAddress.trim()) {
      errors.push('Delivery address is required');
    }

    // At least one service must be selected
    const hasSelectedService = Object.values(selectedServices).some(selected => selected);
    if (!hasSelectedService) {
      errors.push('At least one service must be selected');
    }

    // Total amount must be greater than 0
    if (totalAmount <= 0) {
      errors.push('Total amount must be greater than 0');
    }

    // Require at least one before photo
    if (!formData.beforePhotos || formData.beforePhotos.length === 0) {
      errors.push('Please upload at least one before photo');
    }

    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => toast.error(error));
      return;
    }

    // Build service details string
    const selectedServiceNames = Object.entries(selectedServices)
      .filter(([_, isSelected]) => isSelected)
      .map(([serviceId, _]) => {
        const service = SERVICE_OPTIONS.find(s => s.id === serviceId);
        const price = servicePrices[serviceId];
        return `${service?.name} - ₱${price}`;
      })
      .join(', ');

    onAddEntry({
      ...formData,
      shoeService: selectedServiceNames,
      afterPhotos: [],
      status: 'pending',
      billing: totalAmount,
      deliveryAddress: formData.deliveryAddress, // Ensure delivery address is included
    });

    // Reset form
    setFormData({
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      deliveryAddress: '',
      itemDescription: '',
      shoeCondition: '',
      waiverSigned: false,
      waiverPdf: null,
      beforePhotos: [],
      assignedTo: '',
    });
    setSelectedServices({});
    setTotalAmount(0);

    toast.success('New entry created successfully');
  };

  return (
    <Card className="flex-1 p-6 transition-all duration-300">
      <CardHeader className="px-0">
        <CardTitle>New Entry</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Details */}
          <div className="space-y-4">
            <h3>Customer Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="customerPhone">Phone Number *</Label>
                <Input
                  id="customerPhone"
                  value={formData.customerPhone}
                  onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                  required
                  className={!formData.customerPhone.trim() ? 'border-destructive' : ''}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="customerEmail">Email Address</Label>
              <Input
                id="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={(e) => handleInputChange('customerEmail', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="deliveryAddress">Delivery Address *</Label>
              <Input
                id="deliveryAddress"
                value={formData.deliveryAddress}
                onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                placeholder="Enter full delivery address"
                required
                className={!formData.deliveryAddress.trim() ? 'border-destructive' : ''}
              />
            </div>
          </div>

          {/* Shoe Service Options */}
          <div className="space-y-4">
            <h3>Shoe Service Options *</h3>
            <div className="space-y-3">
              {SERVICE_OPTIONS.map((service) => (
                <div key={service.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={service.id}
                      checked={selectedServices[service.id] || false}
                      onCheckedChange={() => handleServiceToggle(service.id)}
                    />
                    <Label htmlFor={service.id} className="cursor-pointer">
                      {service.name} {service.isVariable && '(starts at)'}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>₱</span>
                    {service.isVariable ? (
                      <Input
                        type="number"
                        value={servicePrices[service.id] || service.price}
                        onChange={(e) => handleServicePriceChange(service.id, parseInt(e.target.value) || service.price)}
                        className="w-20 text-right"
                        min={service.price}
                        disabled={!selectedServices[service.id]}
                      />
                    ) : (
                      <span className="w-20 text-right">{service.price}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total Amount */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <Label htmlFor="totalAmount">Total Amount</Label>
              <div className="flex items-center space-x-2">
                <span>₱</span>
                <Input
                  id="totalAmount"
                  type="number"
                  value={totalAmount}
                  onChange={(e) => handleTotalAmountChange(parseInt(e.target.value) || 0)}
                  className="w-24 text-right"
                  min="0"
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Auto-calculated based on selected services, but can be manually adjusted
            </p>
          </div>

          {/* Item Description */}
          <div>
            <Label htmlFor="itemDescription">Item Description</Label>
            <Input
              id="itemDescription"
              value={formData.itemDescription}
              onChange={(e) => handleInputChange('itemDescription', e.target.value)}
              placeholder="Describe the shoe/item details"
            />
          </div>

          {/* Shoe Condition */}
          <div>
            <Label htmlFor="shoeCondition">Shoe Condition</Label>
            <Input
              id="shoeCondition"
              value={formData.shoeCondition}
              onChange={(e) => handleInputChange('shoeCondition', e.target.value)}
              placeholder="Describe the current condition of the shoe/item"
            />
          </div>

          {/* Before Photos Upload */}
          <div>
            <Label htmlFor="beforePhotos">Before Photos</Label>
            <Input
              id="beforePhotos"
              type="file"
              accept="image/*"
              multiple
              onChange={handleBeforePhotoUpload}
              className="cursor-pointer"
            />
            {formData.beforePhotos.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-muted-foreground mb-2">
                  {formData.beforePhotos.length} photo(s) uploaded
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {formData.beforePhotos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={photo} 
                        alt={`Before photo ${index + 1}`} 
                        className="w-full h-24 object-cover rounded border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                        onClick={() => removeBeforePhoto(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Customer Waiver Upload */}
          <div className="p-4 border border-border rounded-lg">
            <h4 className="font-medium mb-3">Customer Waiver</h4>
            <div>
              <Label htmlFor="waiverPdf">Upload Signed Waiver PDF</Label>
              <Input
                id="waiverPdf"
                type="file"
            accept="application/pdf,image/jpeg,image/png,image/jpg,image/*"
                onChange={handleWaiverUpload}
                className="cursor-pointer mt-2"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Please upload the signed customer waiver as a PDF document.
              </p>
            </div>
            
            {formData.waiverPdf && (
              <div className="mt-3 p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium">Waiver uploaded:</p>
                    <p className="text-sm text-muted-foreground">{formData.waiverPdf.name}</p>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={removeWaiver}
                  >
                    Remove
                  </Button>
                </div>
                {formData.waiverUrl && (
                  <div className="border rounded p-2">
                    <PDFViewer url={formData.waiverUrl} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Assigned To */}
          <div>
            <Label htmlFor="assignedTo">Assigned To Cleaning Service Team</Label>
            <Input
              id="assignedTo"
              value={formData.assignedTo}
              onChange={(e) => handleInputChange('assignedTo', e.target.value)}
              placeholder="Enter team member or service team name"
            />
          </div>

          <Button type="submit" className="w-full">
            Create Entry
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}