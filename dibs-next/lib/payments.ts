import { fail, ok, type Result } from '@/lib/result';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export interface PaymentProvider {
  charge(options: {
    amountCents: number;
    currency?: string;
    sourceToken: string;
    orderId?: string;
    metadata?: Record<string, string>;
  }): Promise<Result<{ paymentId: string; status: string }>>;
}

export class MockPaymentProvider implements PaymentProvider {
  async charge({
    amountCents,
    currency = 'usd',
    sourceToken,
    orderId,
    metadata,
  }: {
    amountCents: number;
    currency?: string;
    sourceToken: string;
    orderId?: string;
    metadata?: Record<string, string>;
  }): Promise<Result<{ paymentId: string; status: string }>> {
    if (amountCents <= 0) {
      return fail('VALIDATION', 'Payment amount must be greater than zero.');
    }

    if (!sourceToken) {
      return fail('PAYMENT_FAILED', 'Invalid payment source token.');
    }

    const paymentId = `mock_pay_${Math.random().toString(36).substring(2, 11)}`;
    const status = 'succeeded';

    try {
      const supabase = await createSupabaseServerClient();

      // Record payment in Supabase. If you have a payments table or want to log
      // it against orders/payout_quote, we insert it here.
      const { error } = await supabase.from('payments').insert({
        id: paymentId,
        order_id: orderId ?? null,
        amount_cents: amountCents,
        currency,
        source_token: sourceToken,
        status,
        metadata: metadata ?? {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        // If the payments table hasn't been migrated yet in local demo mode,
        // fallback to updating or logging via orders table if orderId is provided
        if (orderId) {
          await supabase
            .from('orders')
            .update({
              payout_quote: {
                paymentId,
                amountCents,
                status,
                recordedAt: new Date().toISOString(),
              },
              updated_at: new Date().toISOString(),
            })
            .eq('id', orderId);
        } else {
          console.warn('[MockPaymentProvider] Payments table insert failed:', error.message);
        }
      }
    } catch (e) {
      console.error('[MockPaymentProvider] Supabase client error during payment record:', e);
    }

    return ok({ paymentId, status });
  }
}

export const payments: PaymentProvider = new MockPaymentProvider();
