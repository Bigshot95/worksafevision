import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Sidebar from "@/components/layout/sidebar";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

export default function Dashboard() {
  const { data: todayStats } = useQuery({
    queryKey: ['/api/stats/today'],
  });

  const { data: assessments } = useQuery({
    queryKey: ['/api/assessments'],
  });

  // Process data for charts
  const statusData = [
    { name: 'Passed', value: todayStats?.passed || 0, color: '#10b981' },
    { name: 'Flagged', value: todayStats?.flagged || 0, color: '#ef4444' },
    { name: 'Rejected', value: todayStats?.rejected || 0, color: '#f59e0b' },
  ];

  return (
    <div className="min-h-screen flex bg-background" data-testid="dashboard-page">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4" data-testid="dashboard-header">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Safety Dashboard</h2>
            <p className="text-sm text-muted-foreground">Overview of workplace safety assessments and trends</p>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto" data-testid="dashboard-content">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="metric-total">
                    {todayStats?.total || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Today</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600" data-testid="metric-success-rate">
                    {todayStats?.successRate ? `${todayStats.successRate.toFixed(1)}%` : '0%'}
                  </div>
                  <p className="text-xs text-muted-foreground">Passed assessments</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Flagged Cases</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600" data-testid="metric-flagged">
                    {todayStats?.flagged || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Requiring review</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="metric-avg-confidence">
                    {todayStats?.avgConfidence ? `${todayStats.avgConfidence.toFixed(1)}%` : '0%'}
                  </div>
                  <p className="text-xs text-muted-foreground">AI assessment</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Assessment Status Distribution</CardTitle>
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

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {assessments?.slice(0, 5).map((assessment: any) => (
                      <div key={assessment.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            assessment.status === 'passed' ? 'bg-green-500' :
                            assessment.status === 'flagged' ? 'bg-red-500' : 'bg-yellow-500'
                          }`}></div>
                          <div>
                            <p className="font-medium text-sm">{assessment.workerName}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(assessment.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          assessment.status === 'passed' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : assessment.status === 'flagged'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        }`}>
                          {assessment.status.toUpperCase()}
                        </span>
                      </div>
                    )) || (
                      <p className="text-muted-foreground text-center py-8">No assessments yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
