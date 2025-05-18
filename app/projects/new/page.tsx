"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createProject } from "@/lib/actions"
import { toast } from "@/components/ui/use-toast"

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  author: z.string().min(2, {
    message: "Author name must be at least 2 characters.",
  }),
  targetAgeGroup: z.string(),
  width: z.coerce.number().min(1),
  height: z.coerce.number().min(1),
  unit: z.enum(["in", "cm", "mm"]),
  bindingType: z.enum(["spiral", "perfect", "saddle", "hardcover"]),
  tags: z.string(),
})

export default function NewProject() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      author: "",
      targetAgeGroup: "3-5",
      width: 8.5,
      height: 11,
      unit: "in",
      bindingType: "perfect",
      tags: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      const projectId = await createProject({
        title: values.title,
        description: values.description,
        metadata: {
          author: values.author,
          targetAgeGroup: values.targetAgeGroup,
          dimensions: {
            width: values.width,
            height: values.height,
            unit: values.unit as "in" | "cm" | "mm",
          },
          bindingType: values.bindingType as "spiral" | "perfect" | "saddle" | "hardcover",
          tags: values.tags.split(",").map((tag) => tag.trim()),
        },
      })

      toast({
        title: "Project created",
        description: "Your new coloring book project has been created successfully.",
      })

      router.push(`/projects/${projectId}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Create New Project</h1>

      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="My Awesome Coloring Book" {...field} />
                      </FormControl>
                      <FormDescription>The title of your coloring book.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="author"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Author</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Name" {...field} />
                      </FormControl>
                      <FormDescription>The author of the coloring book.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="A fun coloring book about..." className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormDescription>A brief description of your coloring book.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="targetAgeGroup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Age Group</FormLabel>
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
                          <SelectItem value="13+">13+ years</SelectItem>
                          <SelectItem value="adult">Adult</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>The target age group for your coloring book.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bindingType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Binding Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select binding type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="spiral">Spiral Bound</SelectItem>
                          <SelectItem value="perfect">Perfect Bound</SelectItem>
                          <SelectItem value="saddle">Saddle Stitched</SelectItem>
                          <SelectItem value="hardcover">Hardcover</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>The binding method for your coloring book.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="width"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Width</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Height</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="in">Inches</SelectItem>
                          <SelectItem value="cm">Centimeters</SelectItem>
                          <SelectItem value="mm">Millimeters</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input placeholder="animals, adventure, fantasy" {...field} />
                    </FormControl>
                    <FormDescription>Comma-separated tags to categorize your coloring book.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Project"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
