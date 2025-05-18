"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Save } from "lucide-react"
import { generateStory } from "@/lib/ai-actions"
import { toast } from "@/components/ui/use-toast"

const formSchema = z.object({
  theme: z.string().min(2, {
    message: "Theme must be at least 2 characters.",
  }),
  characters: z.string().min(2, {
    message: "Characters must be at least 2 characters.",
  }),
  ageGroup: z.string(),
  storyLength: z.string(),
  additionalDetails: z.string().optional(),
})

export default function AIStoryGenerator() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedStory, setGeneratedStory] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      theme: "",
      characters: "",
      ageGroup: "3-5",
      storyLength: "medium",
      additionalDetails: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsGenerating(true)
    try {
      const story = await generateStory({
        theme: values.theme,
        characters: values.characters,
        ageGroup: values.ageGroup,
        storyLength: values.storyLength,
        additionalDetails: values.additionalDetails || "",
      })

      setGeneratedStory(story)

      toast({
        title: "Story generated",
        description: "Your story has been generated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate story. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">AI Story Generator</h1>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Story Parameters</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="theme"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Theme</FormLabel>
                      <FormControl>
                        <Input placeholder="Adventure in the forest" {...field} />
                      </FormControl>
                      <FormDescription>The main theme or setting of your story.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="characters"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Characters</FormLabel>
                      <FormControl>
                        <Input placeholder="A rabbit named Hoppy, a wise owl" {...field} />
                      </FormControl>
                      <FormDescription>The main characters in your story.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="ageGroup"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age Group</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select age group" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="3-5">3-5 years</SelectItem>
                            <SelectItem value="6-8">6-8 years</SelectItem>
                            <SelectItem value="9-12">9-12 years</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>The target age group for your story.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="storyLength"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Story Length</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select length" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="short">Short (1-2 pages)</SelectItem>
                            <SelectItem value="medium">Medium (3-5 pages)</SelectItem>
                            <SelectItem value="long">Long (6-10 pages)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>The length of your story.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="additionalDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Details</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any specific elements you want in the story..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Optional details to include in your story.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isGenerating}>
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Story"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generated Story</CardTitle>
          </CardHeader>
          <CardContent>
            {generatedStory ? (
              <div className="space-y-4">
                <div className="border rounded-lg p-4 min-h-[400px] whitespace-pre-line">{generatedStory}</div>
                <div className="flex justify-end">
                  <Button>
                    <Save className="mr-2 h-4 w-4" />
                    Save to Project
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                {isGenerating ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-8 w-8 animate-spin mb-4" />
                    <p>Generating your story...</p>
                    <p className="text-sm">This may take a moment</p>
                  </div>
                ) : (
                  <p>Fill out the form and click "Generate Story" to create a story.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
