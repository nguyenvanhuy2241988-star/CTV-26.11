import test from 'node:test';
import assert from 'node:assert/strict';
import { dispatchEmail, queueRpc } from '../api/_email-queue.js';
import worker from '../api/cron/email-queue.js';
import requests from '../api/requests.js';
const lead = {id:'CVT-QA',company:'QA',name:'QA'};
const response = (status, body) => new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json'}});
const res = () => ({code:200,data:null,setHeader(){},status(c){this.code=c;return this;},json(d){this.data=d;return this;}});
test('gateway accepted is distinct from inbox delivery; classify refusal and ambiguity',async t=>{
 const old=global.fetch;
 try {
  for (const [status,body,state] of [[200,{success:'true'},'gateway_accepted'],[200,{success:false,message:'Needs Activation'},'activation_required'],[200,{},'unconfirmed'],[200,{success:false,message:'Rejected'},'failed'],[429,{},'retry'],[503,{},'unconfirmed'],[403,{},'failed']]) {
   global.fetch=async()=>response(status,body);
   assert.equal((await dispatchEmail(lead)).state,state);
  }
  global.fetch=async()=>{throw new Error('timeout');};
  assert.equal((await dispatchEmail(lead)).state,'unconfirmed');
 } finally {global.fetch=old;}
});
test('worker authorization fails before touching DB',async()=>{
 process.env.CRON_SECRET='test-secret';let r=res();
 await worker({method:'GET',headers:{}},r);assert.equal(r.code,401);
 r=res();await worker({method:'POST',headers:{authorization:'Bearer test-secret'}},r);assert.equal(r.code,405);
});
test('preview worker cannot consume production queue',async()=>{
 process.env.CRON_SECRET='test-secret';process.env.VERCEL_ENV='preview';delete process.env.CVT_EMAIL_QUEUE_TEST;
 const r=res();await worker({method:'GET',headers:{authorization:'Bearer test-secret'}},r);assert.equal(r.code,409);
});
test('queue persists result with fencing token and worker only claims one at a time',async()=>{
 const old=global.fetch;const calls=[];
 process.env.SUPABASE_URL='https://test.invalid';process.env.SUPABASE_SERVICE_ROLE_KEY='test';process.env.VERCEL_ENV='production';
 try {
  global.fetch=async(url,opt)=>{
   calls.push(String(url));
   if(String(url).endsWith('cvt_claim_email')) return response(200,calls.filter(x=>x.endsWith('cvt_claim_email')).length===1?{requestId:'CVT-QA',token:'test-token',lead}:null);
   if(String(url).includes('formsubmit.co')) return response(200,{success:true});
   if(String(url).endsWith('cvt_finish_email')) {const b=JSON.parse(opt.body);assert.equal(b.p_token,'test-token');assert.equal(b.p_state,'gateway_accepted');return response(200,true);}
   throw new Error('unexpected fetch');
  };
  const r=res();await worker({method:'GET',headers:{authorization:'Bearer test-secret'}},r);
  assert.equal(r.code,200);assert.equal(r.data.processed,1);
  assert.ok(calls[2].endsWith('cvt_finish_email'));
 } finally {global.fetch=old;}
});
test('form atomically creates lead and queue without direct email dispatch',async()=>{
 const old=global.fetch;let created=0;
 try {
  global.fetch=async(url)=>{
   assert.ok(!String(url).includes('formsubmit'));
   if(String(url).includes('request_key=eq.')) return response(200,[]);
   assert.ok(String(url).endsWith('cvt_create_request_with_email'));created++;return response(200,{id:'CVT-QA',duplicate:false});
  };
  const r=res();await requests({method:'POST',body:{audience:'Nhà phân phối',company:'QA',name:'QA',phone:'00000000',region:'QA',purpose:'QA',consent:true,requestKey:'QA'}},r);
  assert.equal(r.code,201);assert.equal(r.data.emailDispatch,'queued');assert.equal(created,1);
 } finally {global.fetch=old;}
});
test('queue DB rejects HTTP errors and missing secret key',async()=>{
 const old=global.fetch;
 try {
  global.fetch=async()=>response(503,{});
  await assert.rejects(()=>queueRpc('cvt_claim_email'),/EMAIL_QUEUE_DB_503/);
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  await assert.rejects(()=>queueRpc('cvt_claim_email'),/UNCONFIGURED/);
 } finally {global.fetch=old;}
});
