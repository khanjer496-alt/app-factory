import { describe, expect, it } from "vitest";
import { deterministicPass } from "../worker/job/rules";
import { canTransition } from "../worker/job/state";
import { isLinkedInJobUrl } from "../worker/job/linkedin";
const rules={roles:["Account Manager"],locations:["Remote"],industries:[],excludedCompanies:["BadCo"],excludedKeywords:["commission only"],minimumSalary:null,salaryCurrency:null,minimumMatch:85,maxApplicationsPerDay:5,autoPrepare:true,autoSubmit:false};
const job={sourceProvider:"manual",sourceKey:"1",sourceUrl:"https://example.com/job",company:"GoodCo",title:"Senior Account Manager",location:"Remote",description:"Manage strategic accounts"};
describe("job engine",()=>{it("passes relevant jobs",()=>expect(deterministicPass(job,rules).pass).toBe(true));it("blocks excluded company",()=>expect(deterministicPass({...job,company:"BadCo"},rules).pass).toBe(false));it("enforces state transitions",()=>{expect(canTransition("queued","submitting")).toBe(true);expect(canTransition("discovered","submitted")).toBe(false)});it("recognizes LinkedIn job URLs",()=>{expect(isLinkedInJobUrl("https://www.linkedin.com/jobs/view/123")).toBe(true);expect(isLinkedInJobUrl("https://evil.example/jobs/123")).toBe(false)})});
