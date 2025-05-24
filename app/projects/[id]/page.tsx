"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getProject, updateProject } from "@/lib/actions"
import { ColorbookProject, Chapter } from "@/lib/types" // Import ColorbookProject and Chapter
import { toast } from "@/components/ui/use-toast"
import { formatDistanceToNow } from "date-fns"
import { Book, FileText, ImageIcon, Layout, Plus, Trash, Download, Upload, Save } from "lucide-react" // Removed Pencil
import { PageSequencer } from "@/components/page-sequencer" // Import PageSequencer
import Link from "next/link"
import { notFound, useParams } from "next/navigation"
import { useEffect, useState, useRef } from "react"

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>()
  const [project, setProject] = useState<ColorbookProject | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpdateStoryChapters = (updatedChapters: Chapter[]) => {
    setProject(prevProject => {
      if (!prevProject) return null;
      // Create a deep copy to ensure state updates correctly
      // Note: JSON.parse(JSON.stringify(obj)) is a simple way to deep clone, but has limitations (e.g., loses Date objects, functions)
      // For this specific case, if chapters/pages don't contain such complex types, it's okay.
      // Otherwise, a more robust deep cloning method might be needed.
      const newProject = JSON.parse(JSON.stringify(prevProject)) as ColorbookProject;
      newProject.story.chapters = updatedChapters;
      newProject.projectMetadata.updatedAt = new Date().toISOString();
      
      // Optional: Trigger auto-save or enable a save button
      // For now, just updating state. User needs to click "Save Project"
      // handleSaveProject(newProject); // Or a modified save that takes the project
      toast({ title: "Page Order Updated", description: "Remember to save your project to persist these changes."});
      return newProject;
    });
  };


  useEffect(() => {
    if (params.id) {
      const fetchProject = async () => {
        try {
          setIsLoading(true)
          const fetchedProject = await getProject(params.id as string)
          if (!fetchedProject) {
            notFound()
            return
          }
          setProject(fetchedProject)
          setError(null)
        } catch (err) {
          console.error("Failed to fetch project:", err)
          setError("Failed to load project.")
          // notFound(); // Or redirect to a general error page
        } finally {
          setIsLoading(false)
        }
      }
      fetchProject()
    }
  }, [params.id])

  // Placeholder for Save Project
  const handleSaveProject = async () => {
    if (!project) return;
    const updatedProject = {
      ...project,
      projectMetadata: {
        ...project.projectMetadata,
        updatedAt: new Date().toISOString(),
      },
    };
    try {
      await updateProject(project.id, updatedProject);
      setProject(updatedProject); // Update local state with new timestamp
      toast({ title: "Project Saved", description: "Your project has been successfully saved." });
    } catch (err) {
      console.error("Failed to save project:", err);
      toast({ title: "Error Saving", description: "Could not save the project.", variant: "destructive" });
    }
  };

  // Placeholder for Export Project
  const handleExportProject = () => {
    if (!project) return;
    const jsonString = JSON.stringify(project, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${project.projectMetadata.title || 'UntitledProject'}.colorbook`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    toast({ title: "Project Exported", description: "Your project has been downloaded." });
  };
  
  // Placeholder for Triggering File Input
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  // Placeholder for File Import
  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!project) return;
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const fileContent = e.target?.result as string;
        const importedData = JSON.parse(fileContent) as ColorbookProject;

        // Basic Validation
        if (!importedData.projectMetadata || !importedData.story) {
          toast({ title: "Import Error", description: "Invalid .colorbook file format.", variant: "destructive" });
          return;
        }
        
        const projectToUpdate: ColorbookProject = {
          ...importedData,
          id: project.id, // Keep current project ID
          projectMetadata: {
            ...importedData.projectMetadata,
            updatedAt: new Date().toISOString(), // Update timestamp
          },
        };

        await updateProject(project.id, projectToUpdate);
        setProject(projectToUpdate);
        toast({ title: "Project Imported", description: `${projectToUpdate.projectMetadata.title} has been imported and saved.` });
      } catch (err) {
        console.error("Failed to import project:", err);
        toast({ title: "Import Error", description: "Could not import the project. Ensure the file is a valid .colorbook JSON.", variant: "destructive" });
      } finally {
        // Reset file input
        if(fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    reader.readAsText(file);
  };


  if (isLoading) {
    return <div className="container py-8">Loading project details...</div>
  }

  if (error) {
    return <div className="container py-8 text-red-500">{error}</div>
  }

  if (!project) {
    // This case should ideally be handled by notFound() in useEffect, but as a fallback:
    return <div className="container py-8">Project not found.</div>
  }

  // const storyPages = project.pages.filter((page) => page.type === "story")
  // const coloringPages = project.pages.filter((page) => page.type === "coloring")
  const totalPages = project.story.chapters.reduce((acc, chapter) => acc + chapter.pages.length, 0);


  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{project.projectMetadata.title}</h1>
          <p className="text-muted-foreground mt-1">
            Last updated {formatDistanceToNow(new Date(project.projectMetadata.updatedAt), { addSuffix: true })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveProject}>
            <Save className="mr-2 h-4 w-4" />
            Save Project
          </Button>
           <Button variant="outline" onClick={handleExportProject}>
            <Download className="mr-2 h-4 w-4" />
            Export (.colorbook)
          </Button>
          <Button variant="outline" onClick={handleImportClick}>
            <Upload className="mr-2 h-4 w-4" />
            Import (.colorbook)
          </Button>
          <input 
            type="file" 
            accept=".colorbook" 
            ref={fileInputRef} 
            onChange={handleFileImport} 
            className="hidden" 
          />
          <Button variant="destructive">
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPages}</div>
            {/* <p className="text-xs text-muted-foreground">
              {storyPages.length} story pages, {coloringPages.length} coloring pages
            </p> */}
             <p className="text-xs text-muted-foreground">Page breakdown will be updated.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Dimensions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {project.layoutSettings.pageSize === "custom" && project.layoutSettings.customPageSize ? 
                `${project.layoutSettings.customPageSize.width} × ${project.layoutSettings.customPageSize.height} ${project.layoutSettings.customPageSize.unit}` :
                project.layoutSettings.pageSize
              }
            </div>
            <p className="text-xs text-muted-foreground">{project.projectMetadata.bindingType || "Not set"} binding</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Target Age</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.projectMetadata.targetAgeGroup || "Not set"}</div>
            <p className="text-xs text-muted-foreground">{(project.projectMetadata.tags || []).join(", ") || "No tags"}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Project Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{project.projectMetadata.description || "No description."}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pages">
        <TabsList>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="characters">Characters</TabsTrigger>
          <TabsTrigger value="media">Media Library</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="export">Export & Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="pages">
          <div className="space-y-6">
            {/* General "Add Page" buttons can be re-evaluated based on UX */}
            {/* For now, PageSequencer itself has "Add Page to Chapter" */}
            {/* 
            <div className="flex gap-4">
              <Link href={`/story/new?projectId=${project.id}`}>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Text/Story Page
                </Button>
              </Link>
              <Link href={`/images/new?projectId=${project.id}`}>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Image/Coloring Page
                </Button>
              </Link>
            </div>
            */}
            
            <PageSequencer 
              chapters={project.story.chapters} 
              onUpdateChapters={handleUpdateStoryChapters} 
              projectId={project.id} 
            />
            
            {/* Retain global add buttons if necessary, or rely on per-chapter add buttons in PageSequencer */}
             <div className="mt-6 flex gap-4">
                <Link href={`/story/new?projectId=${project.id}`}>
                  <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" /> Add New Text/Story Page (to default chapter)
                  </Button>
                </Link>
                 <Link href={`/images/new?projectId=${project.id}`}>
                  <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" /> Add New Image/Coloring Page (to default chapter)
                  </Button>
                </Link>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="media">
            <Card>
                <CardHeader><CardTitle>Media Library</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">Media library management will be available here.</p></CardContent>
            </Card>
        </TabsContent>
        
        <TabsContent value="settings">
            <Card>
                <CardHeader><CardTitle>Project Settings</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">Detailed project settings will be available here.</p></CardContent>
            </Card>
        </TabsContent>


        <TabsContent value="characters">
          <Card>
            <CardHeader>
              <CardTitle>Characters</CardTitle>
              <CardDescription>Manage the characters in your coloring book</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                <Link href={`/projects/${project.id}/characters`}>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Manage Characters
                  </Button>
                </Link>
              </div>

              <div className="text-center py-8 text-muted-foreground">
                <p>Use the character management page to create and edit characters.</p>
                <p>This helps maintain consistency across your coloring book.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Layout Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-[3/4] border rounded-lg flex items-center justify-center bg-muted/30 mb-4">
                  <Layout className="h-8 w-8 text-muted-foreground" />
                </div>
                <Link href={`/layout?projectId=${project.id}`}>
                  <Button className="w-full">
                    <Layout className="mr-2 h-4 w-4" />
                    Open Layout Engine
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Export Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm">
                    Generate your coloring book in various formats for printing or digital distribution.
                  </p>

                  <Link href={`/pdf?projectId=${project.id}`}>
                    <Button className="w-full">
                      <FileText className="mr-2 h-4 w-4" />
                      Generate PDF
                    </Button>
                  </Link>

                  <div className="pt-2">
                    <h3 className="text-sm font-medium mb-2">Quick Export</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm">
                        Print PDF
                      </Button>
                      <Button variant="outline" size="sm">
                        Digital PDF
                      </Button>
                      <Button variant="outline" size="sm">
                        PNG Pages
                      </Button>
                      <Button variant="outline" size="sm">
                        JPG Pages
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
