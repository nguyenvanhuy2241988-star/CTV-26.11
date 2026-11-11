-- Additive rollout: creates no jobs for historical leads. Apply before deploying queue code.
CREATE TABLE IF NOT EXISTS public.cvt_email_outbox (
  request_id text PRIMARY KEY REFERENCES public.cvt_requests(id) ON DELETE CASCADE,
  state text NOT NULL DEFAULT 'pending' CHECK (state IN ('pending','processing','retry','gateway_accepted','activation_required','unconfirmed','failed')),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  claim_token uuid,
  lease_until timestamptz,
  last_error text,
  gateway_accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS cvt_email_outbox_due ON public.cvt_email_outbox(next_attempt_at) WHERE state IN ('pending','retry');
ALTER TABLE public.cvt_email_outbox ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.cvt_email_outbox FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cvt_email_outbox TO service_role;

-- Lead + outbox commit together; duplicate keys never enqueue another message.
CREATE OR REPLACE FUNCTION public.cvt_create_request_with_email(p_data jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE v_id text; v_status text;
BEGIN
  INSERT INTO public.cvt_requests(id,request_key,audience,company,name,phone,email,region,purpose,sku,note,consent,status,created_at)
  VALUES (p_data->>'id',p_data->>'requestKey',p_data->>'audience',p_data->>'company',p_data->>'name',p_data->>'phone',coalesce(p_data->>'email',''),p_data->>'region',p_data->>'purpose',coalesce(p_data->>'sku',''),coalesce(p_data->>'note',''),1,'new',now())
  ON CONFLICT (request_key) DO NOTHING RETURNING id INTO v_id;
  IF v_id IS NULL THEN
    SELECT id,status INTO STRICT v_id,v_status FROM public.cvt_requests WHERE request_key=p_data->>'requestKey';
    RETURN jsonb_build_object('id',v_id,'status',v_status,'duplicate',true);
  END IF;
  INSERT INTO public.cvt_email_outbox(request_id) VALUES (v_id);
  RETURN jsonb_build_object('id',v_id,'status','new','duplicate',false);
END $$;

CREATE OR REPLACE FUNCTION public.cvt_claim_email()
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE v_job public.cvt_email_outbox%ROWTYPE; v_lead public.cvt_requests%ROWTYPE;
BEGIN
  -- Crash after dispatch is ambiguous. Never blindly resend an expired lease.
  UPDATE public.cvt_email_outbox SET state='unconfirmed',last_error='worker_lease_expired',claim_token=NULL,lease_until=NULL,updated_at=now()
  WHERE state='processing' AND lease_until < now();
  SELECT * INTO v_job FROM public.cvt_email_outbox
  WHERE state IN ('pending','retry') AND next_attempt_at<=now() AND attempts<6
  ORDER BY next_attempt_at FOR UPDATE SKIP LOCKED LIMIT 1;
  IF NOT FOUND THEN RETURN NULL; END IF;
  UPDATE public.cvt_email_outbox SET state='processing',attempts=attempts+1,claim_token=gen_random_uuid(),lease_until=now()+interval '2 minutes',updated_at=now()
  WHERE request_id=v_job.request_id RETURNING * INTO v_job;
  SELECT * INTO STRICT v_lead FROM public.cvt_requests WHERE id=v_job.request_id;
  RETURN jsonb_build_object('requestId',v_job.request_id,'token',v_job.claim_token,'attempts',v_job.attempts,'lead',to_jsonb(v_lead));
END $$;

CREATE OR REPLACE FUNCTION public.cvt_finish_email(p_id text,p_token uuid,p_state text,p_error text DEFAULT NULL)
RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE v_count integer;
BEGIN
  IF p_state NOT IN ('retry','gateway_accepted','activation_required','unconfirmed','failed') THEN RAISE EXCEPTION 'invalid_email_state'; END IF;
  UPDATE public.cvt_email_outbox SET
    state=CASE WHEN p_state='retry' AND attempts>=6 THEN 'failed' ELSE p_state END,
    next_attempt_at=CASE WHEN p_state='retry' THEN now()+make_interval(secs=>least(3600,60*power(2,attempts-1)::integer)) ELSE next_attempt_at END,
    last_error=left(p_error,160),
    gateway_accepted_at=CASE WHEN p_state='gateway_accepted' THEN now() ELSE gateway_accepted_at END,
    claim_token=NULL,lease_until=NULL,updated_at=now()
  WHERE request_id=p_id AND claim_token=p_token AND state='processing' AND lease_until>now();
  GET DIAGNOSTICS v_count=ROW_COUNT;
  RETURN v_count=1;
END $$;

REVOKE ALL ON FUNCTION public.cvt_create_request_with_email(jsonb) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.cvt_claim_email() FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.cvt_finish_email(text,uuid,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cvt_create_request_with_email(jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.cvt_claim_email() TO service_role;
GRANT EXECUTE ON FUNCTION public.cvt_finish_email(text,uuid,text,text) TO service_role;

CREATE OR REPLACE FUNCTION public.cvt_list_email_status()
RETURNS TABLE(request_id text,state text,attempts integer,next_attempt_at timestamptz,last_error text)
LANGUAGE sql SECURITY INVOKER SET search_path = '' AS $$
 SELECT q.request_id,q.state,q.attempts,q.next_attempt_at,q.last_error FROM public.cvt_email_outbox q
 JOIN (SELECT id FROM public.cvt_requests ORDER BY created_at DESC LIMIT 200) r ON r.id=q.request_id;
$$;
REVOKE ALL ON FUNCTION public.cvt_list_email_status() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cvt_list_email_status() TO service_role;
