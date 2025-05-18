"use client"

// Get API keys from environment or localStorage
export const getApiKeys = () => {
  if (typeof window === "undefined") {
    return {
      openaiKey: process.env.OPENAI_API_KEY || "",
      imagenKey: process.env.IMAGEN_API_KEY || "",
      openrouterKey: process.env.OPENROUTER_API_KEY || "",
    }
  }

  return {
    openaiKey: localStorage.getItem("openai_api_key") || "",
    imagenKey: localStorage.getItem("imagen_api_key") || "",
    openrouterKey: localStorage.getItem("openrouter_api_key") || "",
  }
}

// Save API keys to localStorage
export const saveApiKeys = (keys: {
  openaiKey?: string
  imagenKey?: string
  openrouterKey?: string
}) => {
  if (typeof window === "undefined") return

  if (keys.openaiKey) localStorage.setItem("openai_api_key", keys.openaiKey)
  if (keys.imagenKey) localStorage.setItem("imagen_api_key", keys.imagenKey)
  if (keys.openrouterKey) localStorage.setItem("openrouter_api_key", keys.openrouterKey)
}

// Get the active text generation API (OpenAI or OpenRouter)
export const getActiveTextApi = () => {
  if (typeof window === "undefined") return "openai"
  return localStorage.getItem("active_text_api") || "openai"
}

// Set the active text generation API
export const setActiveTextApi = (api: "openai" | "openrouter") => {
  if (typeof window === "undefined") return
  localStorage.setItem("active_text_api", api)
}
