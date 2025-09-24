import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import type { Assessment } from "@shared/schema";

export default function AssessmentHistory() {
  const { data: assessments, isLoading } = useQuery({
    queryKey: ['/api/assessments'],
  });

  const recentAssessments = (assessments as Assessment[] || []).slice(0, 5);

  return (
    <Card data-testid="assessment-history">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Assessments</h3>
        
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-muted-foreground/20 rounded-full"></div>
                  <div className="space-y-1">
                    <div className="w-24 h-4 bg-muted-foreground/20 rounded"></div>
                    <div className="w-16 h-3 bg-muted-foreground/20 rounded"></div>
                  </div>
                </div>
                <div className="w-16 h-6 bg-muted-foreground/20 rounded"></div>
              </div>
            ))}
          </div>
        ) : recentAssessments.length === 0 ? (
          <div className="text-center py-8">
            <i className="fas fa-history text-4xl text-muted-foreground mb-4"></i>
            <p className="text-muted-foreground">No assessments yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentAssessments.map((assessment) => (
              <div key={assessment.id} className="flex items-center justify-between p-3 bg-muted rounded-lg" data-testid={`assessment-${assessment.id}`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    assessment.status === 'passed' 
                      ? 'bg-green-100 dark:bg-green-900/20' 
                      : 'bg-red-100 dark:bg-red-900/20'
                  }`}>
                    <i className={`fas ${
                      assessment.status === 'passed' 
                        ? 'fa-check text-green-600 dark:text-green-400' 
                        : 'fa-exclamation text-red-600 dark:text-red-400'
                    }`}></i>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{assessment.workerName}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(assessment.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    assessment.status === 'passed'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {assessment.status.toUpperCase()}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round(assessment.confidence)}% confidence
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
