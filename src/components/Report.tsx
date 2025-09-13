import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { CalendarIcon, Download } from 'lucide-react';
import type { Entry } from '../App';

interface ReportProps {
  entries: Entry[];
}

export function Report({ entries }: ReportProps) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterService, setFilterService] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filter entries based on selected criteria
  const filteredEntries = entries.filter(entry => {
    let statusMatch = filterStatus === 'all' || entry.status === filterStatus;
    let serviceMatch = filterService === 'all' || entry.shoeService === filterService;
    
    let dateMatch = true;
    if (startDate) {
      dateMatch = dateMatch && entry.createdAt >= new Date(startDate);
    }
    if (endDate) {
      dateMatch = dateMatch && entry.createdAt <= new Date(endDate);
    }

    return statusMatch && serviceMatch && dateMatch;
  });

  // Get unique service types for filter
  const serviceTypes = [...new Set(entries.map(e => e.shoeService).filter(Boolean))];

  // Calculate summary statistics for filtered data
  const totalRevenue = filteredEntries
    .filter(e => e.billing)
    .reduce((sum, entry) => sum + (entry.billing || 0), 0);

  const exportToCSV = () => {
    const headers = [
      'Date Created',
      'Customer Name',
      'Phone',
      'Email',
      'Item Description',
      'Service Type',
      'Status',
      'Billing',
      'Delivery Option',
      'Marked As',
      'Assigned To'
    ];

    const csvData = filteredEntries.map(entry => [
      entry.createdAt.toLocaleDateString(),
      entry.customerName,
      entry.customerPhone || '',
      entry.customerEmail || '',
      entry.itemDescription,
      entry.shoeService || '',
      entry.status,
      entry.billing || '',
      entry.deliveryOption || '',
      entry.markedAs || '',
      entry.assignedTo || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `take-two-labs-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'substantial-completion': return 'outline';
      case 'completed': return 'default';
      default: return 'outline';
    }
  };

  const getMarkedAsBadgeVariant = (status?: string) => {
    switch (status) {
      case 'paid-delivered': return 'default';
      case 'paid': return 'secondary';
      case 'delivered': return 'outline';
      case 'in-progress': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Reports</h2>
        <Button onClick={exportToCSV} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="substantial-completion">Substantial Completion</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Service Type</Label>
              <Select value={filterService} onValueChange={setFilterService}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  {serviceTypes.map(service => (
                    <SelectItem key={service} value={service!}>
                      {service!.replace('-', ' ').toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Filtered Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredEntries.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredEntries.filter(e => e.status === 'completed').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Billing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₱{filteredEntries.filter(e => e.billing).length > 0 
                ? Math.round(totalRevenue / filteredEntries.filter(e => e.billing).length) 
                : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Entry Details ({filteredEntries.length} records)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Billing</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead>Marked As</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-mono text-sm">
                      {entry.createdAt.toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{entry.customerName}</div>
                        <div className="text-sm text-muted-foreground">{entry.customerPhone}</div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={entry.itemDescription}>
                        {entry.itemDescription}
                      </div>
                    </TableCell>
                    <TableCell>
                      {entry.shoeService ? (
                        <Badge variant="outline">
                          {entry.shoeService.replace('-', ' ').toUpperCase()}
                        </Badge>
                      ) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(entry.status)}>
                        {entry.status.replace('-', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {entry.billing ? `₱${entry.billing}` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {entry.deliveryOption ? (
                        <Badge variant="outline">
                          {entry.deliveryOption.toUpperCase()}
                        </Badge>
                      ) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {entry.markedAs ? (
                        <Badge variant={getMarkedAsBadgeVariant(entry.markedAs)}>
                          {entry.markedAs.replace('-', ' ').toUpperCase()}
                        </Badge>
                      ) : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredEntries.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No entries match the selected filters.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}