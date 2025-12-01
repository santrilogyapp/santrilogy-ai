# Santrilogy AI - Smart Islamic Assistant

Santrilogy AI is an intelligent Islamic assistant that combines modern AI technology with traditional Islamic knowledge. Built as a dual-platform application that works both as a Next.js web app and a lightweight Blogger skin.

## Features

- **Islamic Knowledge Base**: Access to classical Islamic texts and references
- **Smart Tools**: Terjemah Kitab, Analisis I'rob, Tasykil, Tes Logika, Mode Belajar
- **Modern UI**: Gemini-like interface with glassmorphism design
- **Responsive Design**: Works on mobile and desktop devices
- **Multimodal Support**: Camera, gallery, and document uploads
- **Secure Architecture**: Proper separation of concerns with external CDN-loaded JavaScript

## Architecture

The application is built with separation of concerns in mind:
- **HTML/XML**: Structure (in the template XML file)
- **CSS**: Styling (in the `<b:skin>` section)
- **JavaScript**: Behavior (external app.js file loaded via CDN)

## Repository Structure

```
santrilogy-ai/
├── gemini-style-template.xml     # Main Blogger template
├── optimized-assets/
│   └── js/
│       └── app.js               # External JavaScript file
├── supabase/
│   ├── config.toml              # Supabase configuration
│   └── migrations/              # Database migration files
├── supabase-schema.sql          # Database schema
└── README.md                    # This file
```

## Setup Instructions

### For Publishing to GitHub and Using CDN

1. **Create GitHub Repository**:
   - Create a new repository named `santrilogy-ai` on your GitHub account
   - Replace `yourusername` in the template with your actual GitHub username

2. **Update the Script Reference**:
   - In `gemini-style-template.xml`, change the script source to:
   ```html
   <script src="https://cdn.jsdelivr.net/gh/yourusername/santrilogy-ai@main/optimized-assets/js/app.js"></script>
   ```

3. **Push Files to GitHub**:
   ```bash
   git remote add origin https://github.com/yourusername/santrilogy-ai.git
   git branch -M main
   git push -u origin main
   ```

4. **CDN Access**:
   - Your JavaScript file will be available at the CDN URL after pushing
   - jsDelivr will automatically cache and serve the file globally

### For Local Development

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/santrilogy-ai.git
   cd santrilogy-ai
   ```

2. **Update Script Reference for Local Development**:
   - Change the script source to local path for development:
   ```html
   <script src="./optimized-assets/js/app.js"></script>
   ```

## GitHub Setup Automation Script

We provide a setup script to automate the GitHub publishing process:

1. Make the script executable:
   ```bash
   chmod +x setup-github.sh
   ```

2. Run the script:
   ```bash
   ./setup-github.sh
   ```

3. Follow the prompts to enter your repository URL

## Usage

1. **Upload to Blogger**:
   - Upload `gemini-style-template.xml` as a custom template in Blogger
   - The external JavaScript will be loaded automatically via CDN

2. **Configuration**:
   - The JavaScript handles UI interactions
   - Backend API connections can be configured separately

## Security

- API keys should never be hardcoded in the client-side JavaScript
- Use server-side proxies for API calls to protect sensitive keys
- The JavaScript file is designed to be loaded externally for better security isolation

## Contributing

Feel free to fork this repository and submit pull requests for improvements.

## License

This project is licensed under the terms described in the original project license.