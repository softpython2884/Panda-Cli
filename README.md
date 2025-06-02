App Name: PANDA CLI Register

Core Features:

- Command-line prompt for:
  - service name
  - description
  - local port
  - domain (custom, e.g., myapp.panda)
  - type (website, api, game)
- Generate a local access URL (`http://localhost:PORT`)
- Start tunnel using ngrok or simulate a tunnel (for test/dev).
- Retrieve public tunnel URL.
- Generate a token (UUID).
- Send a POST request to the Pod at `/register` with all collected data.

Style Guidelines:

- Simple CLI UX:
  - Use `inquirer` or similar to ask questions.
  - Show success/failure messages clearly.
- Output a summary of registered info after success.

Technical Notes:

- Built in Node.js.
- Use `axios` to POST JSON data to the Pod.
- Compatible with ngrok or playit.gg (tunnel can be mocked).
- Store the token locally in a `.panda-token` file for reuse.
