# **App Name**: PANDA CLI Register

## Core Features:

- Service Metadata Collection: Command-line prompt for service name, description, local port, domain (custom, e.g., myapp.panda), and type (website, api, game).
- Local Access URL Generation: Generate a local access URL (http://localhost:PORT).
- Tunnel Creation: Start tunnel using ngrok or simulate a tunnel (for test/dev).
- Public Tunnel URL Retrieval: Retrieve public tunnel URL.
- Token Generation: Generate a token (UUID).
- Service Registration: Send a POST request to the Pod at `/register` with all collected data.

## Style Guidelines:

- Use `inquirer` or similar to ask questions in the CLI.
- Show success/failure messages clearly.
- Output a summary of registered info after success.