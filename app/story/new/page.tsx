"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Save } from "lucide-react"
import { addPage } from "@/lib/actions"
import { toast } from "@/components/ui/use-toast"
import { useRouter, useSearchParams } from "next/navigation"

const formSchema = z.object({
  text: z.string().min(10, {
    message: "Story text must be at least 10 characters.",
  }),
  characterNames: z.string(),
})

export default function NewStoryPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = searchParams.get("projectId")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
      characterNames: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!projectId) {
      toast({
        title: "Error",
        description: "Project ID is required.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const pageId = await addPage(projectId, {
        type: "story",
        content: {
          text: values.text,
          wordCount: values.text.split(/\s+/).filter(Boolean).length,
          characterNames: values.characterNames.split(",").map((name) => name.trim()),
          version: 1,
          versions: [{ text: values.text, timestamp: new Date() }],
        },
      })

      toast({
        title: "Story page created",
        description: "Your story page has been added to the project.",
      })

      router.push(`/projects/${projectId}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create story page. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Create New Story Page</h1>

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

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Story Page
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
