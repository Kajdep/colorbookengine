"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, ArrowRight, Eye, Save } from "lucide-react"

export default function LayoutEnginePage() {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 10 // Example value

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Layout Engine</h1>
          <p className="text-muted-foreground mt-1">Arrange and customize your coloring book layout</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save Layout
          </Button>
        </div>
      </div>

      <Tabs defaultValue="pages" className="mb-8">
        <TabsList>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="settings">Layout Settings</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="pages">
          <Card>
            <CardHeader>
              <CardTitle>Page Arrangement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <div className="flex w-full max-w-3xl aspect-[2/1] border rounded-lg mb-4">
                  <div className="w-1/2 border-r p-4 flex items-center justify-center bg-muted/30">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Story Page {currentPage}</p>
                      <p className="text-xs">Text content will appear here</p>
                    </div>
                  </div>
                  <div className="w-1/2 p-4 flex items-center justify-center bg-muted/30">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Coloring Page {currentPage}</p>
                      <p className="text-xs">Illustration will appear here</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-8">
                  <Button variant="outline" size="icon" onClick={handlePreviousPage} disabled={currentPage === 1}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button variant="outline" size="icon" onClick={handleNextPage} disabled={currentPage === totalPages}>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-6 gap-2 w-full max-w-3xl">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className={`aspect-[2/1] border rounded cursor-pointer hover:border-primary ${
                        i + 1 === currentPage ? "border-primary bg-primary/10" : ""
                      }`}
                      onClick={() => setCurrentPage(i + 1)}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Page Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Page Size</label>
                      <select className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2">
                        <option>Letter (8.5" x 11")</option>
                        <option>A4 (210mm x 297mm)</option>
                        <option>Square (8" x 8")</option>
                        <option>Custom</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Orientation</label>
                      <select className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2">
                        <option>Portrait</option>
                        <option>Landscape</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Margins</label>
                      <input
                        type="text"
                        value="0.5in"
                        className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Bleed</label>
                      <input
                        type="text"
                        value="0.125in"
                        className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Binding Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Binding Type</label>
                    <select className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2">
                      <option>Perfect Bound</option>
                      <option>Spiral Bound</option>
                      <option>Saddle Stitched</option>
                      <option>Hardcover</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Gutter Width</label>
                    <input
                      type="text"
                      value="0.25in"
                      className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Extra space added to the inner margin for binding
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <input type="checkbox" id="cropMarks" />
                    <label htmlFor="cropMarks" className="text-sm">
                      Show crop marks
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="pageNumbers" checked />
                    <label htmlFor="pageNumbers" className="text-sm">
                      Show page numbers
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Layout Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="border rounded-lg p-4 hover:border-primary cursor-pointer">
                  <div className="aspect-[2/1] bg-muted mb-2 rounded"></div>
                  <h3 className="font-medium">Standard Layout</h3>
                  <p className="text-sm text-muted-foreground">Story page on left, coloring page on right</p>
                </div>

                <div className="border rounded-lg p-4 hover:border-primary cursor-pointer">
                  <div className="aspect-[2/1] bg-muted mb-2 rounded"></div>
                  <h3 className="font-medium">Reversed Layout</h3>
                  <p className="text-sm text-muted-foreground">Coloring page on left, story page on right</p>
                </div>

                <div className="border rounded-lg p-4 hover:border-primary cursor-pointer">
                  <div className="aspect-[2/1] bg-muted mb-2 rounded"></div>
                  <h3 className="font-medium">Story First</h3>
                  <p className="text-sm text-muted-foreground">All story pages, then all coloring pages</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
