// lib/types.ts

export interface ProjectMetadata {
  title: string;
  author: string;
  description: string;
  version: string;
  createdAt: string; // ISO_date_string
  updatedAt: string; // ISO_date_string
  tags?: string[];
  targetAgeGroup?: string;
  bindingType?: string;
}

export interface PagePrompt {
  positive: string;
  negative: string;
  stylePreset: string;
  aspectRatio: string;
  loraToggles: string[];
}

export interface PageLayoutOptions {
  margin?: number;
  bleed?: number;
  gutter?: number;
}

export type PageType = "text" | "image" | "textAndImage";

export interface Page {
  id: string; // Unique ID for the page
  pageNumber: number; // This might represent order within a chapter or overall.
  type: PageType;
  textContent?: string;
  imageAssetId?: string; // Reference to an image in the media library
  prompt?: PagePrompt;
  layoutOptions?: PageLayoutOptions;
}

export interface Chapter {
  title: string;
  pages: Page[];
}

export interface Story {
  chapters: Chapter[];
  templateId?: string; // Optional: if created from a template
}

export interface MediaAsset {
  id: string; // Unique ID for the image asset
  fileName: string;
  url: string; // Could be a local path or remote URL
  tags: string[];
  createdAt: string; // ISO_date_string
}

export interface LayoutSettings {
  pageSize: string; // e.g., "KDP_6x9", "A4_portrait"
  facingPageLayout: boolean; // Default: left text, right image
  margins: {
    top: number;
    bottom: number;
    inside: number; // Gutter side
    outside: number;
  };
  bleed: number; // Standard bleed, e.g., 0.125 inches
  spineAlignment: string; // e.g., "center"
  customPageSize?: { width: number; height: number; unit: "in" | "cm" | "mm" };
}

export interface UserPreferences {
  defaultModel: string;
  stylePresets: Array<{ name: string; prompt: string }>;
  exportFormatOptions: string[]; // e.g., "PDF_PRINT", "PDF_DIGITAL"
}

export interface ColorbookProject {
  id: string;
  projectMetadata: ProjectMetadata;
  story: Story;
  mediaLibrary: MediaAsset[];
  layoutSettings: LayoutSettings;
  userPreferences?: UserPreferences; // Optional for now
}
