import json
from urllib.parse import urlencode, quote
from urllib.request import Request, urlopen
from urllib.error import HTTPError

class JobAgentClient:
    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key

    def _request(self, path: str, method: str = "GET", payload=None):
        data = None if payload is None else json.dumps(payload).encode("utf-8")
        request = Request(
            self.base_url + path,
            data=data,
            method=method,
            headers={"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"},
        )
        try:
            with urlopen(request) as response:
                return json.loads(response.read().decode("utf-8"))
        except HTTPError as exc:
            body = exc.read().decode("utf-8")
            try:
                message = json.loads(body).get("error", body)
            except Exception:
                message = body
            raise RuntimeError(f"Job Agent API {exc.code}: {message}") from exc

    def list_jobs(self, min_score=0, limit=25):
        return self._request("/v1/jobs?" + urlencode({"min_score": min_score, "limit": limit}))

    def score_job(self, job_id: str):
        return self._request(f"/v1/jobs/{quote(job_id, safe='')}/score", "POST", {})

    def tailor_resume(self, job_id: str):
        return self._request(f"/v1/jobs/{quote(job_id, safe='')}/tailor", "POST", {})

    def list_applications(self, limit=25):
        return self._request("/v1/applications?" + urlencode({"limit": limit}))

    def get_application(self, application_id: str):
        return self._request(f"/v1/applications/{quote(application_id, safe='')}")

    def submit_application(self, application_id: str):
        return self._request(f"/v1/applications/{quote(application_id, safe='')}/submit", "POST", {"confirm": True})
