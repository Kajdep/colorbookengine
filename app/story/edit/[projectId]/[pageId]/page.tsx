"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Clock, Loader2, Save } from "lucide-react"
import { getProject, updateProject } from "@/lib/actions"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { checkCharacterConsistency } from "@/lib/ai-actions"

const formSchema = z.object({
  text: z.string().min(10, {
    message: "Story text must be at least 10 characters.",
  }),
  characterNames: z.string(),
})

export default function EditStoryPage({ params }: { params: { projectId: string; pageId: string } }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [project, setProject] = useState<any>(null)
  const [page, setPage] = useState<any>(null)
  const [consistencyIssues, setConsistencyIssues] = useState<string[]>([])
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
      characterNames: "",
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
        const storyPage = projectData.pages.find((p: any) => p.id === params.pageId && p.type === "story")

        if (!storyPage) {
          toast({
            title: "Error",
            description: "Story page not found.",
            variant: "destructive",
          })
          router.push(`/projects/${params.projectId}`)
          return
        }

        setPage(storyPage)
        form.reset({
          text: storyPage.content.text,
          characterNames: storyPage.content.characterNames.join(", "),
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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      if (!project || !page) return

      const characterNames = values.characterNames.split(",").map((name) => name.trim())

      // Create updated page
      const updatedPage = {
        ...page,
        content: {
          ...page.content,
          text: values.text,
          wordCount: values.text.split(/\s+/).filter(Boolean).length,
          characterNames: characterNames,
          version: page.content.version + 1,
          versions: [...page.content.versions, { text: values.text, timestamp: new Date() }],
        },
      }

      // Update the page in the project
      const updatedPages = project.pages.map((p: any) => (p.id === params.pageId ? updatedPage : p))

      await updateProject(params.projectId, { pages: updatedPages })

      toast({
        title: "Story page updated",
        description: "Your changes have been saved successfully.",
      })

      router.push(`/projects/${params.projectId}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update story page. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function checkConsistency() {
    setIsChecking(true)
    setConsistencyIssues([])

    try {
      const values = form.getValues()
      const characterNames = values.characterNames.split(",").map((name) => name.trim())

      const result = await checkCharacterConsistency(values.text, characterNames)

      if (!result.consistent) {
        setConsistencyIssues(result.issues)
        toast({
          title: "Consistency issues found",
          description: "Please review the issues below.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "No issues found",
          description: "Your story has good character consistency.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check consistency. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsChecking(false)
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
        <h1 className="text-3xl font-bold tracking-tight">Edit Story Page</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Story Content</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <FormField
                    control={form.control}
                    name="text"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Story Text</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Once upon a time..." className="min-h-[300px]" {...field} />
                        </FormControl>
                        <FormDescription>
                          Write the story text for this page. This will appear alongside a coloring illustration.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="characterNames"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Character Names</FormLabel>
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

                  {consistencyIssues.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                      <h3 className="font-medium text-red-800 mb-2">Character Consistency Issues:</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {consistencyIssues.map((issue, index) => (
                          <li key={index} className="text-sm text-red-700">
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={checkConsistency} disabled={isChecking}>
                      {isChecking ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Checking...
                        </>
                      ) : (
                        "Check Character Consistency"
                      )}
                    </Button>

                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
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
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Version History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {page.content.versions
                  .map((version: any, index: number) => (
                    <div key={index} className="border rounded-md p-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Clock className="h-4 w-4" />
                        <span>{formatDistanceToNow(new Date(version.timestamp), { addSuffix: true })}</span>
                      </div>
                      <p className="text-sm line-clamp-3">{version.text.substring(0, 100)}...</p>
                    </div>
                  ))
                  .reverse()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
