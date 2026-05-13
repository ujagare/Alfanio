# Render MCP Setup

Render's official hosted MCP server is configured for Codex in:

```text
C:\Users\ujaga\.codex\config.toml
```

The configuration uses the `RENDER_API_KEY` environment variable so the API key is not committed to this repository.

## Required Local Setup

Create a Render API key from:

```text
https://dashboard.render.com/account/api-keys
```

Then set it in PowerShell:

```powershell
setx RENDER_API_KEY "your_render_api_key_here"
```

Restart Codex after setting the variable.

## Config Added

```toml
[mcp_servers.render]
url = "https://mcp.render.com/mcp"
bearer_token_env_var = "RENDER_API_KEY"
```

After restart, use prompts like:

```text
Set my Render workspace to <workspace name>
List my Render services
Show recent logs for alfanio-backend
```
