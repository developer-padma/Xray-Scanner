// 'use server'
'use server';
/**
 * @fileOverview Summarizes the AI analysis results of an X-ray image.
 *
 * - summarizeAnalysisResults - A function that summarizes the analysis results.
 * - SummarizeAnalysisResultsInput - The input type for the summarizeAnalysisResults function.
 * - SummarizeAnalysisResultsOutput - The return type for the summarizeAnalysisResults function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SummarizeAnalysisResultsInputSchema = z.object({
  analysisResults: z.string().describe('The AI analysis results of the X-ray image.'),
});
export type SummarizeAnalysisResultsInput = z.infer<typeof SummarizeAnalysisResultsInputSchema>;

const SummarizeAnalysisResultsOutputSchema = z.object({
  summary: z.string().describe('A textual summary of the AI analysis results, including potential issues and their severity.'),
});
export type SummarizeAnalysisResultsOutput = z.infer<typeof SummarizeAnalysisResultsOutputSchema>;

export async function summarizeAnalysisResults(input: SummarizeAnalysisResultsInput): Promise<SummarizeAnalysisResultsOutput> {
  return summarizeAnalysisResultsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeAnalysisResultsPrompt',
  input: {
    schema: z.object({
      analysisResults: z.string().describe('The AI analysis results of the X-ray image.'),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('A textual summary of the AI analysis results, including potential issues and their severity.'),
    }),
  },
  prompt: `You are a medical expert summarizing X-ray analysis results.

  Summarize the following analysis results, including potential issues and their severity, in a way that is easy for both doctors and patients to understand.\n\n  Analysis Results: {{{analysisResults}}}`,
});

const summarizeAnalysisResultsFlow = ai.defineFlow<
  typeof SummarizeAnalysisResultsInputSchema,
  typeof SummarizeAnalysisResultsOutputSchema
>({
  name: 'summarizeAnalysisResultsFlow',
  inputSchema: SummarizeAnalysisResultsInputSchema,
  outputSchema: SummarizeAnalysisResultsOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
