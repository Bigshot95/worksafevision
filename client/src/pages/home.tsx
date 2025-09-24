import { Card, CardContent } from "@/components/ui/card";
import Sidebar from "@/components/layout/sidebar";
import CameraCapture from "@/components/camera-capture";
import AnalysisResults from "@/components/analysis-results";
import AssessmentHistory from "@/components/assessment-history";
import FlaggedCasesTable from "@/components/flagged-cases-table";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  const { data: todayStats } = useQuery({
    queryKey: ['/api/stats/today'],
  });

  return (
    <div className="min-h-screen flex bg-background" data-testid="home-page">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4" data-testid="header">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Worker Safety Assessment</h2>
              <p className="text-sm text-muted-foreground">Capture and analyze worker selfies for safety compliance</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1 bg-muted rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">Gemini AI Active</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto" data-testid="main-content">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <CameraCapture />
                <AssessmentHistory />
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <AnalysisResults />
                
                {/* Daily Statistics */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Today's Statistics</h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-green-600" data-testid="stats-passed">
                          {todayStats?.passed || 0}
                        </div>
                        <p className="text-sm text-green-600">Passed</p>
                      </div>
                      <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-red-600" data-testid="stats-flagged">
                          {todayStats?.flagged || 0}
                        </div>
                        <p className="text-sm text-red-600">Flagged</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Success Rate</span>
                        <span className="font-medium text-foreground" data-testid="stats-success-rate">
                          {todayStats?.successRate ? `${todayStats.successRate.toFixed(1)}%` : '0%'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Average Confidence</span>
                        <span className="font-medium text-foreground" data-testid="stats-avg-confidence">
                          {todayStats?.avgConfidence ? `${todayStats.avgConfidence.toFixed(1)}%` : '0%'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Assessments</span>
                        <span className="font-medium text-foreground" data-testid="stats-total">
                          {todayStats?.total || 0}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Flagged Cases Section */}
            <div className="mt-8">
              <FlaggedCasesTable />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
