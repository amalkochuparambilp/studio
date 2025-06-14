
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { generateProjectIdeas, type GenerateProjectIdeasInput, type ProjectIdea } from "@/ai/flows/generate-project-ideas-flow";
import { Loader2, LightbulbIcon, BrainIcon, CpuIcon, ShapesIcon, TrendingUpIcon, FileTextIcon, LayersIcon, ZapIcon, AlertTriangleIcon, ClipboardListIcon, AlignLeftIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const projectTypes = ["Web Application", "Mobile App", "AI/ML Project", "IoT Project", "Desktop Application", "Game Development", "Utility Tool", "Research Based"];
const difficulties = ["Beginner", "Intermediate", "Advanced"];

export default function ProjectIdeasPage() {
  const [interests, setInterests] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [projectType, setProjectType] = useState<string | undefined>(undefined);
  const [difficulty, setDifficulty] = useState<string | undefined>(undefined);
  const [projectIdeas, setProjectIdeas] = useState<ProjectIdea[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!interests.trim()) {
      toast({
        title: "Missing Information",
        description: "Please tell us about your interests.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setProjectIdeas(null);

    try {
      const input: GenerateProjectIdeasInput = {
        interests,
        technologies: technologies || undefined,
        projectType: projectType || undefined,
        difficulty: difficulty || undefined,
      };
      const result = await generateProjectIdeas(input);
      setProjectIdeas(result.ideas);
    } catch (error) {
      console.error("Error generating project ideas:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while generating ideas.";
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  if (!isClient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 flex flex-col items-center selection:bg-primary/30 selection:text-primary-foreground">
      <header className="my-8 md:my-12 text-center">
        <h1 className="text-5xl md:text-6xl font-headline text-primary mb-3 tracking-wide">BCA Project Ideas Platform</h1>
        <p className="text-lg md:text-xl font-body text-muted-foreground max-w-3xl">
          Discover innovative project ideas for your BCA studies. Tell us your interests, and let AKP DEVZ & AI spark your next big project!
        </p>
      </header>

      <Card className="w-full max-w-2xl shadow-xl rounded-xl mb-8">
        <CardHeader className="bg-card/50 p-6">
          <CardTitle className="font-headline text-2xl flex items-center text-accent-foreground">
            <BrainIcon className="mr-3 h-7 w-7 text-accent" />
            Find Your Next Project
          </CardTitle>
          <CardDescription className="font-body">Fill in your preferences to get tailored project ideas.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="interests" className="text-lg font-medium flex items-center mb-2">
                <BrainIcon className="mr-2 h-5 w-5 text-muted-foreground" /> Your Interests*
              </Label>
              <Textarea
                id="interests"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="e.g., Web Development, AI, Data Science, Cybersecurity, Mobile App Development..."
                className="min-h-[100px]"
                required
                disabled={isGenerating}
              />
               <p className="text-xs text-muted-foreground mt-1">Describe your main areas of interest. This is required.</p>
            </div>

            <div>
              <Label htmlFor="technologies" className="text-lg font-medium flex items-center mb-2">
                <CpuIcon className="mr-2 h-5 w-5 text-muted-foreground" /> Preferred Technologies (Optional)
              </Label>
              <Input
                id="technologies"
                value={technologies}
                onChange={(e) => setTechnologies(e.target.value)}
                placeholder="e.g., Python, JavaScript, React, Java, Swift, Firebase..."
                disabled={isGenerating}
              />
              <p className="text-xs text-muted-foreground mt-1">List any specific languages or tools you'd like to use.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="projectType" className="text-lg font-medium flex items-center mb-2">
                  <ShapesIcon className="mr-2 h-5 w-5 text-muted-foreground" /> Project Type (Optional)
                </Label>
                <Select value={projectType} onValueChange={setProjectType} disabled={isGenerating}>
                  <SelectTrigger id="projectType">
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="difficulty" className="text-lg font-medium flex items-center mb-2">
                  <TrendingUpIcon className="mr-2 h-5 w-5 text-muted-foreground" /> Difficulty (Optional)
                </Label>
                <Select value={difficulty} onValueChange={setDifficulty} disabled={isGenerating}>
                  <SelectTrigger id="difficulty">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map(level => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button
              type="submit"
              disabled={isGenerating || !interests.trim()}
              className="w-full px-10 py-7 text-xl font-headline rounded-lg shadow-lg transform transition-all hover:scale-105 active:scale-95 duration-200 mt-4"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-3 h-6 w-6 animate-spin" /> Generating Ideas...
                </>
              ) : (
                <>
                  <LightbulbIcon className="mr-3 h-6 w-6" /> Generate Project Ideas
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isGenerating && (
        <div className="text-center my-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground font-body">Hold tight, we're brewing up some brilliant ideas for you!</p>
        </div>
      )}

      {projectIdeas && projectIdeas.length > 0 && (
        <div className="w-full max-w-4xl mt-8 space-y-6">
          <h2 className="text-3xl font-headline text-center text-primary mb-6">Here are your Project Ideas!</h2>
          {projectIdeas.map((idea, index) => (
            <Card key={index} className="shadow-lg rounded-xl overflow-hidden transform transition-all hover:shadow-2xl duration-300">
              <CardHeader className="bg-card/50 p-5">
                <CardTitle className="font-headline text-xl md:text-2xl flex items-start text-accent-foreground">
                  <FileTextIcon className="mr-3 h-6 w-6 text-accent mt-1 flex-shrink-0" /> {idea.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div>
                  <h4 className="text-md font-semibold flex items-center mb-2 text-muted-foreground">
                    <AlignLeftIcon className="mr-2 h-5 w-5" /> Description:
                  </h4>
                  <p className="font-body text-base text-foreground/90">{idea.description}</p>
                </div>

                <div>
                  <h4 className="text-md font-semibold flex items-center mb-2 text-muted-foreground">
                    <FileTextIcon className="mr-2 h-5 w-5" /> Abstract:
                  </h4>
                  <p className="font-body text-base text-foreground/90">{idea.abstract}</p>
                </div>
                
                <div>
                  <h4 className="text-md font-semibold flex items-center mb-2 text-muted-foreground">
                    <ClipboardListIcon className="mr-2 h-5 w-5" /> Synopsis:
                  </h4>
                  <p className="font-body text-base text-foreground/90">{idea.synopsis}</p>
                </div>
                
                <div>
                  <h4 className="text-md font-semibold flex items-center mb-2 text-muted-foreground">
                    <LayersIcon className="mr-2 h-5 w-5" /> Suggested Technologies:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {idea.suggestedTechnologies.map(tech => (
                      <Badge key={tech} variant="secondary" className="font-body">{tech}</Badge>
                    ))}
                  </div>
                </div>

                {idea.potentialChallenges && idea.potentialChallenges.length > 0 && (
                  <div>
                    <h4 className="text-md font-semibold flex items-center mb-2 text-muted-foreground">
                      <ZapIcon className="mr-2 h-5 w-5" /> Potential Challenges/Features:
                    </h4>
                    <ul className="list-disc list-inside space-y-1 font-body text-sm text-foreground/80">
                      {idea.potentialChallenges.map(challenge => (
                        <li key={challenge}>{challenge}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {projectIdeas && projectIdeas.length === 0 && !isGenerating && (
         <Card className="w-full max-w-md shadow-lg rounded-xl mt-8">
            <CardContent className="p-6 text-center">
                <AlertTriangleIcon className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="text-xl font-headline mb-2">No Ideas Found</h3>
                <p className="text-muted-foreground font-body">
                    We couldn't generate ideas with the current input. Try broadening your interests or adjusting other criteria.
                </p>
            </CardContent>
        </Card>
      )}


      <footer className="mt-12 mb-6 text-center">
        <p className="text-sm font-body text-muted-foreground">
          Powered by GenAI & Next.js &bull; AKP DEVZ &copy; {isClient ? new Date().getFullYear() : ''}
        </p>
      </footer>
    </div>
  );
}
