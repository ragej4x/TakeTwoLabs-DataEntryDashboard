import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { toast } from 'sonner@2.0.3';
import type { Entry } from '../App';

interface NewEntryProps {
  onAddEntry: (entry: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export function NewEntry({ onAddEntry }: NewEntryProps) {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    itemDescription: '',
    shoeCondition: '',
    shoeService: '',
    waiverSigned: false,
    waiverPdf: null as File | null,
    beforePhotos: [] as string[],
    assignedTo: '',
  });

  const [showShoeService, setShowShoeService] = useState(false);
  const [showWaiverSign, setShowWaiverSign] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleShoeConditionChange = (value: string) => {
    handleInputChange('shoeCondition', value);
    if (value.trim()) {
      setShowShoeService(true);
    } else {
      setShowShoeService(false);
      setShowWaiverSign(false);
    }
  };

  const handleShoeServiceChange = (value: string) => {
    handleInputChange('shoeService', value);
    setShowWaiverSign(true);
  };

  const handleWaiverUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setFormData(prev => ({ ...prev, waiverPdf: file, waiverSigned: true }));
      toast.success('Signed waiver PDF uploaded successfully');
    } else {
      toast.error('Please upload a PDF file');
    }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.itemDescription) {
      toast.error('Please fill in required fields');
      return;
    }

    onAddEntry({
      ...formData,
      afterPhotos: [],
      status: 'pending',
    });

    // Reset form
    setFormData({
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      itemDescription: '',
      shoeCondition: '',
      shoeService: '',
      waiverSigned: false,
      waiverPdf: null,
      beforePhotos: [],
      assignedTo: '',
    });
    setShowShoeService(false);
    setShowWaiverSign(false);

    toast.success('New entry created successfully');
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>New Entry</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Details */}
          <div className="space-y-4">
            <h3 className="font-medium">Customer Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="customerPhone">Phone Number</Label>
                <Input
                  id="customerPhone"
                  value={formData.customerPhone}
                  onChange={(e) => handleInputChange('customerPhone', e.target.value)}
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
          </div>

          {/* Item Description */}
          <div>
            <Label htmlFor="itemDescription">Item Description *</Label>
            <Textarea
              id="itemDescription"
              value={formData.itemDescription}
              onChange={(e) => handleInputChange('itemDescription', e.target.value)}
              placeholder="Describe the shoe/item details"
              required
            />
          </div>

          {/* Shoe Condition */}
          <div>
            <Label htmlFor="shoeCondition">Shoe Condition</Label>
            <Textarea
              id="shoeCondition"
              value={formData.shoeCondition}
              onChange={(e) => handleShoeConditionChange(e.target.value)}
              placeholder="Describe the current condition of the shoe/item"
            />
          </div>

          {/* Shoe Service Selection */}
          {showShoeService && (
            <div>
              <Label>Shoe Service Selection</Label>
              <Select value={formData.shoeService} onValueChange={handleShoeServiceChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="restoration">Restoration</SelectItem>
                  <SelectItem value="deep-cleaning">Deep Cleaning</SelectItem>
                  <SelectItem value="basic-cleaning">Basic Cleaning</SelectItem>
                  <SelectItem value="reglue">Reglue Service</SelectItem>
                  <SelectItem value="paint-touch-up">Paint Touch Up</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Customer Waiver */}
          {showWaiverSign && !formData.waiverSigned && (
            <div className="p-4 border border-border rounded-lg">
              <h4 className="font-medium mb-2">Customer Waiver</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Upload the signed customer waiver PDF document.
              </p>
              <Input
                type="file"
                accept=".pdf"
                onChange={handleWaiverUpload}
                className="cursor-pointer"
              />
            </div>
          )}

          {formData.waiverSigned && formData.waiverPdf && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">
                <span className="font-medium">Waiver uploaded:</span> {formData.waiverPdf.name}
              </p>
            </div>
          )}

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

          {/* Assigned To */}
          {formData.waiverSigned && (
            <div>
              <Label htmlFor="assignedTo">Assigned To Cleaning Service Team</Label>
              <Input
                id="assignedTo"
                value={formData.assignedTo}
                onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                placeholder="Enter team member or service team name"
              />
            </div>
          )}

          <Button type="submit" className="w-full">
            Create Entry
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}