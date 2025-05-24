// lib/story-templates.ts
import { PageType } from './types'; // Assuming PageType is text | image | textAndImage

export interface StoryTemplateChapterDefinition {
  title: string; // Can be a placeholder like "Chapter %n" or a thematic title
  pageCount: number;
  defaultPageType: PageType; // Or perhaps an array of page types for mixed chapters
  suggestedPrompts?: string[]; // Prompts for image pages or themes for text pages
}

export interface StoryTemplate {
  id: string; // e.g., "simple-childrens-book"
  name: string;
  description: string;
  chapters: StoryTemplateChapterDefinition[];
}

export const storyTemplates: StoryTemplate[] = [
  {
    id: "short-childrens-story",
    name: "Short Children's Story (3 Chapters)",
    description: "A simple template for a children's story with alternating text and image pages.",
    chapters: [
      {
        title: "Introduction",
        pageCount: 4, // 2 text, 2 image
        defaultPageType: "text", // Will alternate based on logic in createProject
        suggestedPrompts: [
          "A curious character in a cozy home.",
          "The character discovers something unusual.",
        ],
      },
      {
        title: "The Adventure Begins",
        pageCount: 4, // 2 text, 2 image
        defaultPageType: "text",
        suggestedPrompts: [
          "The character explores a new place.",
          "A friendly creature appears.",
        ],
      },
      {
        title: "A Happy Resolution",
        pageCount: 2, // 1 text, 1 image
        defaultPageType: "text",
        suggestedPrompts: [
          "The character solves a small problem.",
        ],
      },
    ],
  },
  {
    id: "adventure-quest-outline",
    name: "Adventure Quest Outline (5 Chapters)",
    description: "A template for an adventure story, focusing more on imagery and key plot points.",
    chapters: [
      {
        title: "The Call to Adventure",
        pageCount: 3, // 1 text, 2 image
        defaultPageType: "image",
        suggestedPrompts: [
          "The hero's ordinary world.",
          "A mysterious map or message.",
          "The hero accepts the quest.",
        ],
      },
      {
        title: "Trials and Tribulations",
        pageCount: 5, // 2 text, 3 image
        defaultPageType: "image",
        suggestedPrompts: [
          "Navigating a treacherous landscape.",
          "Overcoming a monster or obstacle.",
          "Meeting a wise mentor.",
          "A moment of despair or doubt.",
          "Discovering a hidden clue.",
        ],
      },
      {
        title: "The Climax",
        pageCount: 3, // 1 text, 2 image
        defaultPageType: "image",
        suggestedPrompts: [
          "Confronting the main antagonist.",
          "The final battle or challenge.",
          "A surprising twist.",
        ],
      },
      {
        title: "The Reward",
        pageCount: 2, // 1 text, 1 image
        defaultPageType: "textAndImage",
        suggestedPrompts: [
          "Claiming the prize or achieving the goal.",
          "A moment of celebration.",
        ],
      },
      {
        title: "Homeward Bound",
        pageCount: 3, // 2 text, 1 image
        defaultPageType: "text",
        suggestedPrompts: [
          "The journey back home.",
          "Reflections on the adventure.",
          "A changed world or character.",
        ],
      },
    ],
  },
  {
    id: "simple-coloring-book",
    name: "Simple Coloring Book (1 Chapter)",
    description: "A basic template for a coloring book with multiple image pages in one chapter.",
    chapters: [
      {
        title: "Coloring Fun",
        pageCount: 10,
        defaultPageType: "image",
        suggestedPrompts: [
          "Friendly animals playing.",
          "Magical creatures in a forest.",
          "Exciting vehicles and robots.",
          "Beautiful flowers and gardens.",
          "Fun patterns and mandalas.",
          "Under the sea adventure.",
          "Space exploration.",
          "Cute monsters.",
          "Seasonal themes (e.g., winter wonderland).",
          "Fantasy castles and dragons.",
        ],
      },
    ],
  },
];
