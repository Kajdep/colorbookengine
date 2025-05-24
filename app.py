import streamlit as st
import json
import os
from pathlib import Path
from modules.prompt_templates import load_templates
from modules.prompt_injector import build_prompt
from modules.image_generator import generate_image

# Title
st.set_page_config(page_title="ColorbookEngine", layout="wide")
st.title("🖍️ ColorbookEngine")

# Load templates
template_path = Path("assets/templates")
templates = load_templates(template_path)
template_names = list(templates.keys())

# Sidebar controls
st.sidebar.header("🧠 Prompt Configuration")
selected_template = st.sidebar.selectbox("Select a prompt template:", template_names)
template_data = templates[selected_template]

# Dynamic input fields
user_inputs = {}
st.sidebar.subheader("Fill in template variables")
for key in template_data["variables"]:
    user_inputs[key] = st.sidebar.text_input(f"{key}", value="")

# Injected prompt
final_prompt = build_prompt(template_data["template"], user_inputs)

# Display preview
st.subheader("📜 Final Prompt")
st.code(final_prompt, language="text")

# Image generation (stubbed)
st.subheader("🎨 Image Preview")
if st.button("Generate Image"):
    try:
        result = generate_image(final_prompt)
        st.image(result["image_path"], caption="Generated Image")
    except Exception as e:
        st.error(f"Image generation failed: {e}")

# Debug tools
with st.expander("🔧 Debug Info"):
    st.json({
        "selected_template": selected_template,
        "user_inputs": user_inputs,
        "final_prompt": final_prompt
    })
