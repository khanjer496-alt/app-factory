const transitions:Record<string,string[]>={
  discovered:["scored"],
  scored:["selected","rejected"],
  selected:["tailoring"],
  tailoring:["package_ready","needs_input","failed"],
  package_ready:["ready_for_review","needs_input","queued"],
  needs_input:["package_ready","ready_for_review","withdrawn"],
  ready_for_review:["queued","withdrawn"],
  queued:["submitting","withdrawn"],
  submitting:["submitted","failed","needs_input"],
  failed:["queued","withdrawn"],
  submitted:["interview","offer","rejected","withdrawn"],
  interview:["offer","rejected","withdrawn"],
  offer:["withdrawn"], rejected:[], withdrawn:[]
};
export function canTransition(from:string,to:string):boolean{return (transitions[from]||[]).includes(to)}
