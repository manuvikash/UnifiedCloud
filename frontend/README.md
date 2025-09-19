# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/d58f4ba2-21e0-45af-a4d6-51eff797c0b4

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/d58f4ba2-21e0-45af-a4d6-51eff797c0b4) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Gladia API (for real-time speech-to-text)

## Speech-to-Text Feature

The chat panel now includes real-time speech-to-text functionality powered by Gladia's API. Here's how to use it:

### Features:
- **Real-time transcription**: Click the microphone icon to start recording your voice
- **Live preview**: See your speech being transcribed in real-time
- **Visual feedback**: The microphone button changes color and pulses while recording
- **Error handling**: Clear error messages if something goes wrong
- **Automatic integration**: Transcribed text is automatically added to the input field

### Setup:
1. The API key is configured in the env variable
2. The feature requires microphone permissions in your browser
3. Works with the existing chat functionality - transcribed text can be edited before sending

### Usage:
1. Click the microphone icon (🎤) in the chat input area
2. Speak clearly into your microphone
3. Watch the real-time transcription appear
4. Click the microphone again to stop recording
5. The final transcription will be added to your input field
6. Edit if needed, then send as usual

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/d58f4ba2-21e0-45af-a4d6-51eff797c0b4) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
