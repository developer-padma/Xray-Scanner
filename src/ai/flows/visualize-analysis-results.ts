// The content of this file should be valid typescript.
'use server';

/**
 * @fileOverview Visualizes the analysis results on the X-ray image, highlighting areas of concern.
 *
 * - visualizeAnalysisResults - A function that visualizes the analysis results on the X-ray image.
 * - VisualizeAnalysisResultsInput - The input type for the visualizeAnalysisResults function.
 * - VisualizeAnalysisResultsOutput - The return type for the visualizeAnalysisResults function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const VisualizeAnalysisResultsInputSchema = z.object({
  xrayImageUrl: z.string().describe('The URL of the X-ray image.'),
  analysisResults: z.string().describe('The analysis results in JSON format.'),
});
export type VisualizeAnalysisResultsInput = z.infer<typeof VisualizeAnalysisResultsInputSchema>;

const VisualizeAnalysisResultsOutputSchema = z.object({
  visualizedImageUrl: z.string().describe('The URL of the X-ray image with highlighted areas of concern.'),
});
export type VisualizeAnalysisResultsOutput = z.infer<typeof VisualizeAnalysisResultsOutputSchema>;

export async function visualizeAnalysisResults(input: VisualizeAnalysisResultsInput): Promise<VisualizeAnalysisResultsOutput> {
  return visualizeAnalysisResultsFlow(input);
}

const visualizeAnalysisResultsPrompt = ai.definePrompt({
  name: 'visualizeAnalysisResultsPrompt',
  input: {
    schema: z.object({
      xrayImageUrl: z.string().describe('The URL of the X-ray image.'),
      analysisResults: z.string().describe('The analysis results in JSON format.'),
    }),
  },
  output: {
    schema: z.object({
      visualizedImageUrl: z.string().describe('The URL of the X-ray image with highlighted areas of concern.'),
    }),
  },
  prompt: `You are an expert medical image analyst. Given an X-ray image URL and analysis results in JSON format, your task is to visualize the analysis results on the X-ray image, highlighting areas of concern.  Return the URL of the visualized image.

X-ray Image URL: {{{xrayImageUrl}}}
Analysis Results:
{{#if analysisResults}}
{{{analysisResults}}}
{{else}}
No analysis results provided.
{{/if}}

Ensure the visualized image clearly highlights areas of concern based on the analysis results. If no analysis results are provided, return the original image URL.
`,
});

const visualizeAnalysisResultsFlow = ai.defineFlow<
  typeof VisualizeAnalysisResultsInputSchema,
  typeof VisualizeAnalysisResultsOutputSchema
>(
  {
    name: 'visualizeAnalysisResultsFlow',
    inputSchema: VisualizeAnalysisResultsInputSchema,
    outputSchema: VisualizeAnalysisResultsOutputSchema,
  },
  async input => {
    const {output} = await visualizeAnalysisResultsPrompt(input);
    return output!;
  }
);
