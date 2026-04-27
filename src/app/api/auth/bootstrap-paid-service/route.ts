import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { eq, pgPatch, pgSelect } from '../../../../server/supabasePostgrest';
import { getPublicAppBaseUrl } from '../../../../server/appBaseUrl';

export const runtime = 'nodejs';

type Body = {
  orderNumber: string;
  statusToken: string;
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
  } as const;
}

export function OPTIONS() {
  return new NextResponse('ok', { status: 200, headers: corsHeaders() });
}

function safeBase(req: Request): string {
  try {
    return getPublicAppBaseUrl();
  } catch {
    return new URL(req.url).origin;
  }
}

function hasServiceItem(items: unknown): boolean {
  if (!Array.isArray(items)) return false;
  return items.some((it) => it && typeof it === 'object' && (it as any).category === 'service');
}

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' },
        { status: 500, headers: corsHeaders() },
      );
    }

    let body: Body;
    try {
      body = (await req.json()) as Body;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400, headers: corsHeaders() });
    }

    const orderNumber = String(body?.orderNumber || '').trim();
    const statusToken = String(body?.statusToken || '').trim();
    if (!orderNumber || !statusToken) {
      return NextResponse.json({ error: 'Missing orderNumber or statusToken' }, { status: 400, headers: corsHeaders() });
    }

    const { rows, error } = await pgSelect(
      supabaseUrl,
      serviceRoleKey,
      'orders',
      `${eq('order_number', orderNumber)}&${eq('status_token', statusToken)}`,
      'id,customer_email,customer_name,payment_status,items,user_id',
    );
    if (error || !rows[0]) {
      return NextResponse.json({ error: error || 'Order not found' }, { status: 404, headers: corsHeaders() });
    }

    const row = rows[0];
    if (String(row.payment_status) !== 'paid') {
      return NextResponse.json({ error: 'Order is not paid' }, { status: 409, headers: corsHeaders() });
    }

    if (!hasServiceItem(row.items)) {
      return NextResponse.json({ error: 'Order is not a service purchase' }, { status: 409, headers: corsHeaders() });
    }

    const email = String(row.customer_email || '').trim().toLowerCase();
    const name = String(row.customer_name || '').trim();
    if (!email) {
      return NextResponse.json({ error: 'Order missing customer email' }, { status: 400, headers: corsHeaders() });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // 1) Find/create user
    let userId = row.user_id ? String(row.user_id) : '';
    if (!userId) {
      const { data: list, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (listErr) {
        return NextResponse.json({ error: listErr.message }, { status: 500, headers: corsHeaders() });
      }
      const users = ((list as any)?.users ?? []) as Array<{ id: string; email?: string | null }>;
      const existing = users.find((u) => (u.email || '').toLowerCase() === email);
      if (existing?.id) {
        userId = existing.id;
      } else {
        const { data: created, error: createErr } = await admin.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: { full_name: name || undefined },
        });
        if (createErr) {
          return NextResponse.json({ error: createErr.message }, { status: 500, headers: corsHeaders() });
        }
        userId = created.user.id;
      }
    }

    // 2) Attach order to user for dashboard visibility (best-effort)
    if (userId && !row.user_id) {
      await pgPatch(supabaseUrl, serviceRoleKey, 'orders', eq('id', String(row.id)), { user_id: userId });
    }

    // 3) Generate a recovery link to set password in-app
    const base = safeBase(req);
    const redirectTo = `${base}/auth/callback?next=${encodeURIComponent('/set-password')}`;
    const { data: link, error: linkErr } = await admin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo,
      },
    });
    if (linkErr || !link?.properties?.action_link) {
      return NextResponse.json({ error: linkErr?.message || 'Could not generate password link' }, { status: 500, headers: corsHeaders() });
    }

    return NextResponse.json(
      {
        actionLink: link.properties.action_link,
        email,
      },
      { status: 200, headers: corsHeaders() },
    );
  } catch (e) {
    console.error('[auth/bootstrap-paid-service] fatal', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unexpected error' },
      { status: 500, headers: corsHeaders() },
    );
  }
}

