"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ArrowLeft, ImageIcon, Loader2, Plus, Save, Trash } from "lucide-react"
import { getProject, updateProject } from "@/lib/actions"
import { generateImage } from "@/lib/ai-actions"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { v4 as uuidv4 } from "uuid"

const characterFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  type: z.string().min(2, {
    message: "Type must be at least 2 characters.",
  }),
  traits: z.string().min(2, {
    message: "Traits must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
})

export default function CharactersPage({ params }: { params: { id: string } }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [project, setProject] = useState<any>(null)
  const [characters, setCharacters] = useState<any[]>([])
  const [selectedCharacter, setSelectedCharacter] = useState<any>(null)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof characterFormSchema>>({
    resolver: zodResolver(characterFormSchema),
    defaultValues: {
      name: "",
      type: "",
      traits: "",
      description: "",
    },
  })

  useEffect(() => {
    async function loadProject() {
      try {
        const projectData = await getProject(params.id)
        if (!projectData) {
          toast({
            title: "Error",
            description: "Project not found.",
            variant: "destructive",
          })
          router.push("/projects")
          return
        }

        setProject(projectData)
        // In a real app, characters would be stored in the project
        // For now, we'll use an empty array or mock data
        setCharacters(projectData.characters || [])
        setIsLoading(false)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load project data.",
          variant: "destructive",
        })
      }
    }

    loadProject()
  }, [params.id, router])

  function onNewCharacter() {
    setSelectedCharacter(null)
    setGeneratedImage(null)
    form.reset({
      name: "",
      type: "",
      traits: "",
      description: "",
    })
    setDialogOpen(true)
  }

  function onEditCharacter(character: any) {
    setSelectedCharacter(character)
    setGeneratedImage(character.imageUrl)
    form.reset({
      name: character.name,
      type: character.type,
      traits: character.traits.join(", "),
      description: character.description,
    })
    setDialogOpen(true)
  }

  async function onDeleteCharacter(characterId: string) {
    try {
      const updatedCharacters = characters.filter((c) => c.id !== characterId)
      setCharacters(updatedCharacters)

      // In a real app, you would update the project with the new characters array
      await updateProject(params.id, { characters: updatedCharacters })

      toast({
        title: "Character deleted",
        description: "The character has been removed from the project.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete character. Please try again.",
        variant: "destructive",
      })
    }
  }

  async function onGenerateImage() {
    setIsGenerating(true)
    try {
      const values = form.getValues()
      const prompt = `A coloring book style illustration of ${values.name}, a ${values.type}. Character traits: ${values.traits}. ${values.description}`

      const imageUrl = await generateImage({
        prompt,
        style: "cartoon",
        lineWeight: 7,
        complexity: 5,
      })

      setGeneratedImage(imageUrl)

      toast({
        title: "Character image generated",
        description: "Your character image has been generated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate character image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  async function onSubmit(values: z.infer<typeof characterFormSchema>) {
    setIsSaving(true)
    try {
      const characterData = {
        id: selectedCharacter ? selectedCharacter.id : uuidv4(),
        name: values.name,
        type: values.type,
        traits: values.traits.split(",").map((trait) => trait.trim()),
        description: values.description,
        imageUrl: generatedImage,
      }

      let updatedCharacters
      if (selectedCharacter) {
        // Update existing character
        updatedCharacters = characters.map((c) => (c.id === characterData.id ? characterData : c))
      } else {
        // Add new character
        updatedCharacters = [...characters, characterData]
      }

      setCharacters(updatedCharacters)

      // In a real app, you would update the project with the new characters array
      await updateProject(params.id, { characters: updatedCharacters })

      toast({
        title: selectedCharacter ? "Character updated" : "Character created",
        description: selectedCharacter
          ? "The character has been updated successfully."
          : "The character has been added to the project.",
      })

      setDialogOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save character. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Loading...</h1>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex items-center gap-2 mb-8">
        <Link href={`/projects/${params.id}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Character Management</h1>
      </div>

      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">
          Manage the characters in your coloring book to maintain consistency across pages.
        </p>
        <Button onClick={onNewCharacter}>
          <Plus className="mr-2 h-4 w-4" />
          Add Character
        </Button>
      </div>

      {characters.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No characters yet</h2>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Create characters to maintain consistency across your coloring book pages.
            </p>
            <Button onClick={onNewCharacter}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Character
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {characters.map((character) => (
            <Card key={character.id} className="overflow-hidden">
              <div className="aspect-square bg-muted">
                {character.imageUrl ? (
                  <img
                    src={character.imageUrl || "/placeholder.svg"}
                    alt={character.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-1">{character.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{character.type}</p>

                <div className="mb-3">
                  <h4 className="text-xs font-medium text-muted-foreground mb-1">Traits:</h4>
                  <div className="flex flex-wrap gap-1">
                    {character.traits.map((trait: string, index: number) => (
                      <span
                        key={index}
                        className="bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded-full"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-sm line-clamp-2 mb-4">{character.description}</p>

                <div className="flex justify-between">
                  <Button variant="outline" size="sm" onClick={() => onEditCharacter(character)}>
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => onDeleteCharacter(character.id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedCharacter ? "Edit Character" : "Create New Character"}</DialogTitle>
            <DialogDescription>
              {selectedCharacter
                ? "Update the details of your character."
                : "Add a new character to your coloring book."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Hoppy" {...field} />
                        </FormControl>
                        <FormDescription>The name of your character.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <FormControl>
                          <Input placeholder="Rabbit" {...field} />
                        </FormControl>
                        <FormDescription>The type or species of your character.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="traits"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Traits</FormLabel>
                        <FormControl>
                          <Input placeholder="Friendly, Curious, Brave" {...field} />
                        </FormControl>
                        <FormDescription>Comma-separated traits that define your character.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="A friendly rabbit who loves adventures..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>A brief description of your character.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </div>

            <div>
              <div className="border rounded-lg p-4 flex items-center justify-center bg-muted/30 mb-4 aspect-square">
                {generatedImage ? (
                  <img
                    src={generatedImage || "/placeholder.svg"}
                    alt="Character"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                    <p>No image generated yet</p>
                  </div>
                )}
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full mb-4"
                onClick={onGenerateImage}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Character Image"
                )}
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={form.handleSubmit(onSubmit)} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {selectedCharacter ? "Update Character" : "Save Character"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
