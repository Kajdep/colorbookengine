import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getProjects } from "@/lib/actions"
import { formatDistanceToNow } from "date-fns"
import { Book, Plus } from "lucide-react"
import Link from "next/link"

export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">Manage your coloring book projects</p>
        </div>
        <Link href="/projects/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Book className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Create your first coloring book project to get started with the Coloring Book Creator Studio.
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <CardTitle className="truncate">{project.projectMetadata.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{project.projectMetadata.description}</p>
                {project.projectMetadata.tags && project.projectMetadata.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.projectMetadata.tags.map((tag) => (
                      <span key={tag} className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-4 text-xs text-muted-foreground">
                  <p>Pages: {project.story.chapters.reduce((acc, chapter) => acc + chapter.pages.length, 0)}</p>
                  <p>Updated: {formatDistanceToNow(new Date(project.projectMetadata.updatedAt), { addSuffix: true })}</p>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/projects/${project.id}`} className="w-full">
                  <Button variant="outline" className="w-full">
                    Open Project
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
