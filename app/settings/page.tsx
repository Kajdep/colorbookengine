"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { getApiKeys, saveApiKeys, getActiveTextApi, setActiveTextApi } from "@/lib/api-config"

const formSchema = z.object({
  openaiKey: z.string().optional(),
  imagenKey: z.string().optional(),
  openrouterKey: z.string().optional(),
  activeTextApi: z.enum(["openai", "openrouter"]),
})

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      openaiKey: "",
      imagenKey: "",
      openrouterKey: "",
      activeTextApi: "openai",
    },
  })

  useEffect(() => {
    const keys = getApiKeys()
    const activeApi = getActiveTextApi()

    form.reset({
      openaiKey: keys.openaiKey,
      imagenKey: keys.imagenKey,
      openrouterKey: keys.openrouterKey,
      activeTextApi: activeApi as "openai" | "openrouter",
    })
  }, [form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSaving(true)
    try {
      saveApiKeys({
        openaiKey: values.openaiKey,
        imagenKey: values.imagenKey,
        openrouterKey: values.openrouterKey,
      })

      setActiveTextApi(values.activeTextApi)

      toast({
        title: "Settings saved",
        description: "Your API settings have been saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">API Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            Configure your API keys for text and image generation. These keys are stored in your browser's local
            storage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="openaiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OpenAI API Key</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="sk-..." {...field} />
                    </FormControl>
                    <FormDescription>
                      Your OpenAI API key for text generation. Get one from{" "}
                      <a
                        href="https://platform.openai.com/api-keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                      >
                        OpenAI's website
                      </a>
                      .
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="openrouterKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OpenRouter API Key</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="sk-..." {...field} />
                    </FormControl>
                    <FormDescription>
                      Your OpenRouter API key for text generation. Get one from{" "}
                      <a
                        href="https://openrouter.ai/keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                      >
                        OpenRouter's website
                      </a>
                      .
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imagenKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Google Imagen API Key</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="AIza..." {...field} />
                    </FormControl>
                    <FormDescription>Your Google Imagen API key for image generation.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="activeTextApi"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Active Text Generation API</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="openai" id="openai" />
                          <Label htmlFor="openai">OpenAI</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="openrouter" id="openrouter" />
                          <Label htmlFor="openrouter">OpenRouter</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormDescription>Select which API to use for text generation.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Settings"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
