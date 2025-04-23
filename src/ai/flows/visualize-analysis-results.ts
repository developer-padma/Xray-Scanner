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
      analysisResults: z.string().describe('The analysis results in JSON format.  If the image cannot be processed with the analysis results, it will be omitted.'),
      includeAnalysisResults: z.boolean().describe('Whether the analysis results can be passed to the model'),
    }),
  },
  output: {
    schema: z.object({
      visualizedImageUrl: z.string().describe('The URL of the X-ray image with highlighted areas of concern.'),
    }),
  },
  prompt: `You are an expert medical image analyst. Given an X-ray image URL, your task is to visualize the X-ray image, highlighting areas of concern.  If no analysis results are provided, return the original image URL.
      
X-ray Image URL: {{{xrayImageUrl}}}
{{#if includeAnalysisResults}}
Analysis Results:
{{{analysisResults}}}
{{else}}
Analysis Results: The analysis results were omitted to avoid exceeding the token limit.
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
    const combinedLength = input.xrayImageUrl.length + input.analysisResults.length;
    const tokenLimit = 900000; // Reduced limit to provide a safety margin

    let includeAnalysisResults = true;
    if (combinedLength > tokenLimit) {
      console.warn('Combined input length exceeds token limit. Omitting analysis results.');
      includeAnalysisResults = false;
    }

    const {output} = await visualizeAnalysisResultsPrompt({
      xrayImageUrl: input.xrayImageUrl,
      analysisResults: input.analysisResults,
      includeAnalysisResults,
    });
    return output!;
  }
);
