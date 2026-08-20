import type { NormalizedJob } from "./types";
import { safeJson } from "./util";

export interface SearchRules { roles:string[];locations:string[];industries:string[];excludedCompanies:string[];excludedKeywords:string[];minimumSalary?:number|null;salaryCurrency?:string|null;minimumMatch:number;maxApplicationsPerDay:number;autoPrepare:boolean;autoSubmit:boolean; }

export function rowRules(row:any):SearchRules{return {roles:safeJson(row.roles_json,[]),locations:safeJson(row.locations_json,[]),industries:safeJson(row.industries_json,[]),excludedCompanies:safeJson(row.excluded_companies_json,[]),excludedKeywords:safeJson(row.excluded_keywords_json,[]),minimumSalary:row.minimum_salary,salaryCurrency:row.salary_currency,minimumMatch:Number(row.minimum_match||85),maxApplicationsPerDay:Number(row.max_applications_per_day||5),autoPrepare:Boolean(row.auto_prepare),autoSubmit:Boolean(row.auto_submit)}}

function containsAny(text:string, values:string[]):boolean { const lower=text.toLowerCase(); return values.some(x=>lower.includes(x.toLowerCase())); }
export function deterministicPass(job:NormalizedJob,rules:SearchRules):{pass:boolean;reason?:string}{
  if(rules.excludedCompanies.length && containsAny(job.company,rules.excludedCompanies)) return {pass:false,reason:"excluded_company"};
  const searchable=`${job.title} ${job.description} ${job.company}`;
  if(rules.excludedKeywords.length && containsAny(searchable,rules.excludedKeywords)) return {pass:false,reason:"excluded_keyword"};
  if(rules.roles.length && !containsAny(job.title,rules.roles)) return {pass:false,reason:"role"};
  if(rules.locations.length && job.location && !containsAny(job.location,rules.locations) && !String(job.workplaceType).toLowerCase().includes("remote")) return {pass:false,reason:"location"};
  if(rules.minimumSalary && job.salaryMax && job.salaryMax < rules.minimumSalary) return {pass:false,reason:"salary"};
  return {pass:true};
}
