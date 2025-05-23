'use server';

/**
 * @fileOverview Analyzes X-ray images for potential bone fractures or abnormalities.
 *
 * - analyzeXrayImage - A function that handles the X-ray image analysis process.
 * - AnalyzeXrayImageInput - The input type for the analyzeXrayImage function.
 * - AnalyzeXrayImageOutput - The return type for the analyzeXrayImage function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const AnalyzeXrayImageInputSchema = z.object({
  photoUrl: z.string().describe('The URL of the X-ray image.'),
});
export type AnalyzeXrayImageInput = z.infer<typeof AnalyzeXrayImageInputSchema>;

const AnalyzeXrayImageOutputSchema = z.object({
  analysis: z
    .string()
    .describe(
      'A detailed analysis of the X-ray image, including potential bone fractures, abnormalities, and other relevant observations.'
    ),
  severity: z.string().describe('The severity of the potential issues found in the X-ray image.'),
});
export type AnalyzeXrayImageOutput = z.infer<typeof AnalyzeXrayImageOutputSchema>;

export async function analyzeXrayImage(input: AnalyzeXrayImageInput): Promise<AnalyzeXrayImageOutput> {
  return analyzeXrayImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeXrayImagePrompt',
  input: {
    schema: z.object({
      photoUrl: z.string().describe('The URL of the X-ray image.'),
    }),
  },
  output: {
    schema: z.object({
      analysis: z
        .string()
        .describe(
          'A detailed analysis of the X-ray image, including potential bone fractures, abnormalities, and other relevant observations. The analysis should describe the type of scan, the body part scanned, and a detailed description of any and all findings.'
        ),
      severity: z.string().describe('The severity of the potential issues found in the X-ray image.'),
    }),
  },
  prompt: `You are an expert radiologist specializing in analyzing X-ray images for bone fractures and abnormalities.

You will use this information to analyze the X-ray image and identify any potential issues. Your analysis should describe the type of scan, the body part scanned, and a detailed description of any and all findings.

Analyze the following X-ray image and provide a detailed analysis of any potential bone fractures or abnormalities, as well as the severity of the issues found.

X-ray Image: {{media url=photoUrl}}
`,
});

const analyzeXrayImageFlow = ai.defineFlow<
  typeof AnalyzeXrayImageInputSchema,
  typeof AnalyzeXrayImageOutputSchema
>({
  name: 'analyzeXrayImageFlow',
  inputSchema: AnalyzeXrayImageInputSchema,
  outputSchema: AnalyzeXrayImageOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
