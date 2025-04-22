// 'use server'
'use server';
/**
 * @fileOverview Generates a textual summary of the AI's analysis of the X-ray image.
 *
 * - generateAnalysisSummary - A function that generates the analysis summary.
 * - GenerateAnalysisSummaryInput - The input type for the generateAnalysisSummary function.
 * - GenerateAnalysisSummaryOutput - The return type for the generateAnalysisSummary function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateAnalysisSummaryInputSchema = z.object({
  analysisResults: z.string().describe('The AI analysis results of the X-ray image.'),
});
export type GenerateAnalysisSummaryInput = z.infer<typeof GenerateAnalysisSummaryInputSchema>;

const GenerateAnalysisSummaryOutputSchema = z.object({
  summary: z.string().describe('A textual summary of the AI analysis, highlighting potential issues and their severity.'),
});
export type GenerateAnalysisSummaryOutput = z.infer<typeof GenerateAnalysisSummaryOutputSchema>;

export async function generateAnalysisSummary(input: GenerateAnalysisSummaryInput): Promise<GenerateAnalysisSummaryOutput> {
  return generateAnalysisSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAnalysisSummaryPrompt',
  input: {
    schema: z.object({
      analysisResults: z.string().describe('The AI analysis results of the X-ray image.'),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('A textual summary of the AI analysis, highlighting potential issues and their severity.'),
    }),
  },
  prompt: `You are a medical expert tasked with generating a summary of an X-ray analysis.

  Summarize the following analysis results, highlighting potential issues and their severity, in a way that is easy for both doctors and patients to understand.\n\n  Analysis Results: {{{analysisResults}}}`,
});

const generateAnalysisSummaryFlow = ai.defineFlow<
  typeof GenerateAnalysisSummaryInputSchema,
  typeof GenerateAnalysisSummaryOutputSchema
>({
  name: 'generateAnalysisSummaryFlow',
  inputSchema: GenerateAnalysisSummaryInputSchema,
  outputSchema: GenerateAnalysisSummaryOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
