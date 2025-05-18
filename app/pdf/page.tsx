"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Check, Download, FileText, Loader2, Settings } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function PDFCompilationPage() {
  const [isCompiling, setIsCompiling] = useState(false)
  const [progress, setProgress] = useState(0)
  const [compilationComplete, setCompilationComplete] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const handleCompile = () => {
    setIsCompiling(true)
    setProgress(0)
    setCompilationComplete(false)
    setErrors([])

    // Simulate compilation process
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsCompiling(false)
          setCompilationComplete(true)
          return 100
        }
        return prev + 10
      })
    }, 500)
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">PDF Compilation</h1>
          <p className="text-muted-foreground mt-1">Generate print-ready PDFs of your coloring books</p>
        </div>
      </div>

      <Tabs defaultValue="compile" className="mb-8">
        <TabsList>
          <TabsTrigger value="compile">Compile</TabsTrigger>
          <TabsTrigger value="settings">Export Settings</TabsTrigger>
          <TabsTrigger value="batch">Batch Export</TabsTrigger>
        </TabsList>

        <TabsContent value="compile">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Compilation Status</CardTitle>
              </CardHeader>
              <CardContent>
                {errors.length > 0 && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Errors Found</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc pl-4 mt-2">
                        {errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Compilation Progress</span>
                      <span className="text-sm">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 ${
                          progress >= 20 ? "bg-green-500 text-white" : "bg-muted"
                        }`}
                      >
                        {progress >= 20 && <Check className="h-3 w-3" />}
                      </div>
                      <span className="text-sm">Validating project structure</span>
                    </div>

                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 ${
                          progress >= 40 ? "bg-green-500 text-white" : "bg-muted"
                        }`}
                      >
                        {progress >= 40 && <Check className="h-3 w-3" />}
                      </div>
                      <span className="text-sm">Processing story pages</span>
                    </div>

                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 ${
                          progress >= 60 ? "bg-green-500 text-white" : "bg-muted"
                        }`}
                      >
                        {progress >= 60 && <Check className="h-3 w-3" />}
                      </div>
                      <span className="text-sm">Processing coloring pages</span>
                    </div>

                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 ${
                          progress >= 80 ? "bg-green-500 text-white" : "bg-muted"
                        }`}
                      >
                        {progress >= 80 && <Check className="h-3 w-3" />}
                      </div>
                      <span className="text-sm">Applying layout settings</span>
                    </div>

                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 ${
                          progress >= 100 ? "bg-green-500 text-white" : "bg-muted"
                        }`}
                      >
                        {progress >= 100 && <Check className="h-3 w-3" />}
                      </div>
                      <span className="text-sm">Generating final PDF</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    {compilationComplete ? (
                      <Button className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </Button>
                    ) : (
                      <Button onClick={handleCompile} disabled={isCompiling} className="w-full">
                        {isCompiling ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Compiling...
                          </>
                        ) : (
                          <>
                            <FileText className="mr-2 h-4 w-4" />
                            Compile PDF
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>PDF Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg aspect-[3/4] flex items-center justify-center bg-muted/30">
                  {compilationComplete ? (
                    <div className="text-center p-8">
                      <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="font-medium mb-2">Compilation Complete</h3>
                      <p className="text-sm text-muted-foreground mb-4">Your PDF has been successfully generated.</p>
                      <Button variant="outline" size="sm">
                        Preview PDF
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <p>PDF preview will appear here</p>
                      <p className="text-xs">Compile your PDF to see a preview</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Export Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">PDF Quality</label>
                    <select className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2">
                      <option>Print Quality (300 DPI)</option>
                      <option>Standard Quality (150 DPI)</option>
                      <option>Web Quality (72 DPI)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Color Mode</label>
                    <select className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2">
                      <option>RGB (Digital)</option>
                      <option>CMYK (Print)</option>
                      <option>Grayscale</option>
                    </select>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">PDF Metadata</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-muted-foreground">Title</label>
                      <input
                        type="text"
                        className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2"
                        placeholder="My Coloring Book"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground">Author</label>
                      <input
                        type="text"
                        className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2"
                        placeholder="Your Name"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground">Subject</label>
                      <input
                        type="text"
                        className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2"
                        placeholder="Children's Coloring Book"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground">Keywords</label>
                      <input
                        type="text"
                        className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2"
                        placeholder="coloring, children, activity"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Output Options</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="cropMarks">Include Crop Marks</Label>
                        <p className="text-xs text-muted-foreground">Add printer crop marks to the PDF</p>
                      </div>
                      <Switch id="cropMarks" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="bleed">Include Bleed</Label>
                        <p className="text-xs text-muted-foreground">Add bleed area for professional printing</p>
                      </div>
                      <Switch id="bleed" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="compress">Compress Images</Label>
                        <p className="text-xs text-muted-foreground">Reduce file size by compressing images</p>
                      </div>
                      <Switch id="compress" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="coverPage">Include Cover Page</Label>
                        <p className="text-xs text-muted-foreground">Add a cover page to the PDF</p>
                      </div>
                      <Switch id="coverPage" defaultChecked />
                    </div>
                  </div>
                </div>

                <Button>
                  <Settings className="mr-2 h-4 w-4" />
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batch">
          <Card>
            <CardHeader>
              <CardTitle>Batch Export</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Export Formats</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input type="checkbox" id="pdf" checked className="mr-2" />
                      <label htmlFor="pdf" className="text-sm">
                        PDF (Complete Book)
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input type="checkbox" id="pdfPrint" className="mr-2" />
                      <label htmlFor="pdfPrint" className="text-sm">
                        PDF (Print-Ready with Bleed)
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input type="checkbox" id="pngPages" className="mr-2" />
                      <label htmlFor="pngPages" className="text-sm">
                        PNG (Individual Pages)
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input type="checkbox" id="jpgPages" className="mr-2" />
                      <label htmlFor="jpgPages" className="text-sm">
                        JPG (Individual Pages)
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Batch Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-muted-foreground">Output Folder Name</label>
                      <input
                        type="text"
                        className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2"
                        placeholder="my-coloring-book-export"
                      />
                    </div>

                    <div className="flex items-center">
                      <input type="checkbox" id="createSubfolders" checked className="mr-2" />
                      <label htmlFor="createSubfolders" className="text-sm">
                        Create subfolders for each format
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input type="checkbox" id="includeMetadata" checked className="mr-2" />
                      <label htmlFor="includeMetadata" className="text-sm">
                        Include metadata in all formats
                      </label>
                    </div>
                  </div>
                </div>

                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Start Batch Export
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
