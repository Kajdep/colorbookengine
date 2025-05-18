import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Book, ImageIcon, Layout, FileText, FolderKanban, Plus } from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  const modules = [
    {
      title: "Story Management",
      description: "Create and manage your coloring book stories",
      icon: Book,
      href: "/story",
      color: "bg-blue-100 dark:bg-blue-900",
    },
    {
      title: "Image Generation",
      description: "Generate and customize coloring book illustrations",
      icon: ImageIcon,
      href: "/images",
      color: "bg-green-100 dark:bg-green-900",
    },
    {
      title: "Layout Engine",
      description: "Arrange your pages and customize layouts",
      icon: Layout,
      href: "/layout",
      color: "bg-yellow-100 dark:bg-yellow-900",
    },
    {
      title: "PDF Compilation",
      description: "Generate print-ready PDFs of your coloring books",
      icon: FileText,
      href: "/pdf",
      color: "bg-purple-100 dark:bg-purple-900",
    },
    {
      title: "Project Management",
      description: "Manage your coloring book projects",
      icon: FolderKanban,
      href: "/projects",
      color: "bg-pink-100 dark:bg-pink-900",
    },
  ]

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome to your Coloring Book Creator Studio</p>
        </div>
        <Link href="/projects/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => (
          <Card key={module.title} className="overflow-hidden">
            <CardHeader className={`${module.color} text-foreground`}>
              <div className="flex items-center gap-2">
                {module.icon && <module.icon className="h-5 w-5" />}
                <CardTitle>{module.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <CardDescription>{module.description}</CardDescription>
            </CardContent>
            <CardFooter>
              <Link href={module.href} className="w-full">
                <Button variant="outline" className="w-full">
                  Open {module.title}
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>Your recently accessed coloring book projects</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center py-8 text-muted-foreground">
              No recent projects. Create a new project to get started.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
