import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import type { Assessment } from "@shared/schema";

export default function AnalysisResults() {
  const { data: assessments } = useQuery({
    queryKey: ['/api/assessments'],
  });

  const latestAssessment = assessments?.[0] as Assessment | undefined;

  if (!latestAssessment) {
    return (
      <Card data-testid="analysis-results">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">AI Analysis Results</h3>
          <div className="text-center py-8">
            <i className="fas fa-chart-line text-6xl text-muted-foreground mb-4"></i>
            <p className="text-muted-foreground">No assessments yet. Capture a worker selfie to see AI analysis results.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const analysis = latestAssessment.aiAnalysis as any;
  const isPassed = latestAssessment.status === 'passed';

  return (
    <Card data-testid="analysis-results">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">AI Analysis Results</h3>
        
        {/* Current Assessment */}
        <div className={`rounded-lg border p-4 mb-6 ${
          isPassed 
            ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
            : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isPassed ? 'bg-green-100 dark:bg-green-800' : 'bg-red-100 dark:bg-red-800'
              }`}>
                <i className={`text-xl ${
                  isPassed 
                    ? 'fas fa-check text-green-600 dark:text-green-400' 
                    : 'fas fa-exclamation text-red-600 dark:text-red-400'
                }`}></i>
              </div>
              <div>
                <h4 className={`text-lg font-semibold ${
                  isPassed ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'
                }`}>
                  {isPassed ? 'CLEARED FOR DUTY' : 'FLAGGED FOR REVIEW'}
                </h4>
                <p className={`text-sm ${
                  isPassed ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'
                }`}>
                  {isPassed ? 'No impairment indicators detected' : 'Potential safety concerns detected'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${
                isPassed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`} data-testid="confidence-score">
                {Math.round(latestAssessment.confidence)}%
              </div>
              <p className={`text-xs ${
                isPassed ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'
              }`}>
                Confidence
              </p>
            </div>
          </div>
          
          {/* Confidence Meter */}
          <div className="mb-3">
            <div className={`flex justify-between text-xs mb-1 ${
              isPassed ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'
            }`}>
              <span>Confidence Level</span>
              <span>{Math.round(latestAssessment.confidence)}%</span>
            </div>
            <div className={`w-full rounded-full h-2 ${
              isPassed ? 'bg-green-200 dark:bg-green-800' : 'bg-red-200 dark:bg-red-800'
            }`}>
              <div 
                className={`h-2 rounded-full ${
                  isPassed ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ width: `${latestAssessment.confidence}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Analysis Details */}
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground">Assessment Criteria</h4>
          
          <div className="grid grid-cols-1 gap-3">
            {analysis?.criteria && Object.entries(analysis.criteria).map(([key, value]: [string, any]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <i className={`fas ${
                    key === 'eyeMovement' ? 'fa-eye' :
                    key === 'facialExpression' ? 'fa-smile' :
                    key === 'headPosition' ? 'fa-head-side-virus' :
                    'fa-palette'
                  } text-primary`}></i>
                  <span className="text-sm font-medium text-foreground capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    value.status === 'normal' || value.status === 'stable'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {value.status?.toUpperCase() || 'UNKNOWN'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(value.score)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Worker Information */}
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Worker:</span>
            <span className="font-medium text-foreground">{latestAssessment.workerName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">ID:</span>
            <span className="font-medium text-foreground">{latestAssessment.workerId}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shift:</span>
            <span className="font-medium text-foreground capitalize">{latestAssessment.shift}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Time:</span>
            <span className="font-medium text-foreground">
              {new Date(latestAssessment.createdAt).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        {latestAssessment.status === 'flagged' && (
          <div className="mt-6 flex space-x-3">
            <Button className="flex-1" data-testid="button-approve">
              <i className="fas fa-check mr-2"></i>
              Approve
            </Button>
            <Button variant="outline" data-testid="button-flag-review">
              <i className="fas fa-flag mr-2"></i>
              Flag for Review
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
