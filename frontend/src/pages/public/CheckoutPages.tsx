import React, { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router';
import {
  ArrowLeft, Building2, CheckCircle2, CreditCard, Landmark, Loader2, Lock, ShoppingCart, Smartphone, Ticket, Trash2, TriangleAlert, Wallet, XCircle,
} from 'lucide-react';
import { SeminarCover } from '../../components/SeminarCover';
import { TicketQR } from '../../components/TicketQR';
import { Button } from '../../components/ui/Button';
import { Checkbox, Input, QuantityStepper, RadioCard } from '../../components/ui/Field';
import { Card, EmptyState, Notice, container } from '../../components/ui/Primitives';
import { Stepper } from '../../components/ui/Stepper';
import { ApiError } from '../../api/client';
import {
  bankInstructionsRequest,
  checkoutRequest,
  uploadSlipRequest,
  type BankInstructions,
} from '../../api/commerce';
import { DEMO_ACCOUNTS, useAuth } from '../../contexts/AuthContext';
import { useCart, type CartLine } from '../../contexts/CartContext';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { useCatalog } from '../../hooks/useCatalog';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import type { PaymentMethod } from '../../types';
import { formatDateTime } from '../../utils/date';
import { PAYMENT_LABELS, formatLKR } from '../../utils/format';
import { email, phone, required, runValidators } from '../../utils/validation';

const Summary: React.FC<{ lines: CartLine[]; subtotal: number; fee: number; total: number; feePercent: number; children?: React.ReactNode }> = ({ lines, subtotal, fee, total, feePercent, children }) => (
  <Card className="lg:sticky lg:top-24">
    <div className="border-b border-line px-5 py-4">
      <h2 className="text-base font-semibold text-fg">Booking summary</h2>
    </div>
    <ul className="divide-y divide-line">
      {lines.map((l) => (
        <li key={l.ticketTypeId} className="flex justify-between gap-3 px-5 py-3 text-sm">
          <span className="min-w-0">
            <span className="block truncate font-semibold text-fg">{l.seminar.title}</span>
            <span className="text-muted">{l.quantity} × {l.ticketType.name}</span>
          </span>
          <span className="shrink-0 tabular-nums text-fg">{formatLKR(l.lineTotal)}</span>
        </li>
      ))}
    </ul>
    <dl className="space-y-1.5 border-t border-line px-5 py-4 text-sm">
      <div className="flex justify-between text-muted"><dt>Subtotal</dt><dd className="tabular-nums">{formatLKR(subtotal)}</dd></div>
      <div className="flex justify-between text-muted"><dt>Booking fee ({feePercent}%)</dt><dd className="tabular-nums">{formatLKR(fee)}</dd></div>
      <div className="flex justify-between pt-1 text-base font-bold text-fg"><dt>Total</dt><dd className="tabular-nums">{formatLKR(total)}</dd></div>
    </dl>
    {children && <div className="border-t border-line px-5 py-4">{children}</div>}
  </Card>
);

export const CartPage: React.FC = () => {
  useDocumentTitle('Cart');
  const cart = useCart();
  const { settings } = useCatalog();
  const navigate = useNavigate();

  if (cart.lines.length === 0) {
    return (
      <div className={`${container} py-16`}>
        <EmptyState
          icon={<ShoppingCart className="size-5" aria-hidden="true" />}
          as="h1"
          title="Your cart is empty"
          description="Find a seminar and choose your tickets to get started."
          action={<Button to="/seminars">Explore seminars</Button>}
        />
      </div>
    );
  }

  const room = cart.maxPerOrder - cart.count;
  return (
    <div className={`${container} py-10 sm:py-14`}>
      <h1 className="text-3xl font-bold tracking-tight text-fg">Your cart</h1>
      <p className="mt-1 text-muted">{cart.count} {cart.count === 1 ? 'ticket' : 'tickets'} · up to {cart.maxPerOrder} per order</p>
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <ul className="space-y-4">
          {cart.lines.map((l) => (
            <li key={l.ticketTypeId}>
              <Card className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <SeminarCover seminar={l.seminar} compact className="aspect-video w-full shrink-0 rounded-md sm:w-32" />
                <div className="min-w-0 flex-1">
                  <Link to={`/seminars/${l.seminar.slug}`} className="font-semibold text-fg hover:text-brand">{l.seminar.title}</Link>
                  <p className="text-sm text-muted">{l.ticketType.name} · {formatLKR(l.ticketType.price)} each</p>
                  <p className="text-sm text-muted">{formatDateTime(l.seminar.startsAt)} · {l.seminar.venue}</p>
                  {l.quantity > l.available && (
                    <p className="mt-1 text-xs font-semibold text-danger">Only {l.available} left — reduce the quantity to continue.</p>
                  )}
                </div>
                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <QuantityStepper label={`${l.ticketType.name} quantity`} min={1} value={l.quantity} max={Math.min(l.available, l.quantity + room)} onChange={(n) => cart.setQuantity(l.ticketTypeId, n)} />
                  <div className="flex items-center gap-3">
                    <span className="font-bold tabular-nums text-fg">{formatLKR(l.lineTotal)}</span>
                    <Button variant="ghost" size="sm" onClick={() => cart.remove(l.ticketTypeId)} aria-label={`Remove ${l.ticketType.name} for ${l.seminar.title}`}>
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </Card>
            </li>
          ))}
          <li>
            <Button to="/seminars" variant="ghost" size="sm">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Continue browsing
            </Button>
          </li>
        </ul>
        <Summary lines={cart.lines} subtotal={cart.subtotal} fee={cart.fee} total={cart.total} feePercent={settings.bookingFeePercent}>
          <Button size="lg" className="w-full" disabled={cart.lines.some((l) => l.quantity > l.available)} onClick={() => navigate('/checkout')}>
            <Lock className="size-4" aria-hidden="true" />
            Checkout
          </Button>
          <p className="mt-2 text-center text-xs text-muted">Secure checkout — pay by bank transfer.</p>
        </Summary>
      </div>
    </div>
  );
};

const STEPS = ['Your details', 'Payment', 'Confirmation'];

const METHODS: {
  value: PaymentMethod;
  icon: React.ReactNode;
  description: string;
  disabled?: boolean;
}[] = [
  { value: 'bank_transfer', icon: <Landmark className="size-5" aria-hidden="true" />, description: 'Transfer and upload the slip' },
  { value: 'card', icon: <CreditCard className="size-5" aria-hidden="true" />, description: 'Coming soon — PayHere held', disabled: true },
  { value: 'ez_cash', icon: <Smartphone className="size-5" aria-hidden="true" />, description: 'Coming soon', disabled: true },
  { value: 'koko', icon: <Wallet className="size-5" aria-hidden="true" />, description: 'Coming soon', disabled: true },
];

export const CheckoutPage: React.FC = () => {
  useDocumentTitle('Checkout');
  const cart = useCart();
  const { settings } = useCatalog();
  const { user, login, usingMocks } = useAuth();
  const { placeOrder, data } = useData();
  const toast = useToast();
  const navigate = useNavigate();
  const student = user?.role === 'student' ? data.students.find((s) => s.id === user.id) : undefined;
  const apiMode = !usingMocks;

  const [step, setStep] = useState(0);
  const [buyer, setBuyer] = useState({ name: student?.name ?? user?.name ?? '', email: student?.email ?? user?.email ?? '', phone: student?.phone ?? '' });
  const [attendees, setAttendees] = useState<string[]>([]);
  const [agree, setAgree] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>('bank_transfer');
  const [outcome, setOutcome] = useState<'success' | 'failure'>('success');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => headingRef.current?.focus(), [step]);
  // Prefill once a student signs in from the prompt below
  useEffect(() => {
    if (student) setBuyer((b) => (b.name || b.email ? b : { name: student.name, email: student.email, phone: student.phone }));
  }, [student]);

  if (cart.lines.length === 0 && !processing) return <Navigate to="/cart" replace />;

  if (!user || user.role !== 'student') {
    return (
      <div className={`${container} max-w-lg py-16`}>
        <Card className="p-8 text-center">
          <Lock className="mx-auto size-8 text-brand" aria-hidden="true" />
          <h1 className="mt-4 text-xl font-bold text-fg">Sign in to check out</h1>
          <p className="mt-2 text-sm text-muted">Tickets are saved to a student account so you can show the QR code at the door.</p>
          <div className="mt-6 flex flex-col gap-2">
            {usingMocks && (
              <Button onClick={() => login(DEMO_ACCOUNTS.student)}>Continue as mock student</Button>
            )}
            <Button to="/login?next=/checkout" variant={usingMocks ? 'secondary' : undefined}>Log in</Button>
            <Button to="/register?next=/checkout" variant="ghost">Create a student account</Button>
          </div>
        </Card>
      </div>
    );
  }

  const ticketCount = cart.count;
  const ticketSlots = cart.lines.flatMap((l) => Array.from({ length: l.quantity }, (_, i) => ({ key: `${l.ticketTypeId}-${i}`, label: `${l.ticketType.name} · ${l.seminar.title}` })));

  const nextFromDetails = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = runValidators(buyer, { name: [required('Full name')], email: [required('Email'), email], phone: [required('Mobile number'), phone] });
    if (!agree) errs.agree = 'Please accept the terms to continue';
    setErrors(errs);
    if (Object.keys(errs).length === 0) setStep(1);
  };

  const pay = (e: React.FormEvent) => {
    e.preventDefault();
    if (method !== 'bank_transfer') {
      setErrors({ method: 'Only bank transfer is available right now' });
      return;
    }
    setErrors({});
    setProcessing(true);
    setStep(2);

    if (apiMode) {
      if (!user.accessToken) {
        toast('Sign in again to checkout', { tone: 'error' });
        setProcessing(false);
        setStep(1);
        return;
      }
      void (async () => {
        try {
          let attendeeOffset = 0;
          const order = await checkoutRequest(user.accessToken!, {
            buyer,
            lines: cart.items.map((item) => {
              const names = attendees.slice(attendeeOffset, attendeeOffset + item.quantity);
              attendeeOffset += item.quantity;
              return {
                ticketTypeId: item.ticketTypeId,
                quantity: item.quantity,
                attendeeNames: names,
              };
            }),
            paymentMethod: 'BANK_TRANSFER',
          });
          cart.clear();
          navigate(`/checkout/bank/${order.id}`, { replace: true });
        } catch (err) {
          const message = err instanceof ApiError ? err.message : 'Checkout failed';
          toast(message, { tone: 'error' });
          setProcessing(false);
          setStep(1);
        }
      })();
      return;
    }

    // Demo path: bank completes immediately for UI walkthrough
    setTimeout(() => {
      const order = placeOrder({
        studentId: user.id,
        items: cart.items,
        buyer,
        attendees,
        paymentMethod: 'bank_transfer',
        outcome,
      });
      if (order.status === 'paid') {
        cart.clear();
        navigate(`/checkout/confirmation/${order.id}`, { replace: true });
      } else {
        navigate(`/checkout/failed/${order.id}`, { replace: true });
      }
    }, 900);
  };

  return (
    <div className={`${container} py-10 sm:py-14`}>
      <div className="mx-auto max-w-5xl">
        <Stepper steps={STEPS} current={step} />
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0">
            {step === 0 && (
              <form onSubmit={nextFromDetails} noValidate className="space-y-6">
                <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold text-fg focus:outline-none">Your details</h1>
                <Card className="grid gap-4 p-5 sm:grid-cols-2">
                  <Input label="Full name" required autoComplete="name" value={buyer.name} onValueChange={(v) => setBuyer({ ...buyer, name: v })} error={errors.name} className="sm:col-span-2" />
                  <Input label="Email" required type="email" autoComplete="email" value={buyer.email} onValueChange={(v) => setBuyer({ ...buyer, email: v })} error={errors.email} hint="Your tickets are linked to this email" />
                  <Input label="Mobile number" required type="tel" autoComplete="tel" value={buyer.phone} onValueChange={(v) => setBuyer({ ...buyer, phone: v })} error={errors.phone} />
                </Card>
                {ticketCount > 1 && (
                  <Card className="p-5">
                    <h2 className="text-base font-semibold text-fg">Attendee names</h2>
                    <p className="mb-4 text-sm text-muted">Optional. Each ticket shows its holder's name; blank ones use your name.</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {ticketSlots.map((slot, i) => (
                        <Input key={slot.key} label={`Ticket ${i + 1}`} hint={slot.label} placeholder={buyer.name || 'Attendee name'} value={attendees[i] ?? ''} onValueChange={(v) => setAttendees((a) => Object.assign([...a], { [i]: v }))} />
                      ))}
                    </div>
                  </Card>
                )}
                <Checkbox
                  checked={agree}
                  onChange={setAgree}
                  error={errors.agree}
                  label={<>I agree to the <Link to="/terms" className="font-semibold text-brand hover:underline">Terms</Link> and <Link to="/refunds" className="font-semibold text-brand hover:underline">Refund Policy</Link></>}
                />
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                  <Button to="/cart" variant="ghost"><ArrowLeft className="size-4" aria-hidden="true" />Back to cart</Button>
                  <Button type="submit" size="lg">Continue to payment</Button>
                </div>
              </form>
            )}

            {step === 1 && (
              <form onSubmit={pay} noValidate className="space-y-6">
                <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold text-fg focus:outline-none">Payment method</h1>
                <Notice tone="warning" icon={<TriangleAlert className="size-4 text-warning" aria-hidden="true" />}>
                  <strong>Bank transfer only.</strong> Card and wallets are disabled until PayHere is enabled.
                </Notice>
                <fieldset>
                  <legend className="sr-only">Choose a payment method</legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {METHODS.map((m) => (
                      <RadioCard
                        key={m.value}
                        name="method"
                        value={m.value}
                        checked={method === m.value}
                        disabled={m.disabled}
                        onChange={(v) => { setMethod(v as PaymentMethod); setErrors({}); }}
                        title={PAYMENT_LABELS[m.value]}
                        description={m.description}
                        icon={m.icon}
                      />
                    ))}
                  </div>
                  {errors.method && <p className="mt-2 text-sm font-semibold text-danger">{errors.method}</p>}
                </fieldset>

                <Card className="p-5">
                  {method === 'bank_transfer' && (
                    <div className="space-y-3 text-sm text-muted">
                      <p className="flex items-center gap-2 font-semibold text-fg"><Building2 className="size-4 text-brand" aria-hidden="true" />Bank transfer / deposit</p>
                      <p>You will transfer {formatLKR(cart.total)} to the organiser’s account and upload the slip. Tickets become valid after the organiser approves payment.</p>
                      {!apiMode && <p>Demo mode completes the booking immediately without a real transfer.</p>}
                    </div>
                  )}
                </Card>

                {!apiMode && (
                  <fieldset className="rounded-lg border border-dashed border-line p-4">
                    <legend className="px-1 text-sm font-semibold text-fg">Demo outcome</legend>
                    <p className="mb-3 text-xs text-muted">Choose how the simulated payment ends so you can try both screens.</p>
                    <div className="flex flex-wrap gap-4 text-sm text-fg">
                      {(['success', 'failure'] as const).map((o) => (
                        <label key={o} className="flex items-center gap-2">
                          <input type="radio" name="outcome" checked={outcome === o} onChange={() => setOutcome(o)} className="accent-[var(--brand-solid)]" />
                          {o === 'success' ? 'Payment succeeds' : 'Payment is declined'}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                )}

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                  <Button variant="ghost" onClick={() => setStep(0)}><ArrowLeft className="size-4" aria-hidden="true" />Back</Button>
                  <Button type="submit" size="lg" disabled={processing}>
                    <Lock className="size-4" aria-hidden="true" />
                    {apiMode ? `Place order · ${formatLKR(cart.total)}` : `Pay ${formatLKR(cart.total)} (demo)`}
                  </Button>
                </div>
              </form>
            )}

            {step === 2 && (
              <div role="status" className="flex flex-col items-center rounded-lg border border-line bg-surface px-6 py-16 text-center">
                <Loader2 className="size-10 animate-spin text-brand" aria-hidden="true" />
                <h1 ref={headingRef} tabIndex={-1} className="mt-5 text-xl font-bold text-fg focus:outline-none">Processing demo payment…</h1>
                <p className="mt-1 text-sm text-muted">Simulating a payment gateway. Nothing is being charged.</p>
              </div>
            )}
          </div>
          <Summary lines={cart.lines} subtotal={cart.subtotal} fee={cart.fee} total={cart.total} feePercent={settings.bookingFeePercent} />
        </div>
      </div>
    </div>
  );
};

export const OrderConfirmationPage: React.FC = () => {
  useDocumentTitle('Booking confirmed');
  const { orderId } = useParams();
  const { orders, tickets, seminarById, ticketTypeName } = useCatalog();
  const order = orders.find((o) => o.id === orderId);
  if (!order || order.status !== 'paid') return <Navigate to="/cart" replace />;
  const issued = tickets.filter((t) => t.orderId === order.id);

  return (
    <div className={`${container} max-w-3xl py-10 sm:py-14`}>
      <div className="text-center">
        <CheckCircle2 className="mx-auto size-14 text-success" aria-hidden="true" />
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-fg">Booking confirmed</h1>
        <p className="mt-2 text-muted">
          Order <span className="font-semibold text-fg">{order.id}</span> · {formatLKR(order.total)} · {PAYMENT_LABELS[order.paymentMethod]}
        </p>
        <Notice tone="warning" className="mx-auto mt-5 max-w-xl text-left">
          This is a <strong>demo booking</strong>. No money was taken and these tickets will not admit anyone to a real event.
        </Notice>
      </div>
      <h2 className="mb-4 mt-10 text-lg font-bold text-fg">Your tickets ({issued.length})</h2>
      <ul className="space-y-4">
        {issued.map((t) => {
          const sem = seminarById.get(t.seminarId);
          return (
            <li key={t.id}>
              <Card className="flex flex-col items-center gap-5 p-5 sm:flex-row">
                <TicketQR code={t.code} size={96} />
                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <p className="font-semibold text-fg">{sem?.title}</p>
                  <p className="text-sm text-muted">{ticketTypeName(t.seminarId, t.ticketTypeId)} · {t.holderName}</p>
                  {sem && <p className="text-sm text-muted">{formatDateTime(sem.startsAt)} · {sem.venue}</p>}
                  <p className="mt-1 font-mono text-xs text-muted">{t.code}</p>
                </div>
                <Button to={`/student/tickets/${t.id}`} variant="secondary" size="sm">
                  <Ticket className="size-4" aria-hidden="true" />
                  View ticket
                </Button>
              </Card>
            </li>
          );
        })}
      </ul>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button to="/student/tickets">Go to My Tickets</Button>
        <Button to="/seminars" variant="secondary">Book another seminar</Button>
      </div>
    </div>
  );
};

export const PaymentFailedPage: React.FC = () => {
  useDocumentTitle('Payment failed');
  const { orderId } = useParams();
  return (
    <div className={`${container} max-w-lg py-16`}>
      <Card className="p-8 text-center">
        <XCircle className="mx-auto size-14 text-danger" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-bold text-fg">Payment declined</h1>
        <p className="mt-2 text-sm text-muted">
          Payment for order <span className="font-semibold text-fg">{orderId}</span> was declined, so no tickets were issued. Your cart has been kept.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button to="/checkout">Try again</Button>
          <Button to="/cart" variant="secondary">Back to cart</Button>
        </div>
      </Card>
    </div>
  );
};

/** API mode: show seller bank details + upload slip after checkout. */
export const BankSlipPage: React.FC = () => {
  useDocumentTitle('Pay by bank transfer');
  const { orderId } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const [info, setInfo] = useState<BankInstructions | null>(null);
  const [slipReference, setSlipReference] = useState('');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!orderId || !user?.accessToken) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    void bankInstructionsRequest(user.accessToken, orderId)
      .then((data) => {
        if (!cancelled) {
          setInfo(data);
          if (data.status === 'UNDER_REVIEW' || data.status === 'PAID') setSubmitted(true);
        }
      })
      .catch(() => {
        if (!cancelled) setInfo(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [orderId, user?.accessToken]);

  if (!user || user.role !== 'student') return <Navigate to="/login?next=/checkout" replace />;
  if (loading) {
    return (
      <div className={`${container} py-16 text-center`}>
        <Loader2 className="mx-auto size-8 animate-spin text-brand" aria-hidden="true" />
      </div>
    );
  }
  if (!info || !orderId) return <Navigate to="/cart" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user.accessToken || slipReference.trim().length < 3) {
      toast('Enter a transfer reference', { tone: 'error' });
      return;
    }
    setSaving(true);
    try {
      await uploadSlipRequest(user.accessToken, {
        orderId,
        slipReference: slipReference.trim(),
        note: note.trim() || undefined,
      });
      setSubmitted(true);
      toast('Slip uploaded — awaiting organiser approval', { tone: 'success' });
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Upload failed', { tone: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`${container} max-w-xl py-10 sm:py-14`}>
      <h1 className="text-3xl font-bold tracking-tight text-fg">Pay by bank transfer</h1>
      <p className="mt-2 text-muted">
        Order <span className="font-semibold text-fg">{info.orderId}</span> · {formatLKR(info.totalLkr)} to {info.organisation.name}
      </p>

      <Card className="mt-8 space-y-3 p-5 text-sm">
        <p className="flex items-center gap-2 font-semibold text-fg">
          <Building2 className="size-4 text-brand" aria-hidden="true" />
          Bank details
        </p>
        {info.bankAccount ? (
          <dl className="space-y-1 text-muted">
            <div className="flex justify-between gap-4"><dt>Bank</dt><dd className="text-fg">{info.bankAccount.bankName}</dd></div>
            <div className="flex justify-between gap-4"><dt>Account name</dt><dd className="text-fg">{info.bankAccount.accountName}</dd></div>
            <div className="flex justify-between gap-4"><dt>Account number</dt><dd className="font-mono text-fg">{info.bankAccount.accountNumber}</dd></div>
            {info.bankAccount.branch && (
              <div className="flex justify-between gap-4"><dt>Branch</dt><dd className="text-fg">{info.bankAccount.branch}</dd></div>
            )}
          </dl>
        ) : (
          <Notice tone="warning">{info.message}</Notice>
        )}
      </Card>

      {submitted ? (
        <Notice tone="success" className="mt-6">
          Your slip is under review. Tickets appear in My Tickets once the organiser approves payment.
        </Notice>
      ) : (
        <form onSubmit={(e) => void submit(e)} className="mt-6 space-y-4">
          <Input
            label="Transfer reference"
            required
            value={slipReference}
            onValueChange={setSlipReference}
            placeholder="Bank txn / deposit slip number"
            hint="Paste the reference from your bank app or write the slip number"
          />
          <Input label="Note (optional)" value={note} onValueChange={setNote} placeholder="Paid from Sampath online" />
          <Button type="submit" size="lg" disabled={saving} className="w-full">
            {saving ? 'Uploading…' : 'Upload slip'}
          </Button>
        </form>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Button to="/student/tickets" variant="secondary">My tickets</Button>
        <Button to="/seminars" variant="ghost">Browse seminars</Button>
      </div>
    </div>
  );
};
