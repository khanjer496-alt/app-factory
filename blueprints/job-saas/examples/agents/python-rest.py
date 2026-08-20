import os, requests
base = os.getenv("JOB_API_URL", "https://YOUR_DOMAIN/v1")
headers = {"Authorization": f"Bearer {os.environ['JOB_API_KEY']}"}

jobs = requests.get(f"{base}/jobs", params={"min_score": 85, "limit": 10}, headers=headers).json()
print(jobs)

# Submission is a separate, explicit call and should use a key that was intentionally
# created with applications:submit scope.
