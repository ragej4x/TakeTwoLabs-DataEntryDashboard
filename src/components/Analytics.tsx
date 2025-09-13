import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { Entry } from '../App';

interface AnalyticsProps {
  entries: Entry[];
}

export function Analytics({ entries }: AnalyticsProps) {
  // Real data from TakeTwo and Gameville based on provided spreadsheet
  const taketwoDailyAverage = 29800.00;
  const gamevilleDailyAverage = 28800.00;
  const totalDailyAverage = taketwoDailyAverage + gamevilleDailyAverage;

  // Calculate various metrics from live entries
  const totalEntries = entries.length;
  const pendingEntries = entries.filter(e => e.status === 'pending').length;
  const substantialCompletionEntries = entries.filter(e => e.status === 'substantial-completion').length;
  const completedEntries = entries.filter(e => e.status === 'completed').length;

  const totalRevenue = entries
    .filter(e => e.billing)
    .reduce((sum, entry) => sum + (entry.billing || 0), 0);

  const averageBilling = totalRevenue / entries.filter(e => e.billing).length || 0;

  // Combined revenue data from both locations
  const combinedRevenue = totalRevenue + totalDailyAverage;

  // Service type distribution
  const serviceTypes = entries.reduce((acc, entry) => {
    if (entry.shoeService) {
      acc[entry.shoeService] = (acc[entry.shoeService] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const serviceData = Object.entries(serviceTypes).map(([service, count]) => ({
    name: service.replace('-', ' ').toUpperCase(),
    value: count,
  }));

  // Status distribution for pie chart
  const statusData = [
    { name: 'Pending', value: pendingEntries, color: '#f59e0b' },
    { name: 'Substantial', value: substantialCompletionEntries, color: '#3b82f6' },
    { name: 'Completed', value: completedEntries, color: '#10b981' },
  ];

  // Location-based revenue data
  const locationData = [
    {
      location: 'TakeTwo',
      dailyAverage: taketwoDailyAverage,
      monthlyProjected: taketwoDailyAverage * 30,
      totalEntries: Math.floor(entries.filter(e => e.serviceDetails?.receivedBy === 'taketwo').length || totalEntries * 0.6),
    },
    {
      location: 'Gameville', 
      dailyAverage: gamevilleDailyAverage,
      monthlyProjected: gamevilleDailyAverage * 30,
      totalEntries: Math.floor(entries.filter(e => e.serviceDetails?.receivedBy === 'gameville').length || totalEntries * 0.4),
    }
  ];

  // Weekly trend data (sample data based on spreadsheet pattern)
  const weeklyTrendData = [
    { week: 'Week 1', taketwo: 208600, gameville: 201600 },
    { week: 'Week 2', taketwo: 215400, gameville: 196800 },
    { week: 'Week 3', taketwo: 223200, gameville: 208800 },
    { week: 'Week 4', taketwo: 201600, gameville: 187200 },
  ];

  // Delivery options
  const deliveryStats = entries
    .filter(e => e.deliveryOption)
    .reduce((acc, entry) => {
      acc[entry.deliveryOption!] = (acc[entry.deliveryOption!] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEntries}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Combined Daily Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{totalDailyAverage.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">TakeTwo + Gameville</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Billing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{averageBilling.toFixed(0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalEntries > 0 ? Math.round((completedEntries / totalEntries) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Entry Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {serviceData.map((service) => (
                <div key={service.name} className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="font-medium">{service.name}</span>
                  <Badge variant="outline">{service.value}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Location Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Location Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {locationData.map((location) => (
                <div key={location.location} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{location.location}</h4>
                    <Badge variant="outline">{location.totalEntries} entries</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Daily Average</p>
                      <p className="font-bold">₱{location.dailyAverage.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Monthly Projected</p>
                      <p className="font-bold">₱{location.monthlyProjected.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₱${value}`, 'Revenue']} />
                  <Bar dataKey="taketwo" fill="#3b82f6" name="TakeTwo" />
                  <Bar dataKey="gameville" fill="#10b981" name="Gameville" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Summary from Spreadsheet Data */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Summary (Based on Actual Data)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-blue-600">₱{taketwoDailyAverage.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">TakeTwo Daily Average</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">₱{gamevilleDailyAverage.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Gameville Daily Average</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-purple-600">₱{(taketwoDailyAverage + gamevilleDailyAverage).toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Combined Daily Total</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Pending</span>
                <Badge variant="secondary">{pendingEntries}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Substantial Completion</span>
                <Badge variant="outline">{substantialCompletionEntries}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Completed</span>
                <Badge>{completedEntries}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Pickup</span>
                <Badge variant="outline">{deliveryStats.pickup || 0}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <Badge variant="outline">{deliveryStats.delivery || 0}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}