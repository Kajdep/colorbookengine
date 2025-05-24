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
import { storyTemplates, StoryTemplate } from "@/lib/story-templates"; // Import story templates

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
  targetAgeGroup: z.string().optional(),
  bindingType: z.enum(["spiral", "perfect", "saddle", "hardcover"]).optional(),
  tags: z.string().optional(),
  pageSizePreset: z.string().optional(), // e.g., "KDP_6x9", "A4_portrait", "custom"
  width: z.coerce.number().min(0.1).optional(), // Optional, used if pageSizePreset is "custom"
  height: z.coerce.number().min(0.1).optional(), // Optional, used if pageSizePreset is "custom"
  unit: z.enum(["in", "cm", "mm"]).optional(), // Optional, used if pageSizePreset is "custom"
  templateId: z.string().optional(),
})
.refine(data => {
  if (data.pageSizePreset === "custom") {
    return data.width !== undefined && data.height !== undefined && data.unit !== undefined;
  }
  return true;
}, {
  message: "Custom page size requires width, height, and unit.",
  path: ["width"], // Or path: ["customPageSize"] if you prefer a general error
})
.refine(data => {
  if (data.pageSizePreset === "custom") {
    return data.width !== undefined && data.height !== undefined && data.unit !== undefined;
  }
  return true;
}, {
  message: "Custom page size requires width, height, and unit.",
  path: ["height"], // Or path: ["customPageSize"] if you prefer a general error
})
.refine(data => {
  if (data.pageSizePreset === "custom") {
    return data.width !== undefined && data.height !== undefined && data.unit !== undefined;
  }
  return true;
}, {
  message: "Custom page size requires width, height, and unit.",
  path: ["unit"], // Or path: ["customPageSize"] if you prefer a general error
});


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
      bindingType: "perfect",
      tags: "",
      pageSizePreset: "KDP_6x9", // Default preset
      templateId: "", // Default to no template
      // width, height, unit are not set by default unless pageSizePreset is 'custom'
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      const projectMetadata: Parameters<typeof createProject>[0] = {
        title: values.title,
        description: values.description,
        author: values.author,
      };
      if (values.tags) {
        projectMetadata.tags = values.tags.split(",").map((tag) => tag.trim()).filter(tag => tag.length > 0);
      }
      if (values.targetAgeGroup) {
        projectMetadata.targetAgeGroup = values.targetAgeGroup;
      }
      if (values.bindingType) {
        projectMetadata.bindingType = values.bindingType;
      }

      const layoutSettings: Parameters<typeof createProject>[1] = {};
      if (values.pageSizePreset === "custom") {
        if (values.width && values.height && values.unit) {
          layoutSettings.customPageSize = {
            width: values.width,
            height: values.height,
            unit: values.unit,
          };
          layoutSettings.pageSize = "custom"; // Important: also set pageSize to 'custom'
        } else {
          // This case should ideally be prevented by form validation
          console.error("Custom page size selected but dimensions are missing.");
          toast({ title: "Error", description: "Custom page size selected but dimensions are missing.", variant: "destructive" });
          setIsSubmitting(false);
          return;
        }
      } else if (values.pageSizePreset) {
        layoutSettings.pageSize = values.pageSizePreset;
      }
      
      // console.log("Submitting with metadata:", projectMetadata);
      // console.log("Submitting with layout settings:", layoutSettings);

      const projectId = await createProject(projectMetadata, layoutSettings, values.templateId)

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
              <FormField
                  control={form.control}
                  name="templateId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Story Template (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Start from scratch or choose a template" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Start from scratch</SelectItem>
                          {storyTemplates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name} - <span className="text-xs text-muted-foreground">{template.description}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>Choose a template to pre-populate chapters and page structures.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                      <FormLabel>Target Age Group (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select age group" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="toddler">Toddler (1-3)</SelectItem>
                          <SelectItem value="preschool">Preschool (3-5)</SelectItem>
                          <SelectItem value="kids">Kids (6-8)</SelectItem>
                          <SelectItem value="preteen">Preteen (9-12)</SelectItem>
                          <SelectItem value="teen">Teen (13-18)</SelectItem>
                          <SelectItem value="adult">Adult</SelectItem>
                          <SelectItem value="allages">All Ages</SelectItem>
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
                      <FormLabel>Binding Type (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select binding type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="perfect">Perfect Bound (Paperback)</SelectItem>
                          <SelectItem value="saddle">Saddle Stitch (Booklet)</SelectItem>
                          <SelectItem value="spiral">Spiral/Coil Bound</SelectItem>
                          <SelectItem value="hardcover_casewrap">Hardcover (Casewrap)</SelectItem>
                          <SelectItem value="hardcover_dustjacket">Hardcover (Dust Jacket)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>The binding method for your coloring book.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="pageSizePreset"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Page Size</FormLabel>
                    <Select onValueChange={(value) => {
                      field.onChange(value);
                      // Optionally reset custom fields when a preset is chosen
                      if (value !== "custom") {
                        form.setValue("width", undefined);
                        form.setValue("height", undefined);
                        form.setValue("unit", undefined);
                      }
                    }} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select page size" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="KDP_5x8">5" x 8"</SelectItem>
                        <SelectItem value="KDP_6x9">6" x 9" (KDP Standard)</SelectItem>
                        <SelectItem value="KDP_8_5x11">8.5" x 11" (KDP Large Format)</SelectItem>
                        <SelectItem value="A4_portrait">A4 Portrait (210mm x 297mm)</SelectItem>
                        <SelectItem value="A5_portrait">A5 Portrait (148mm x 210mm)</SelectItem>
                        <SelectItem value="custom">Custom Size</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Select a standard page size or choose 'Custom Size' to specify dimensions.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("pageSizePreset") === "custom" && (
                <div className="grid gap-6 md:grid-cols-3 p-4 border rounded-md">
                   <FormDescription className="md:col-span-3 mb-2">
                    Specify custom page dimensions. Ensure these are final trim sizes.
                  </FormDescription>
                  <FormField
                    control={form.control}
                    name="width"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Width</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="e.g., 8.5" {...field} value={field.value ?? ""} />
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
                          <Input type="number" step="0.01" placeholder="e.g., 11" {...field} value={field.value ?? ""} />
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
                        <Select onValueChange={field.onChange} value={field.value ?? ""} defaultValue="">
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="in">Inches (in)</SelectItem>
                            <SelectItem value="cm">Centimeters (cm)</SelectItem>
                            <SelectItem value="mm">Millimeters (mm)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

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
