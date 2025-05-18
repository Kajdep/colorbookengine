import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getProject } from "@/lib/actions"
import { formatDistanceToNow } from "date-fns"
import { Book, FileText, ImageIcon, Layout, Pencil, Plus, Trash } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const project = await getProject(params.id)

  if (!project) {
    notFound()
  }

  const storyPages = project.pages.filter((page) => page.type === "story")
  const coloringPages = project.pages.filter((page) => page.type === "coloring")

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
          <p className="text-muted-foreground mt-1">
            Last updated {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Pencil className="mr-2 h-4 w-4" />
            Edit Project
          </Button>
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
            <div className="text-2xl font-bold">{project.pages.length}</div>
            <p className="text-xs text-muted-foreground">
              {storyPages.length} story pages, {coloringPages.length} coloring pages
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Dimensions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {project.metadata.dimensions.width} × {project.metadata.dimensions.height}{" "}
              {project.metadata.dimensions.unit}
            </div>
            <p className="text-xs text-muted-foreground">{project.metadata.bindingType} binding</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Target Age</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.metadata.targetAgeGroup}</div>
            <p className="text-xs text-muted-foreground">{project.metadata.tags.join(", ")}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Project Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{project.description}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pages">
        <TabsList>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="characters">Characters</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="pages">
          <div className="grid gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Story Pages</h2>
              <Link href={`/story/new?projectId=${project.id}`}>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Story Page
                </Button>
              </Link>
            </div>

            {storyPages.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Book className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No story pages yet</p>
                  <p className="text-xs text-muted-foreground mb-4">Add a story page to get started</p>
                  <Link href={`/story/new?projectId=${project.id}`}>
                    <Button size="sm" variant="outline">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Story Page
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {storyPages.map((page) => (
                  <Card key={page.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Page {page.pageNumber}</span>
                      </div>
                      <p className="text-sm line-clamp-3 mb-4">{(page.content as any).text.substring(0, 100)}...</p>
                      <div className="flex justify-end">
                        <Link href={`/story/edit/${project.id}/${page.id}`}>
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center mt-8">
              <h2 className="text-xl font-semibold">Coloring Pages</h2>
              <Link href={`/images/new?projectId=${project.id}`}>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Coloring Page
                </Button>
              </Link>
            </div>

            {coloringPages.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No coloring pages yet</p>
                  <p className="text-xs text-muted-foreground mb-4">Add a coloring page to get started</p>
                  <Link href={`/images/new?projectId=${project.id}`}>
                    <Button size="sm" variant="outline">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Coloring Page
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {coloringPages.map((page) => (
                  <Card key={page.id}>
                    <CardContent className="p-4">
                      <div className="aspect-square bg-muted rounded-md mb-2 flex items-center justify-center">
                        {(page.content as any).imageUrl ? (
                          <img
                            src={(page.content as any).imageUrl || "/placeholder.svg"}
                            alt={`Coloring page ${page.pageNumber}`}
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium">Page {page.pageNumber}</span>
                      </div>
                      <div className="flex justify-end">
                        <Link href={`/images/edit/${project.id}/${page.id}`}>
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
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
