/* Pure, deterministic demo logic. No external requests or model inference. */
(function(root){
  'use strict';
  function calculateCapacity(values){
    const limits={volume:10000000,minutes:10000,rate:100000,suitability:100,saving:100};
    const numbers={};
    for(const [key,max] of Object.entries(limits)){
      const raw=values[key]; const n=Number(raw);
      if(raw===''||raw===null||raw===undefined||!Number.isFinite(n)||n<0||n>max||(key==='volume'&&!Number.isInteger(n))) throw new RangeError('Enter valid, non-negative values within the displayed field limits. Monthly volume must be a whole number.');
      numbers[key]=n;
    }
    const baseline=numbers.volume*12*numbers.minutes/60;
    const fraction=numbers.suitability/100*numbers.saving/100;
    const hours=baseline*fraction;
    return {baseline,hours,value:hours*numbers.rate,percent:fraction*100};
  }
  const industries={
    manufacturing:{name:'Manufacturing & industrial',context:'Validate against plant, supplier and ERP data. Protect production continuity and contractual controls.',pilot:'Start with one plant and a bounded supplier or transaction cohort.'},
    financial:{name:'Financial services',context:'Assess sensitive data, access restrictions, record retention and applicable regulatory obligations before any pilot.',pilot:'Use a de-identified dataset in a controlled environment, with compliance and risk owners involved.'},
    logistics:{name:'Logistics & distribution',context:'Account for carrier data quality, shipment events, multiple document formats and operational cut-off times.',pilot:'Start with one lane, carrier or distribution center and a defined exception type.'},
    professional:{name:'Professional services',context:'Preserve client confidentiality, engagement-level access controls and contractual data restrictions.',pilot:'Select one internal process or an engagement with explicit data-use authorization.'}
  };
  const opportunities={
    finance:{
      manual:{title:'AI-assisted invoice exception triage',description:'Compare invoice and purchase order data, classify discrepancies and prepare an evidence-backed recommendation for a finance reviewer.',value:'Capacity',measure:'Review time & backlog',feasibility:'Moderate',dependency:'Structured PO data required',risk:'Moderate',control:'No autonomous payments',next:'Measure baseline exception handling time, map approval thresholds and validate recommendations against historical cases.'},
      visibility:{title:'Finance exception intelligence',description:'Summarize unresolved exceptions and aging patterns, link findings to source records and help finance teams prioritize follow-up.',value:'Decision speed',measure:'Aging & time to resolution',feasibility:'Moderate',dependency:'Reliable status data',risk:'Moderate',control:'Validate summaries',next:'Agree on a source of truth, validate aging logic and compare generated summaries with analyst review.'},
      control:{title:'Finance control evidence assistant',description:'Organize approval evidence and flag missing documentation for review without making final compliance or accounting decisions.',value:'Control quality',measure:'Evidence completeness',feasibility:'Moderate',dependency:'Approval trail access',risk:'Elevated',control:'Control owner sign-off',next:'Define required evidence and retention rules with finance control owners, then test false positives and omissions.'}
    },
    procurement:{
      manual:{title:'Purchase request preparation assistant',description:'Structure incomplete purchase requests, identify missing fields and draft clarifying questions before a buyer reviews the request.',value:'Capacity',measure:'Buyer preparation time',feasibility:'Higher',dependency:'Defined request templates',risk:'Moderate',control:'Buyer approval retained',next:'Choose one purchasing category, define mandatory data and compare request quality and handling time before and after assistance.'},
      visibility:{title:'Supplier obligation intelligence',description:'Extract and summarize obligations from approved supplier documents, with source references for procurement specialists to verify.',value:'Visibility',measure:'Search & review time',feasibility:'Moderate',dependency:'Accessible contract corpus',risk:'Elevated',control:'Verify legal interpretation',next:'Use a small approved document set, test source traceability and involve commercial or legal owners in validation.'},
      control:{title:'Procurement policy check assistant',description:'Check purchase requests against an approved policy checklist and route potential exceptions to the responsible procurement reviewer.',value:'Consistency',measure:'Exception identification',feasibility:'Moderate',dependency:'Versioned policy rules',risk:'Elevated',control:'No supplier selection',next:'Translate policy into testable rules, define escalation paths and test edge cases before operational use.'}
    },
    operations:{
      manual:{title:'Service request triage assistant',description:'Classify incoming requests, suggest routing and draft a response for an operations specialist to review.',value:'Capacity',measure:'Triage time & rework',feasibility:'Higher',dependency:'Stable request categories',risk:'Moderate',control:'Review before sending',next:'Select one queue, create a labeled evaluation set and measure routing accuracy and review time.'},
      visibility:{title:'Operational exception briefing',description:'Bring approved operational signals into a concise briefing, distinguishing observed events from suggested actions.',value:'Decision speed',measure:'Time to detect & respond',feasibility:'Moderate',dependency:'Timely operational data',risk:'Moderate',control:'Source-linked signals',next:'Agree on signal definitions and freshness requirements, then validate briefings with operational owners.'},
      control:{title:'Operational procedure assistant',description:'Retrieve approved procedures and assemble evidence for a reviewer when a workflow diverges from the expected process.',value:'Consistency',measure:'Procedure adherence',feasibility:'Moderate',dependency:'Current procedure library',risk:'Elevated',control:'No safety-critical actions',next:'Scope out safety-critical decisions, establish document ownership and test retrieval quality and escalation behavior.'}
    }
  };
  function getOpportunity(industry,fn,challenge){
    const context=industries[industry];const item=opportunities[fn]?.[challenge];
    if(!context||!item)throw new RangeError('Choose a supported context.');
    return {...item,industry:context.name,context:context.context,pilot:context.pilot,risk:industry==='financial'?'Elevated':item.risk,feasibility:industry==='financial'?'Moderate':item.feasibility};
  }
  function invoiceVariance(){const quantity=100,invoiceUnit=120,poUnit=100;return {invoiceTotal:quantity*invoiceUnit,poTotal:quantity*poUnit,amount:quantity*(invoiceUnit-poUnit),percent:(invoiceUnit-poUnit)/poUnit*100};}
  class Workflow{
    constructor(){this.reset();}
    reset(){this.step=0;this.decision=null;this.events=['Synthetic invoice and purchase order loaded.'];}
    advance(){if(this.step>=4)throw new Error('A human decision is required before the audit step.');this.step++;this.events.push(['','Comparison complete: SEK 2,000 variance; 20% above PO.','Price mismatch categorized; underlying cause remains unverified.','Draft recommendation prepared with source values.','Recommendation routed to the simulated finance reviewer.'][this.step]);}
    decide(approved){if(this.step!==4)throw new Error('Review the recommendation before deciding.');if(typeof approved!=='boolean')throw new TypeError('Decision must be explicit.');this.decision=approved?'approved':'rejected';this.step=5;this.events.push(approved?'Human reviewer approved the recommendation to request supplier clarification.':'Human reviewer rejected the recommendation and escalated for manual investigation.');this.events.push('Simulation complete. No message sent, ERP updated or payment released.');}
  }
  const api={calculateCapacity,getOpportunity,invoiceVariance,Workflow};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else root.BeyondEngine=api;
})(typeof window!=='undefined'?window:globalThis);
