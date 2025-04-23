'use client';

import React, {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {analyzeXrayImage} from '@/ai/flows/analyze-xray-image';
import {summarizeAnalysisResults} from '@/ai/flows/summarize-analysis-results';
import {visualizeAnalysisResults} from '@/ai/flows/visualize-analysis-results';
import {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger} from '@/components/ui/alert-dialog';
import {useToast} from "@/hooks/use-toast"
import {Copy, Download} from 'lucide-react';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";

export default function Home() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [visualizedImageUrl, setVisualizedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast()

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!imageUrl) {
      toast({
        title: "Error",
        description: "Please upload an image first.",
        variant: "destructive",
      })
      return;
    }

    setIsLoading(true);
    try {
      const analysisResult = await analyzeXrayImage({photoUrl: imageUrl});
      setAnalysis(analysisResult.analysis);

      const summaryResult = await summarizeAnalysisResults({analysisResults: analysisResult.analysis});
      setSummary(summaryResult.summary);

      const visualizedResult = await visualizeAnalysisResults({
        xrayImageUrl: imageUrl,
        analysisResults: analysisResult.analysis,
      });
      setVisualizedImageUrl(visualizedResult.visualizedImageUrl);
        toast({
        title: "Success",
        description: "Analysis complete!",
      })
    } catch (error: any) {
      console.error('Error during analysis:', error);
       toast({
        title: "Error",
        description: "An error occurred during analysis.",
         variant: "destructive",
      })
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!imageUrl || !analysis) {
       toast({
        title: "Error",
        description: "No results to download.",
        variant: "destructive",
      })
      return;
    }

    const element = document.createElement('a');
    const file = new Blob([`Image URL: ${imageUrl}\nAnalysis: ${analysis}\nSummary: ${summary}`], {
      type: 'text/plain',
    });
    element.href = URL.createObjectURL(file);
    element.download = 'xray_analysis_results.txt';
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

    const handleCopyAnalysis = () => {
    if (!analysis) {
          toast({
        title: "Error",
        description: "No analysis to copy.",
        variant: "destructive",
      })
      return;
    }

    navigator.clipboard.writeText(analysis);
     toast({
        title: "Success",
        description: "Analysis copied to clipboard!",
      })
  };
  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-8 bg-primary-color text-text-color">
      <h1 className="text-4xl font-bold mb-8 text-secondary-color">X-Ray Insights</h1>
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl">
        <Card className="w-full md:w-1/2 shadow-md rounded-lg">
          <CardHeader>
            <CardTitle>Image Upload</CardTitle>
            <CardDescription>Upload an X-ray image for analysis</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Uploaded X-ray"
                className="max-w-full max-h-64 rounded-md mb-4"
              />
            ) : (
              <div className="border-2 border-dashed border-secondary-color rounded-md p-4 text-center">
                Drag and drop your X-ray image here or click to select a file
              </div>
            )}
            <Input type="file" accept="image/*" onChange={handleImageUpload} className="mb-4" />
            <Button onClick={handleAnalyze} disabled={isLoading} className="bg-secondary-color text-primary-color hover:bg-blue-700">
              {isLoading ? 'Analyzing...' : 'Analyze Image'}
            </Button>
          </CardContent>
        </Card>
        <Card className="w-full md:w-1/2 shadow-md rounded-lg">
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>Detailed findings from the AI analysis</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {visualizedImageUrl && (
              <img
                src={visualizedImageUrl}
                alt="Visualized Analysis"
                className="max-w-full max-h-64 rounded-md mb-4"
              />
            )}
            {summary ? (
              <>
                <Textarea value={summary} readOnly className="mb-4 h-40"/>
                   <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" onClick={handleCopyAnalysis}>
                        <Copy className="h-4 w-4"/>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Copy analysis
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      Download Results
                      <Download className="ml-2 h-4 w-4"/>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will download a text file containing the image URL, analysis, and summary.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDownload}>Confirm</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            ) : (
              <div className="text-muted-foreground">No analysis yet. Upload and analyze an image to see results.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
