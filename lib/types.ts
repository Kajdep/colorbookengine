export interface Project {
  id: string
  title: string
  description: string
  coverImage?: string
  createdAt: Date
  updatedAt: Date
  pages: Page[]
  metadata: ProjectMetadata
}

export interface ProjectMetadata {
  author: string
  targetAgeGroup: string
  dimensions: {
    width: number
    height: number
    unit: "in" | "cm" | "mm"
  }
  bindingType: "spiral" | "perfect" | "saddle" | "hardcover"
  tags: string[]
}

export interface Page {
  id: string
  type: "story" | "coloring"
  content: StoryContent | ColoringContent
  pageNumber: number
}

export interface StoryContent {
  text: string
  wordCount: number
  characterNames: string[]
  version: number
  versions: { text: string; timestamp: Date }[]
}

export interface ColoringContent {
  imageUrl: string
  prompt: string
  style: string
  characters: string[]
  generationParams: {
    model: string
    lineWeight: number
    complexity: number
  }
}

export interface Character {
  id: string
  name: string
  type: string
  traits: string[]
  description: string
  imageUrl?: string
}

export interface Template {
  id: string
  name: string
  description: string
  pageCount: number
  storyPageTemplate: string
  imagePromptTemplate: string
  dimensions: {
    width: number
    height: number
    unit: "in" | "cm" | "mm"
  }
}
