const base = process.env.JOB_API_URL || "https://YOUR_DOMAIN/v1";
const key = process.env.JOB_API_KEY!;
const headers = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };

const jobs = await fetch(`${base}/jobs?min_score=85&limit=10`, { headers }).then(r => r.json());
console.log(jobs);

// Example: tailor the top job, but do not submit automatically.
const jobId = jobs.data?.[0]?.id;
if (jobId) {
  const prepared = await fetch(`${base}/jobs/${jobId}/tailor`, { method:"POST", headers }).then(r=>r.json());
  console.log(prepared);
}
