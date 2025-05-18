"use client"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { getApiKeys, getActiveTextApi } from "./api-config"

// Function to generate text using either OpenAI or OpenRouter
async function generateTextWithApi(prompt: string, system?: string): Promise<string> {
  const { openaiKey, openrouterKey } = getApiKeys()
  const activeApi = getActiveTextApi()

  if (activeApi === "openai" && openaiKey) {
    // Use OpenAI
    try {
      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt,
        system,
      })
      return text
    } catch (error) {
      console.error("Error with OpenAI:", error)
      throw new Error("Failed to generate text with OpenAI")
    }
  } else if (activeApi === "openrouter" && openrouterKey) {
    // Use OpenRouter
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openrouterKey}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-4o", // You can change this to any model supported by OpenRouter
          messages: [...(system ? [{ role: "system", content: system }] : []), { role: "user", content: prompt }],
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error?.message || "OpenRouter API error")
      }

      return data.choices[0].message.content
    } catch (error) {
      console.error("Error with OpenRouter:", error)
      throw new Error("Failed to generate text with OpenRouter")
    }
  } else {
    throw new Error("No valid API key found for text generation")
  }
}

export async function generateStory({
  theme,
  characters,
  ageGroup,
  storyLength,
  additionalDetails,
}: {
  theme: string
  characters: string
  ageGroup: string
  storyLength: string
  additionalDetails: string
}): Promise<string> {
  const lengthMap = {
    short: "1-2 pages (about 100-200 words)",
    medium: "3-5 pages (about 300-500 words)",
    long: "6-10 pages (about 600-1000 words)",
  }

  const prompt = `
    Create a children's coloring book story with the following parameters:
    
    Theme: ${theme}
    Main Characters: ${characters}
    Target Age Group: ${ageGroup} years old
    Story Length: ${lengthMap[storyLength as keyof typeof lengthMap]}
    Additional Details: ${additionalDetails}
    
    The story should be appropriate for a coloring book, with clear scenes that can be illustrated.
    Each paragraph should represent a potential page in the coloring book.
    Use simple language appropriate for the target age group.
    Include descriptive elements that would make for interesting coloring pages.
    Make the characters anthropomorphic with consistent traits throughout the story.
  `

  try {
    const system =
      "You are a children's book author specializing in creating engaging stories for coloring books. Your stories are imaginative, age-appropriate, and designed to pair well with illustrations."

    return await generateTextWithApi(prompt, system)
  } catch (error) {
    console.error("Error generating story:", error)
    throw new Error("Failed to generate story")
  }
}

export async function generateImage({
  prompt,
  style,
  lineWeight,
  complexity,
}: {
  prompt: string
  style: string
  lineWeight: number
  complexity: number
}): Promise<string> {
  // This is a placeholder for the Imagen API integration
  // In a real application, you would call the Imagen API here

  // For now, we'll return a placeholder image URL
  return `/placeholder.svg?height=512&width=512&query=${encodeURIComponent(prompt)}`
}

export async function generateCharacterSuggestions(storyText: string): Promise<string[]> {
  const prompt = `
    Based on the following story, suggest 3-5 character names that would be appropriate:
    
    ${storyText}
    
    Return only the character names, separated by commas.
  `

  try {
    const text = await generateTextWithApi(prompt)
    return text.split(",").map((name) => name.trim())
  } catch (error) {
    console.error("Error generating character suggestions:", error)
    throw new Error("Failed to generate character suggestions")
  }
}

export async function checkCharacterConsistency(
  storyText: string,
  characters: string[],
): Promise<{ consistent: boolean; issues: string[] }> {
  const prompt = `
    Analyze the following story for character consistency issues:
    
    Story: ${storyText}
    
    Characters: ${characters.join(", ")}
    
    Check if:
    1. Characters maintain consistent traits throughout the story
    2. Character names are used consistently
    3. Character behaviors align with their established personalities
    
    Return a JSON object with:
    - "consistent": boolean indicating if the story is consistent
    - "issues": array of strings describing any consistency issues found
  `

  try {
    const text = await generateTextWithApi(prompt)
    return JSON.parse(text)
  } catch (error) {
    console.error("Error checking character consistency:", error)
    throw new Error("Failed to check character consistency")
  }
}
