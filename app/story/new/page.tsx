"use client"

"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, PlusCircle, ArrowLeft } from "lucide-react"
import { addPage, getProject } from "@/lib/actions"
import { ColorbookProject, Page, Chapter, PageType } from "@/lib/types" // Added PageType
import { toast } from "@/components/ui/use-toast"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

const formSchema = z.object({
  chapterTitle: z.string().min(1, { message: "Chapter selection is required." }),
  pageType: z.enum(["text", "image", "textAndImage"], { required_error: "Page type is required." }),
  // Initial content fields are removed as new pages will start empty
})

export default function NewStoryPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [project, setProject] = useState<ColorbookProject | null>(null)
  const [isLoadingProject, setIsLoadingProject] = useState(true)

  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = searchParams.get("projectId")
  const chapterIdFromQuery = searchParams.get("chapterId") // chapterId is chapter.title

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      chapterTitle: chapterIdFromQuery || "",
      pageType: "text",
    },
  })

  useEffect(() => {
    if (projectId) {
      setIsLoadingProject(true);
      getProject(projectId)
        .then(projData => {
          if (projData) {
            setProject(projData);
            if (chapterIdFromQuery) {
              form.setValue("chapterTitle", chapterIdFromQuery);
            } else if (projData.story.chapters.length > 0) {
              // Default to first chapter if no specific chapterId is from query
              form.setValue("chapterTitle", projData.story.chapters[0].title);
            }
          } else {
            toast({ title: "Error", description: "Project not found.", variant: "destructive" });
            router.push("/projects");
          }
        })
        .catch(err => {
          console.error("Failed to load project for new page:", err);
          toast({ title: "Error", description: "Could not load project data.", variant: "destructive" });
        })
        .finally(() => setIsLoadingProject(false));
    } else {
      toast({ title: "Error", description: "Project ID is missing.", variant: "destructive" });
      router.push("/projects");
    }
  }, [projectId, chapterIdFromQuery, router, form]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!projectId) {
      toast({ title: "Error", description: "Project ID is required.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const initialPageData: Partial<Omit<Page, 'id' | 'pageNumber'>> = {
        type: values.pageType as PageType,
        textContent: "", // New pages start with empty content
        // imageAssetId and prompt can be undefined by default
      };

      const newPage = await addPage(projectId, values.chapterTitle, initialPageData);

      if (newPage) {
        toast({
          title: "Page Created",
          description: `New ${values.pageType} page added to chapter "${values.chapterTitle}".`,
        });
        // Redirect to the new page's edit view
        router.push(`/story/edit/${projectId}/${newPage.id}`);
      } else {
        // Should be caught by error in addPage if page is null
        throw new Error("Failed to create page, returned null.");
      }
    } catch (error: any) {
      console.error("Failed to create page:", error);
      toast({
        title: "Error Creating Page",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  if (isLoadingProject || !project) {
    return (
      <div className="container py-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
        <p className="mt-2 text-muted-foreground">Loading project details...</p>
      </div>
    );
  }
  
  if (project.story.chapters.length === 0) {
     return (
      <div className="container py-8 text-center">
        <p className="text-lg text-muted-foreground mb-4">This project has no chapters yet.</p>
        <Link href={`/projects/${projectId}`}>
            <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Project
            </Button>
        </Link>
        {/* Optionally, add a button/link here to create a new chapter if that functionality exists */}
      </div>
    );
  }


  return (
    <div className="container py-8 max-w-2xl mx-auto">
      <div className="flex items-center mb-8">
        <Link href={`/projects/${projectId}`} className="mr-4">
          <Button variant="outline" size="icon" aria-label="Back to project">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Add New Page</h1>
      </div>


      <Card>
        <CardHeader>
          <CardTitle>Page Details</CardTitle>
          <FormDescription>Select the chapter and type for your new page. Content will be added in the next step.</FormDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="chapterTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chapter</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || (chapterIdFromQuery || project.story.chapters[0]?.title)}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a chapter" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {project.story.chapters.map((chapter: Chapter) => (
                          <SelectItem key={chapter.title} value={chapter.title}>
                            {chapter.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Choose which chapter this page will belong to.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pageType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Page Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select page type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="text">Text/Story Page</SelectItem>
                        <SelectItem value="image">Image/Coloring Page</SelectItem>
                        <SelectItem value="textAndImage">Text and Image Page</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Select the type of page you want to create.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting || isLoadingProject}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Page...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Page & Edit
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
