
'use server';
/**
 * @fileOverview AI agent that generates BCA project ideas.
 *
 * - generateProjectIdeas - A function that generates project ideas based on user input.
 * - GenerateProjectIdeasInput - The input type for the generateProjectIdeas function.
 * - ProjectIdea - The type for a single project idea.
 * - GenerateProjectIdeasOutput - The return type for the generateProjectIdeas function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProjectIdeasInputSchema = z.object({
  interests: z
    .string()
    .min(3, { message: "Interests must be at least 3 characters long." })
    .describe('User\'s areas of interest (e.g., web development, AI, mobile apps, data science).'),
  technologies: z
    .string()
    .optional()
    .describe('Preferred technologies or programming languages (e.g., Python, JavaScript, React, Firebase).'),
  projectType: z
    .string()
    .optional()
    .describe('Type of project (e.g., web application, mobile app, research project, utility tool).'),
  difficulty: z
    .string()
    .optional()
    .describe('Preferred difficulty level (e.g., beginner, intermediate, advanced).'),
});
export type GenerateProjectIdeasInput = z.infer<typeof GenerateProjectIdeasInputSchema>;

const ProjectIdeaSchema = z.object({
  title: z.string().describe('A catchy and descriptive title for the project idea.'),
  description: z.string().describe('A detailed description of the project, including its purpose, features, and potential scope (around 100-150 words).'),
  abstract: z.string().describe('A brief summary of the project, its main objectives, and key outcomes (approx. 50-70 words).'),
  synopsis: z.string().describe('A more detailed overview, including problem statement, proposed solution, scope, and key modules/functionalities (approx. 100-120 words).'),
  suggestedTechnologies: z.array(z.string()).describe('A list of technologies that could be used for this project.'),
  potentialChallenges: z.array(z.string()).optional().describe('Potential challenges or learning opportunities associated with the project.'),
});
export type ProjectIdea = z.infer<typeof ProjectIdeaSchema>;


const GenerateProjectIdeasOutputSchema = z.object({
  ideas: z.array(ProjectIdeaSchema).describe('A list of generated BCA project ideas.'),
});
export type GenerateProjectIdeasOutput = z.infer<typeof GenerateProjectIdeasOutputSchema>;

export async function generateProjectIdeas(input: GenerateProjectIdeasInput): Promise<GenerateProjectIdeasOutput> {
  return generateProjectIdeasFlow(input);
}

const projectIdeasPrompt = ai.definePrompt({
  name: 'projectIdeasPrompt',
  input: {schema: GenerateProjectIdeasInputSchema},
  output: {schema: GenerateProjectIdeasOutputSchema},
  prompt: `You are an experienced academic advisor specializing in guiding Bachelor of Computer Applications (BCA) students with their projects. Your goal is to provide creative, practical, and relevant project ideas tailored to their interests and skills.

Based on the student's input:
Interests: {{{interests}}}
{{#if technologies}}Preferred Technologies: {{{technologies}}}{{/if}}
{{#if projectType}}Preferred Project Type: {{{projectType}}}{{/if}}
{{#if difficulty}}Preferred Difficulty: {{{difficulty}}}{{/if}}

Please generate a list of 2-3 distinct project ideas. For each idea, provide:
1. A clear and concise **title**.
2. A detailed **description** (around 100-150 words) explaining the project's purpose, key features, and potential real-world application or learning value.
3. An **abstract** (approx. 50-70 words) summarizing the project's core objectives, methodology, and expected outcomes. It should be a condensed version of the project's essence.
4. A **synopsis** (approx. 100-120 words) that elaborates on the project. It should include a brief problem statement, the proposed solution, the scope of the project, and key modules or functionalities to be developed.
5. A list of 3-5 **suggested technologies** (languages, frameworks, tools) suitable for a BCA student to implement the project.
6. Optionally, a few (2-3) **potential challenges** or advanced features they could explore.

Ensure the ideas are suitable for a BCA curriculum, considering typical timeframes and resource availability. Focus on ideas that allow students to showcase a range of skills learned during their BCA program. Format the output according to the defined schema. Ensure the abstract and synopsis are distinct and serve their respective purposes.`,
});

const generateProjectIdeasFlow = ai.defineFlow(
  {
    name: 'generateProjectIdeasFlow',
    inputSchema: GenerateProjectIdeasInputSchema,
    outputSchema: GenerateProjectIdeasOutputSchema,
  },
  async (input) => {
    const {output} = await projectIdeasPrompt(input);
    if (!output || !output.ideas) {
      throw new Error('AI failed to generate project ideas.');
    }
    return output;
  }
);
