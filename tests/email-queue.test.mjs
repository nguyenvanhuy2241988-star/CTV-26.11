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
test('server worker does not dispatch formsubmit to prevent dual sending',async()=>{
 process.env.CRON_SECRET='test-secret';
 const r=res();await worker({method:'GET',headers:{authorization:'Bearer test-secret'}},r);
 assert.equal(r.code,200);assert.equal(r.data.processed,0);assert.equal(r.data.serverDispatch,'disabled');
});
test('form atomically creates lead and queue without direct email dispatch',async()=>{
 process.env.SUPABASE_URL='https://test.invalid';process.env.SUPABASE_SERVICE_ROLE_KEY='test';
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
test('confirm_email_dispatch updates outbox when requestKey matches',async()=>{
 const old=global.fetch;let patched=0;
 process.env.SUPABASE_URL='https://test.invalid';process.env.SUPABASE_SERVICE_ROLE_KEY='test';
 try {
  global.fetch=async(url,opt)=>{
   if(String(url).includes('cvt_requests?request_key=eq.')) return response(200,[{id:'CVT-QA',status:'new'}]);
   if(String(url).includes('cvt_email_outbox?request_id=eq.CVT-QA')) {
    assert.ok(String(url).includes('state=eq.pending'));
    assert.equal(opt.method,'PATCH');
    const b=JSON.parse(opt.body);
    assert.equal(b.state,'gateway_accepted');
    patched++;
    return response(200,[{request_id:'CVT-QA',state:'gateway_accepted'}]);
   }
   throw new Error('unexpected: ' + url);
  };
  const r=res();
  await requests({method:'POST',body:{action:'confirm_email_dispatch',id:'CVT-QA',requestKey:'QA'}},r);
  assert.equal(r.code,200);
  assert.equal(r.data.ok,true);
  assert.equal(patched,1);
 } finally {global.fetch=old;}
});
