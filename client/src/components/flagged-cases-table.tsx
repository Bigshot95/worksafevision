import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Assessment } from "@shared/schema";

interface FlaggedCasesTableProps {
  showAllCases?: boolean;
}

export default function FlaggedCasesTable({ showAllCases = false }: FlaggedCasesTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: flaggedAssessments, isLoading } = useQuery({
    queryKey: ['/api/assessments/status/flagged'],
  });

  const updateAssessmentMutation = useMutation({
    mutationFn: async ({ id, status, reviewedBy }: { id: string; status: string; reviewedBy: string }) => {
      const response = await apiRequest('PATCH', `/api/assessments/${id}`, {
        status,
        reviewedBy,
        reviewedAt: new Date().toISOString(),
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Assessment Updated",
        description: `Assessment has been ${variables.status === 'passed' ? 'approved' : 'rejected'}.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/assessments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/assessments/status/flagged'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats/today'] });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update assessment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (id: string) => {
    updateAssessmentMutation.mutate({
      id,
      status: 'passed',
      reviewedBy: 'Admin User',
    });
  };

  const handleReject = (id: string) => {
    updateAssessmentMutation.mutate({
      id,
      status: 'rejected',
      reviewedBy: 'Admin User',
    });
  };

  const assessmentsToShow = (flaggedAssessments as Assessment[] || []).slice(0, showAllCases ? undefined : 10);

  return (
    <Card data-testid="flagged-cases-table">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">
            {showAllCases ? 'All Flagged Cases' : 'Flagged Cases - Admin Review'}
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Auto-refresh:</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between p-4 border border-border rounded-lg animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-muted-foreground/20 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="w-32 h-4 bg-muted-foreground/20 rounded"></div>
                    <div className="w-24 h-3 bg-muted-foreground/20 rounded"></div>
                  </div>
                </div>
                <div className="w-20 h-6 bg-muted-foreground/20 rounded"></div>
              </div>
            ))}
          </div>
        ) : assessmentsToShow.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-check-circle text-6xl text-green-500 mb-4"></i>
            <h4 className="text-lg font-semibold text-foreground mb-2">No Flagged Cases</h4>
            <p className="text-muted-foreground">All assessments are currently clear. Great work!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Worker</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Time</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Confidence</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Issues Detected</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assessmentsToShow.map((assessment) => {
                  const analysis = assessment.aiAnalysis as any;
                  const issues = analysis?.detectedIssues || [];
                  
                  return (
                    <tr key={assessment.id} className="border-b border-border hover:bg-muted/50" data-testid={`flagged-case-${assessment.id}`}>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-secondary-foreground">
                              {assessment.workerName.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{assessment.workerName}</p>
                            <p className="text-xs text-muted-foreground">ID: {assessment.workerId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {new Date(assessment.createdAt).toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-sm font-medium ${
                          assessment.confidence >= 80 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {Math.round(assessment.confidence)}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {issues.slice(0, 3).map((issue: string, index: number) => (
                            <span
                              key={index}
                              className={`text-xs px-2 py-1 rounded-full font-medium ${
                                assessment.confidence >= 80
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                              }`}
                            >
                              {issue}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          analysis?.riskLevel === 'high'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
                        }`}>
                          {analysis?.riskLevel === 'high' ? 'HIGH RISK' : 'PENDING REVIEW'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleApprove(assessment.id)}
                            disabled={updateAssessmentMutation.isPending}
                            className="text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20"
                            data-testid={`button-approve-${assessment.id}`}
                          >
                            <i className="fas fa-check text-sm"></i>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReject(assessment.id)}
                            disabled={updateAssessmentMutation.isPending}
                            className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20"
                            data-testid={`button-reject-${assessment.id}`}
                          >
                            <i className="fas fa-times text-sm"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
