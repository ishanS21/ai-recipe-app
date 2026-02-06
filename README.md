# AI Recipe Finder

AI Recipe Finder is a full-stack web application that suggests recipes based on the ingredients a user already has and their dietary preference (Vegetarian or Non-Vegetarian).

The application uses an AI model to intelligently generate recipe ideas, prioritizing maximum ingredient overlap while allowing flexibility in ingredient usage.

## Features

- Ingredient-based recipe suggestions
- Veg / Non-Veg filtering
- AI-powered recipe generation
- Generates ~5 relevant recipes per request
- Recipes may use a subset of provided ingredients
- Intelligent ranking based on ingredient match
- Clean and simple user interface
- Deployed online


## Tech Stack

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Node.js
- Express.js

### AI Integration
- Groq API (LLaMA-based model)

### Deployment & Tools
- Git & GitHub (version control)
- Render (hosting)


---

## How It Works

1. User enters available ingredients (comma-separated)  
2. User selects Veg or Non-Veg preference  
3. Frontend sends a request to the backend (`/recipes`)  
4. Backend constructs a structured AI prompt  
5. AI returns recipe suggestions in JSON format  
6. Backend ranks recipes based on ingredient match  
7. Frontend displays the recipes as cards  

## Completed Features

- Ingredient-based recipe generation  
- Veg / Non-Veg filtering logic  
- Flexible ingredient usage (subset allowed)  
- Intelligent recipe ranking  
- Error-safe backend handling  
- Stable frontend UI  
- GitHub version control  
- Online deployment  

## Local Setup

```bash
git clone https://github.com/ishanS21/ai-recipe-app.git
cd ai-recipe-app
npm install
node server.js
