import { Button } from "@/components/ui/button"
import { FileQuestion } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[80vh] py-8 text-center">
      <FileQuestion className="h-24 w-24 text-muted-foreground mb-6" />
      <h1 className="text-4xl font-bold tracking-tight mb-2">Page Not Found</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/">Go to Dashboard</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/projects">View Projects</Link>
        </Button>
      </div>
    </div>
  )
}
