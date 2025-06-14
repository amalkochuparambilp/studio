// Fuse face image flow
'use server';
/**
 * @fileOverview AI agent that fuses a face from one image into another.
 *
 * - fuseFaceImage - A function that fuses the face from a face image into a reference image.
 * - FuseFaceImageInput - The input type for the fuseFaceImage function.
 * - FuseFaceImageOutput - The return type for the fuseFaceImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FuseFaceImageInputSchema = z.object({
  referenceImage: z
    .string()
    .describe(
      'The reference image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
  faceImage: z
    .string()
    .describe(
      'The face image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type FuseFaceImageInput = z.infer<typeof FuseFaceImageInputSchema>;

const FuseFaceImageOutputSchema = z.object({
  fusedImage: z
    .string()
    .describe(
      'The fused image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type FuseFaceImageOutput = z.infer<typeof FuseFaceImageOutputSchema>;

export async function fuseFaceImage(input: FuseFaceImageInput): Promise<FuseFaceImageOutput> {
  return fuseFaceImageFlow(input);
}

const fuseFaceImagePrompt = ai.definePrompt({
  name: 'fuseFaceImagePrompt',
  input: {schema: FuseFaceImageInputSchema},
  output: {schema: FuseFaceImageOutputSchema},
  prompt: [
    {media: {url: '{{{referenceImage}}}'}},
    {text: 'Reference Image. Take the face from the Face Image and put the face into this image.'},
    {media: {url: '{{{faceImage}}}'}},
    {text: 'Face Image. Put the face into the Reference Image.'},
    {
      text: 'Generate the fused image.  The generated image MUST contain the face from Face Image, and it MUST be placed into the Reference Image. The output must be a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.',
    },
  ],
  config: {
    responseModalities: ['TEXT', 'IMAGE'],
  },
});

const fuseFaceImageFlow = ai.defineFlow(
  {
    name: 'fuseFaceImageFlow',
    inputSchema: FuseFaceImageInputSchema,
    outputSchema: FuseFaceImageOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: fuseFaceImagePrompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    return {fusedImage: media.url!};
  }
);
