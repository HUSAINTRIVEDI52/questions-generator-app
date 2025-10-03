# AI Question Paper Generator

This is an intelligent tool to generate customized question papers for the GSEB curriculum using the Google Gemini API.

## Project Setup and Local Development

### Prerequisites
- [Node.js](https://nodejs.org/en) (v18 or later) and npm
- A Google Gemini API Key

### Installation
1.  Clone the repository or download the source code.
2.  Navigate to the project directory in your terminal.
3.  Install the required dependencies:
    ```bash
    npm install
    ```

### Environment Variables
1.  Create a new file in the root of the project named `.env.local`.
2.  Add your Google Gemini API key to this file. **Do not** share this file or commit it to version control.
    ```
    VITE_API_KEY=YOUR_API_KEY_HERE
    ```

### Running the Development Server
To start the local development server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173` (or the URL provided in your terminal).

## Deployment to Vercel

This project is configured for easy deployment on Vercel.

1.  **Push to GitHub**: Make sure your project is on a GitHub repository.
2.  **Import to Vercel**: Connect your GitHub account to Vercel and import the project repository. Vercel will automatically detect that it's a Vite project.
3.  **Configure Environment Variable**:
    - In your Vercel project dashboard, go to **Settings > Environment Variables**.
    - Add a new variable:
        - **Name**: `VITE_API_KEY`
        - **Value**: Paste your Gemini API key here.
4.  **Deploy**: Trigger a new deployment. Vercel will build and host your application on a public URL.

## Available Scripts

-   `npm run dev`: Starts the Vite development server.
-   `npm run build`: Builds the application for production into the `dist` folder.
-   `npm run preview`: Serves the production build locally to preview it.
