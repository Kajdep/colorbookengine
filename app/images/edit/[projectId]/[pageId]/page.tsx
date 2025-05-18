"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download, Loader2, Save } from "lucide-react"
import { generateImage } from "@/lib/ai-actions"
import { getProject, updateProject } from "@/lib/actions"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"

const formSchema = z.object({
  prompt: z.string().min(10, {
    message: "Prompt must be at least 10 characters.",
  }),
  style: z.string(),
  lineWeight: z.number().min(1).max(10),
  complexity: z.number().min(1).max(10),
  characters: z.string(),
})

export default function EditImagePage({ params }: { params: { projectId: string; pageId: string } }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [project, setProject] = useState<any>(null)
  const [page, setPage] = useState<any>(null)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      style: "cartoon",
      lineWeight: 5,
      complexity: 5,
      characters: "",
    },
  })

  useEffect(() => {
    async function loadProject() {
      try {
        const projectData = await getProject(params.projectId)
        if (!projectData) {
          toast({
            title: "Error",
            description: "Project not found.",
            variant: "destructive",
          })
          router.push("/projects")
          return
        }

        setProject(projectData)
        const coloringPage = projectData.pages.find((p: any) => p.id === params.pageId && p.type === "coloring")

        if (!coloringPage) {
          toast({
            title: "Error",
            description: "Coloring page not found.",
            variant: "destructive",
          })
          router.push(`/projects/${params.projectId}`)
          return
        }

        setPage(coloringPage)
        setGeneratedImage(coloringPage.content.imageUrl)

        form.reset({
          prompt: coloringPage.content.prompt,
          style: coloringPage.content.style,
          lineWeight: coloringPage.content.generationParams.lineWeight,
          complexity: coloringPage.content.generationParams.complexity,
          characters: coloringPage.content.characters.join(", "),
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load project data.",
          variant: "destructive",
        })
      }
    }

    loadProject()
  }, [params.projectId, params.pageId, router, form])

  async function onGenerate(values: z.infer<typeof formSchema>) {
    setIsGenerating(true)
    try {
      const imageUrl = await generateImage({
        prompt: values.prompt,
        style: values.style,
        lineWeight: values.lineWeight,
        complexity: values.complexity,
      })

      setGeneratedImage(imageUrl)

      toast({
        title: "Image generated",
        description: "Your coloring page has been generated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  async function onSave() {
    if (!project || !page || !generatedImage) {
      toast({
        title: "Error",
        description: "Project, page, and generated image are required.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const values = form.getValues()

      // Create updated page
      const updatedPage = {
        ...page,
        content: {
          imageUrl: generatedImage,
          prompt: values.prompt,
          style: values.style,
          characters: values.characters.split(",").map((name: string) => name.trim()),
          generationParams: {
            model: "imagen-3",
            lineWeight: values.lineWeight,
            complexity: values.complexity,
          },
        },
      }

      // Update the page in the project
      const updatedPages = project.pages.map((p: any) => (p.id === params.pageId ? updatedPage : p))

      await updateProject(params.projectId, { pages: updatedPages })

      toast({
        title: "Coloring page updated",
        description: "Your changes have been saved successfully.",
      })

      router.push(`/projects/${params.projectId}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update coloring page. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (!project || !page) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Loading...</h1>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex items-center gap-2 mb-8">
        <Link href={`/projects/${params.projectId}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Edit Coloring Page</h1>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Image Parameters</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onGenerate)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prompt</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="A friendly rabbit in a garden, surrounded by carrots and flowers..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Describe what you want in your coloring page.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="style"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Style</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select style" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cartoon">Cartoon</SelectItem>
                          <SelectItem value="realistic">Realistic</SelectItem>
                          <SelectItem value="manga">Manga/Anime</SelectItem>
                          <SelectItem value="simple">Simple/Minimalist</SelectItem>
                          <SelectItem value="detailed">Detailed/Complex</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>The artistic style of your coloring page.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lineWeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Line Weight: {field.value}</FormLabel>
                      <FormControl>
                        <Slider
                          min={1}
                          max={10}
                          step={1}
                          defaultValue={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                        />
                      </FormControl>
                      <FormDescription>Thickness of the lines (1 = thin, 10 = thick).</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="complexity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complexity: {field.value}</FormLabel>
                      <FormControl>
                        <Slider
                          min={1}
                          max={10}
                          step={1}
                          defaultValue={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                        />
                      </FormControl>
                      <FormDescription>Level of detail (1 = simple, 10 = complex).</FormDescription>
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
                        <Input placeholder="Hoppy, Owl, Fox" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter character names separated by commas. This helps maintain consistency.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isGenerating}>
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    "Regenerate Image"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coloring Page</CardTitle>
          </CardHeader>
          <CardContent>
            {generatedImage ? (
              <div className="space-y-4">
                <div className="border rounded-lg p-4 flex items-center justify-center">
                  <img
                    src={generatedImage || "/placeholder.svg"}
                    alt="Generated coloring page"
                    className="max-w-full max-h-[400px] object-contain"
                  />
                </div>
                <div className="flex justify-between">
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button onClick={onSave} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                {isGenerating ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-8 w-8 animate-spin mb-4" />
                    <p>Generating your image...</p>
                    <p className="text-sm">This may take a moment</p>
                  </div>
                ) : (
                  <p>No image available. Generate a new image.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
