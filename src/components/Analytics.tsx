import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { Entry } from '../App';

interface AnalyticsProps {
  entries: Entry[];
}

export function Analytics({ entries }: AnalyticsProps) {
  // Calculate various metrics from live entries
  const totalEntries = entries.length;
  const pendingEntries = entries.filter(e => e.status === 'pending').length;
  const substantialCompletionEntries = entries.filter(e => e.status === 'substantial-completion').length;
  const completedEntries = entries.filter(e => e.status === 'completed').length;

  // Calculate revenue by location
  const takeTwoEntries = entries.filter(e => e.serviceDetails?.receivedBy === 'taketwo');
  const gamevilleEntries = entries.filter(e => e.serviceDetails?.receivedBy === 'gameville');

  const calculateDailyAverage = (locationEntries: Entry[]) => {
    const totalRevenue = locationEntries.reduce((sum, entry) => 
      sum + (entry.billing || 0) + (entry.additionalBilling || 0), 0
    );
    // Assuming 30 days per month for daily average
    return totalRevenue / 30;
  };

  const taketwoDailyAverage = calculateDailyAverage(takeTwoEntries);
  const gamevilleDailyAverage = calculateDailyAverage(gamevilleEntries);
  const totalDailyAverage = taketwoDailyAverage + gamevilleDailyAverage;

  const totalRevenue = entries
    .reduce((sum, entry) => sum + (entry.billing || 0) + (entry.additionalBilling || 0), 0);

  const averageBilling = entries.length > 0 ? totalRevenue / entries.length : 0;

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
      totalEntries: takeTwoEntries.length,
      totalRevenue: takeTwoEntries.reduce((sum, entry) => 
        sum + (entry.billing || 0) + (entry.additionalBilling || 0), 0
      ),
    },
    {
      location: 'Gameville', 
      dailyAverage: gamevilleDailyAverage,
      monthlyProjected: gamevilleDailyAverage * 30,
      totalEntries: gamevilleEntries.length,
      totalRevenue: gamevilleEntries.reduce((sum, entry) => 
        sum + (entry.billing || 0) + (entry.additionalBilling || 0), 0
      ),
    }
  ];

  // Calculate weekly trend data
  const calculateWeeklyTrends = () => {
    const now = new Date();
    const weeks = Array.from({ length: 4 }, (_, i) => {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - ((i + 1) * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      
      const weekEntries = entries.filter(entry => {
        const entryDate = new Date(entry.createdAt);
        return entryDate >= weekStart && entryDate < weekEnd;
      });

      const takeTwoWeekRevenue = weekEntries
        .filter(e => e.serviceDetails?.receivedBy === 'taketwo')
        .reduce((sum, entry) => sum + (entry.billing || 0) + (entry.additionalBilling || 0), 0);

      const gamevilleWeekRevenue = weekEntries
        .filter(e => e.serviceDetails?.receivedBy === 'gameville')
        .reduce((sum, entry) => sum + (entry.billing || 0) + (entry.additionalBilling || 0), 0);

      return {
        week: `Week ${4-i}`,
        taketwo: takeTwoWeekRevenue,
        gameville: gamevilleWeekRevenue
      };
    }).reverse();

    return weeks;
  };

  const weeklyTrendData = calculateWeeklyTrends();

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

      {/* Revenue Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-blue-600">₱{taketwoDailyAverage.toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
              <p className="text-sm text-muted-foreground">TakeTwo Daily Average</p>
              <p className="text-xs text-muted-foreground mt-1">
                Total: ₱{locationData[0].totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">₱{gamevilleDailyAverage.toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
              <p className="text-sm text-muted-foreground">Gameville Daily Average</p>
              <p className="text-xs text-muted-foreground mt-1">
                Total: ₱{locationData[1].totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-purple-600">₱{totalDailyAverage.toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
              <p className="text-sm text-muted-foreground">Combined Daily Average</p>
              <p className="text-xs text-muted-foreground mt-1">
                Total: ₱{(locationData[0].totalRevenue + locationData[1].totalRevenue).toLocaleString()}
              </p>
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