"use client"

import { v4 as uuidv4 } from "uuid"
import type {
  ColorbookProject,
  ProjectMetadata,
  Page as ColorbookPage,
  Story,
  Chapter,
  MediaAsset,
  LayoutSettings,
} from "./types"

// Load projects from localStorage
const loadProjects = (): ColorbookProject[] => {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem("coloring-book-projects")
  return stored ? (JSON.parse(stored) as ColorbookProject[]) : []
}

// Save projects to localStorage
const saveProjects = (projects: ColorbookProject[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem("coloring-book-projects", JSON.stringify(projects))
}

export async function createProject(
  initialMetadata: Partial<ProjectMetadata>,
  initialLayoutSettings?: Partial<LayoutSettings>,
  templateId?: string
): Promise<string> {
  const projectId = uuidv4()
  const now = new Date().toISOString()
  const projects = loadProjects()

  const defaultLayoutSettings: LayoutSettings = {
    pageSize: "KDP_6x9",
    facingPageLayout: true,
    margins: { top: 1, bottom: 1, inside: 0.75, outside: 0.5 },
    bleed: 0.125,
    spineAlignment: "center",
  }

  const newProject: ColorbookProject = {
    id: projectId,
    projectMetadata: {
      // Defaults for required fields
      title: "Untitled Project",
      author: "Unknown Author",
      description: "",
      version: "1.0.0",
      // Merge provided initialMetadata
      ...initialMetadata,
      // Overwrite createdAt and updatedAt
      createdAt: now,
      updatedAt: now,
    },
    story: { chapters: [], templateId: templateId || undefined }, // Store templateId
    mediaLibrary: [],
    layoutSettings: {
      ...defaultLayoutSettings,
      ...initialLayoutSettings,
      // Ensure customPageSize is handled correctly, if pageSize is 'custom' or if customPageSize is directly provided
      pageSize: initialLayoutSettings?.customPageSize
        ? "custom"
        : initialLayoutSettings?.pageSize || defaultLayoutSettings.pageSize,
    },
  }

  // If a templateId is provided, generate chapters and pages
  if (templateId) {
    const { storyTemplates } = await import('@/lib/story-templates'); // Dynamically import to avoid circular deps if any
    const template = storyTemplates.find(t => t.id === templateId);

    if (template) {
      newProject.story.chapters = template.chapters.map((chapterDef, chapterIndex) => {
        const newChapter: Chapter = {
          title: chapterDef.title.replace("%n", String(chapterIndex + 1)), // Replace %n with chapter number
          pages: [],
        };

        for (let i = 0; i < chapterDef.pageCount; i++) {
          // Simple alternating page type logic for mixed content, if not 'textAndImage'
          let pageType = chapterDef.defaultPageType;
          if (chapterDef.defaultPageType === 'text' && template.id === "short-childrens-story") { // Example: specific logic for alternating
             pageType = i % 2 === 0 ? 'text' : 'image';
          } else if (chapterDef.defaultPageType === 'image' && template.id === "adventure-quest-outline" && chapterDef.title === "Trials and Tribulations") {
             // Example: more complex alternation or specific page types
             if (i === 0 || i === 2) pageType = 'text'; // First and third page text, rest image
             else pageType = 'image';
          }


          const newPage: ColorbookPage = {
            id: uuidv4(),
            pageNumber: i + 1, // pageNumber is relative to the chapter
            type: pageType,
            textContent: pageType === 'text' || pageType === 'textAndImage' ? '' : undefined, // Empty content for text pages
            imageAssetId: undefined, // No image asset initially
            // You can add placeholder prompts or other data from chapterDef.suggestedPrompts if needed
            prompt: pageType === 'image' || pageType === 'textAndImage' ? 
                    (chapterDef.suggestedPrompts && chapterDef.suggestedPrompts[i] ? { positive: chapterDef.suggestedPrompts[i], negative: "", stylePreset: "default", aspectRatio: "1:1", loraToggles: [] } : undefined)
                    : undefined,
          };
          newChapter.pages.push(newPage);
        }
        return newChapter;
      });
    } else {
      console.warn(`Template with ID "${templateId}" not found.`);
    }
  }


  projects.push(newProject)
  saveProjects(projects)

  return projectId
}

export async function getProjects(): Promise<ColorbookProject[]> {
  return loadProjects()
}

export async function getProject(id: string): Promise<ColorbookProject | undefined> {
  const projects = loadProjects()
  return projects.find((project) => project.id === id)
}

export async function updateProject(id: string, updates: Partial<ColorbookProject>): Promise<void> {
  const projects = loadProjects()
  const updatedProjects = projects.map((project) => {
    if (project.id === id) {
      const updatedProject = { ...project, ...updates }
      updatedProject.projectMetadata.updatedAt = new Date().toISOString()
      return updatedProject
    }
    return project
  })
  saveProjects(updatedProjects)
}

export async function updatePageContent(projectId: string, pageId: string, newContent: string): Promise<void> {
  const projects = loadProjects()
  let projectFound = false
  let pageFound = false

  const updatedProjects = projects.map((project) => {
    if (project.id === projectId) {
      projectFound = true
      project.projectMetadata.updatedAt = new Date().toISOString() // Update project timestamp

      for (const chapter of project.story.chapters) {
        const pageIndex = chapter.pages.findIndex(p => p.id === pageId)
        if (pageIndex !== -1) {
          chapter.pages[pageIndex].textContent = newContent
          // Optionally, update a page-specific updatedAt if your Page interface has it
          pageFound = true
          break // Stop searching chapters once page is found and updated
        }
      }
    }
    return project
  })

  if (!projectFound) {
    throw new Error(`Project with ID ${projectId} not found.`)
  }
  if (!pageFound) {
    throw new Error(`Page with ID ${pageId} not found in project ${projectId}.`)
  }

  saveProjects(updatedProjects)
}


export async function addPage(
  projectId: string,
  chapterTitle: string, // For now, assume chapterTitle must match an existing chapter.
  initialPageData: Partial<Omit<ColorbookPage, 'id' | 'pageNumber'>>
): Promise<ColorbookPage | null> {
  const projects = loadProjects()
  const projectIndex = projects.findIndex(p => p.id === projectId)

  if (projectIndex === -1) {
    throw new Error(`Project with ID ${projectId} not found.`)
  }

  const project = projects[projectIndex]
  const chapterIndex = project.story.chapters.findIndex(c => c.title === chapterTitle)

  if (chapterIndex === -1) {
    // For now, if chapter is not found, throw an error.
    // Future enhancement: create chapter if not found, or add to a default chapter.
    throw new Error(`Chapter with title "${chapterTitle}" not found in project ${projectId}.`)
  }

  const chapter = project.story.chapters[chapterIndex]
  const newPageId = uuidv4()
  const newPageNumber = chapter.pages.length + 1 // Page number is relative to the chapter

  const newPage: ColorbookPage = {
    id: newPageId,
    pageNumber: newPageNumber,
    type: initialPageData.type || 'text', // Default to 'text' type
    textContent: initialPageData.textContent || '', // Default to empty string for text content
    imageAssetId: initialPageData.imageAssetId,
    prompt: initialPageData.prompt,
    layoutOptions: initialPageData.layoutOptions,
    // Add any other fields from Page interface with defaults if necessary
  }

  // Add the new page to the chapter
  chapter.pages.push(newPage)
  project.projectMetadata.updatedAt = new Date().toISOString()

  // Save the updated projects array
  projects[projectIndex] = project
  saveProjects(projects)

  return newPage
}
