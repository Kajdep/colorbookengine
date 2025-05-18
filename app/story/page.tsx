import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getProjects } from "@/lib/actions"
import { Book, FileText, Plus } from "lucide-react"
import Link from "next/link"

export default async function StoryManagementPage() {
  const projects = await getProjects()
  const hasProjects = projects.length > 0

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Story Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage your coloring book stories</p>
        </div>
        {hasProjects && (
          <Link href="/story/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Story
            </Button>
          </Link>
        )}
      </div>

      {!hasProjects ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Book className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Create a project first to start managing your coloring book stories.
            </p>
            <Link href="/projects/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Project
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Story Templates</CardTitle>
                <CardDescription>Pre-defined templates to help you get started quickly</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border p-4 rounded-lg">
                    <div>
                      <h3 className="font-medium">Adventure Story</h3>
                      <p className="text-sm text-muted-foreground">A template for creating adventure stories</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Use Template
                    </Button>
                  </div>
                  <div className="flex items-center justify-between border p-4 rounded-lg">
                    <div>
                      <h3 className="font-medium">Animal Friends</h3>
                      <p className="text-sm text-muted-foreground">A template for stories about animal characters</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Use Template
                    </Button>
                  </div>
                  <div className="flex items-center justify-between border p-4 rounded-lg">
                    <div>
                      <h3 className="font-medium">Fantasy World</h3>
                      <p className="text-sm text-muted-foreground">A template for magical and fantasy stories</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Use Template
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Story Generator</CardTitle>
                <CardDescription>Generate story ideas and content using AI</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm">
                    Use our AI-powered story generator to create engaging stories for your coloring books. Simply
                    provide a theme or characters, and the AI will generate a story for you.
                  </p>
                  <Link href="/story/ai-generator">
                    <Button className="w-full">
                      <FileText className="mr-2 h-4 w-4" />
                      Open AI Story Generator
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Your Stories</CardTitle>
              <CardDescription>Stories you've created for your coloring books</CardDescription>
            </CardHeader>
            <CardContent>
              {projects.some((project) => project.pages.some((page) => page.type === "story")) ? (
                <div className="space-y-4">
                  {projects.map((project) =>
                    project.pages
                      .filter((page) => page.type === "story")
                      .map((page) => (
                        <div key={page.id} className="flex items-center justify-between border p-4 rounded-lg">
                          <div>
                            <h3 className="font-medium">
                              {project.title} - Page {page.pageNumber}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {(page.content as any).text.substring(0, 50)}...
                            </p>
                          </div>
                          <Link href={`/story/edit/${project.id}/${page.id}`}>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </Link>
                        </div>
                      )),
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>You haven't created any stories yet.</p>
                  <p>Create a new story to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
