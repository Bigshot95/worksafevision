import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Webcam from "react-webcam";

export default function CameraCapture() {
  const [workerId, setWorkerId] = useState("");
  const [workerName, setWorkerName] = useState("");
  const [shift, setShift] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const assessmentMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest('POST', '/api/assessments', formData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Assessment Complete",
        description: "Worker safety assessment has been successfully analyzed.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/assessments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats/today'] });
      setWorkerId("");
      setWorkerName("");
      setShift("");
      setIsCameraActive(false);
    },
    onError: (error: any) => {
      toast({
        title: "Assessment Failed",
        description: error.message || "Failed to analyze worker assessment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const capturePhoto = () => {
    if (!webcamRef.current) return;
    
    if (!workerId || !workerName || !shift) {
      toast({
        title: "Missing Information",
        description: "Please fill in worker ID, name, and shift before capturing.",
        variant: "destructive",
      });
      return;
    }

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    // Convert base64 to blob
    const byteCharacters = atob(imageSrc.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });

    // Create form data
    const formData = new FormData();
    formData.append('image', blob, 'selfie.jpg');
    formData.append('workerId', workerId);
    formData.append('workerName', workerName);
    formData.append('shift', shift);

    assessmentMutation.mutate(formData);
  };

  const startCamera = () => {
    setIsCameraActive(true);
  };

  const stopCamera = () => {
    setIsCameraActive(false);
  };

  return (
    <Card data-testid="camera-capture">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Worker Selfie Capture</h3>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isCameraActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className="text-sm text-muted-foreground">
              {isCameraActive ? 'Camera Active' : 'Camera Ready'}
            </span>
          </div>
        </div>
        
        {/* Camera Preview */}
        <div className="rounded-lg border-2 border-dashed border-border aspect-square flex items-center justify-center mb-4 bg-muted">
          {isCameraActive ? (
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover rounded-lg"
              data-testid="webcam"
            />
          ) : (
            <div className="text-center">
              <i className="fas fa-camera text-6xl text-muted-foreground mb-4"></i>
              <p className="text-lg font-medium text-foreground mb-2">Position camera for selfie</p>
              <p className="text-sm text-muted-foreground mb-4">Ensure good lighting and clear view of face</p>
              <Button onClick={startCamera} data-testid="button-start-camera">
                <i className="fas fa-camera mr-2"></i>
                Start Camera
              </Button>
            </div>
          )}
        </div>
        
        {/* Worker Information */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="workerId" className="block text-sm font-medium text-foreground mb-2">
              Worker ID
            </Label>
            <Input
              id="workerId"
              type="text"
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
              placeholder="Enter worker ID"
              data-testid="input-worker-id"
            />
          </div>
          <div>
            <Label htmlFor="workerName" className="block text-sm font-medium text-foreground mb-2">
              Worker Name
            </Label>
            <Input
              id="workerName"
              type="text"
              value={workerName}
              onChange={(e) => setWorkerName(e.target.value)}
              placeholder="Enter worker name"
              data-testid="input-worker-name"
            />
          </div>
        </div>

        <div className="mb-4">
          <Label htmlFor="shift" className="block text-sm font-medium text-foreground mb-2">
            Shift
          </Label>
          <Select value={shift} onValueChange={setShift}>
            <SelectTrigger data-testid="select-shift">
              <SelectValue placeholder="Select shift" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="morning">Morning (6:00 AM - 2:00 PM)</SelectItem>
              <SelectItem value="afternoon">Afternoon (2:00 PM - 10:00 PM)</SelectItem>
              <SelectItem value="night">Night (10:00 PM - 6:00 AM)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex space-x-2">
          {isCameraActive ? (
            <>
              <Button 
                onClick={capturePhoto} 
                className="flex-1"
                disabled={assessmentMutation.isPending}
                data-testid="button-capture-analyze"
              >
                <i className="fas fa-camera mr-2"></i>
                {assessmentMutation.isPending ? 'Analyzing...' : 'Capture & Analyze'}
              </Button>
              <Button 
                variant="outline" 
                onClick={stopCamera}
                data-testid="button-stop-camera"
              >
                <i className="fas fa-stop mr-2"></i>
                Stop
              </Button>
            </>
          ) : (
            <Button onClick={startCamera} className="w-full" data-testid="button-start-camera-main">
              <i className="fas fa-camera mr-2"></i>
              Start Camera
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
