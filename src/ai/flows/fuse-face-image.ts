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

const fuseFaceImageFlow = ai.defineFlow(
  {
    name: 'fuseFaceImageFlow',
    inputSchema: FuseFaceImageInputSchema,
    outputSchema: FuseFaceImageOutputSchema,
  },
  async (input: FuseFaceImageInput): Promise<FuseFaceImageOutput> => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: [
        {media: {url: input.referenceImage}},
        {text: 'This is the reference image. The final image should use this as the scene or background.'},
        {media: {url: input.faceImage}},
        {text: 'This is the face image. Take the primary face from this image and seamlessly integrate it into the reference image. Ensure the style and lighting match the reference image.'},
        {text: 'Generate the fused image.'},
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed: No image URL was returned by the model.');
    }
    return {fusedImage: media.url};
  }
);
