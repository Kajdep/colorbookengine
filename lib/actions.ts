"use client"

import { v4 as uuidv4 } from "uuid"
import type { Project, ProjectMetadata, Page } from "./types"

// Load projects from localStorage
const loadProjects = (): Project[] => {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem("coloring-book-projects")
  return stored ? JSON.parse(stored) : []
}

// Save projects to localStorage
const saveProjects = (projects: Project[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem("coloring-book-projects", JSON.stringify(projects))
}

export async function createProject({
  title,
  description,
  metadata,
}: {
  title: string
  description: string
  metadata: ProjectMetadata
}): Promise<string> {
  const id = uuidv4()
  const now = new Date()
  const projects = loadProjects()

  const newProject = {
    id,
    title,
    description,
    createdAt: now,
    updatedAt: now,
    pages: [],
    metadata,
    characters: [],
  }

  projects.push(newProject)
  saveProjects(projects)

  return id
}

export async function getProjects(): Promise<Project[]> {
  return loadProjects()
}

export async function getProject(id: string): Promise<Project | undefined> {
  const projects = loadProjects()
  return projects.find((project) => project.id === id)
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<void> {
  const projects = loadProjects()
  const updatedProjects = projects.map((project) => {
    if (project.id === id) {
      return { ...project, ...updates, updatedAt: new Date() }
    }
    return project
  })
  saveProjects(updatedProjects)
}

export async function addPage(projectId: string, page: Omit<Page, "id" | "pageNumber">): Promise<string> {
  const id = uuidv4()
  const projects = loadProjects()
  const project = projects.find((p) => p.id === projectId)

  if (!project) {
    throw new Error("Project not found")
  }

  const newPage: Page = {
    id,
    pageNumber: project.pages.length + 1,
    ...page,
  }

  const updatedProjects = projects.map((p) => {
    if (p.id === projectId) {
      return { ...p, pages: [...p.pages, newPage], updatedAt: new Date() }
    }
    return p
  })

  saveProjects(updatedProjects)
  return id
}
