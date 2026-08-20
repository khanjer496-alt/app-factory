import os
from openai import OpenAI

client = OpenAI()
response = client.responses.create(
    model="gpt-5",
    input="Find my best matching jobs and prepare the strongest application. Do not submit anything.",
    tools=[{
        "type": "mcp",
        "server_label": "job_agent",
        "server_url": os.getenv("JOB_MCP_URL", "https://YOUR_DOMAIN/mcp"),
        "headers": {"Authorization": f"Bearer {os.environ['JOB_API_KEY']}"},
        "allowed_tools": ["search_jobs", "score_job", "tailor_resume", "prepare_application", "get_application_status"],
        "require_approval": "always"
    }]
)
print(response.output_text)
