import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import {
  ArrowLeft, ChevronLeft, CheckCircle2, Clock, XCircle, FileText,
  Heart, History, ShieldCheck, LockKeyhole, Mail, Phone, Edit2,
  RefreshCw, Pause, Play, Ban, AlertCircle, LayoutDashboard, Save, Printer,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth, type User } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import type { Donation } from "@shared/schema";
import "./Profile.css";

type DonorDonation = Omit<Donation, "createdAt" | "status"> & {
  createdAt?: string | Date;
  status: string;
  campaignTitle?: string;
};
type Recurring = {
  _id?: string;
  id?: string;
  amount: number;
  type?: string;
  frequency: string;
  status: string;
  nextChargeDate?: string;
};
type DonationEnvelope = { success?: boolean; donations: DonorDonation[]; total?: number };
type RecurringEnvelope = { success?: boolean; data: Recurring[] };
type DonationFilter = "all" | "confirmed" | "pending";
type IssuedInvoice = {
  id: string;
  invoiceNumber?: string;
  userId?: string;
  donorName?: string;
  amount: number;
  type?: string;
  createdAt?: string;
  status?: string;
};

const amount = (value: number) => Number(value || 0).toLocaleString("ar-SA", { maximumFractionDigits: 2 });
function dateLabel(value?: string | Date) {
  if (!value || Number.isNaN(new Date(value).getTime())) return "التاريخ غير متاح";
  return new Date(value).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" });
}
function donationLabel(type?: string) {
  const labels: Record<string, string> = {
    general: "تبرع عام", zakat: "زكاة", waqf: "وقف", water: "سقيا الماء",
    "ramadan-basket": "سلة رمضانية", iftar: "إفطار صائم",
  };
  return (type && labels[type]) || type || "تبرع";
}
function statusInfo(status: string) {
  switch (status) {
    case "confirmed": return { label: "مؤكد", className: "", Icon: CheckCircle2 };
    case "pending": return { label: "قيد المراجعة", className: "ap-pending", Icon: Clock };
    case "failed": return { label: "لم يكتمل", className: "ap-failed", Icon: XCircle };
    case "rejected": return { label: "مرفوض", className: "ap-failed", Icon: XCircle };
    case "refunded": return { label: "مسترد", className: "ap-neutral", Icon: History };
    default: return { label: "الحالة غير متاحة", className: "ap-neutral", Icon: AlertCircle };
  }
}

// Preserve the API's envelope in the shared cache; select only in this observer.
// Fetch every page before presenting an account-wide confirmed total.
async function fetchPersonalDonations(userId: string): Promise<DonationEnvelope> {
  if (!/^[a-f\d]{24}$/i.test(userId)) throw new Error("Account identifier unavailable");
  const donations: DonorDonation[] = [];
  let page = 1;
  let total: number | undefined;
  do {
    const params = new URLSearchParams({ userId, page: String(page), limit: "100" });
    const response = await apiRequest("GET", `/api/donations?${params}`);
    const json = await response.json();
    const items = Array.isArray(json) ? json : json.donations;
    if (json.success === false || !Array.isArray(items)) throw new Error("Invalid donation response");
    donations.push(...items);
    total = typeof json.total === "number" ? json.total : undefined;
    if (items.length === 0 && total !== undefined && donations.length < total) {
      throw new Error("Incomplete donation history");
    }
    if (total === undefined || donations.length >= total) break;
    page++;
  } while (true);
  return { donations, total: donations.length };
}

function LoadingRows() {
  return <div role="status" aria-label="جارٍ تحميل البيانات" aria-busy="true">
    <div className="ap-skeleton" /><div className="ap-skeleton" /><div className="ap-skeleton" />
  </div>;
}
function QueryError({ retry, pending = false }: { retry: () => void; pending?: boolean }) {
  return <div className="ap-error" role="alert">
    <AlertCircle aria-hidden="true" /><h3>تعذّر تحميل البيانات</h3>
    <p>لم نتمكن من عرض السجل الآن. أعد المحاولة؛ بياناتك لم تتغير.</p>
    <button className="ap-button" onClick={retry} disabled={pending}><RefreshCw />{pending ? "جارٍ إعادة المحاولة…" : "إعادة المحاولة"}</button>
  </div>;
}

function invoiceStatus(status?: string) {
  return ({
    paid: "مدفوع", issued: "صادر", confirmed: "مؤكد", pending: "قيد المراجعة",
    cancelled: "ملغي", refunded: "مسترد", unpaid: "غير مدفوع",
  } as Record<string, string>)[status || ""] || status || "غير متاحة";
}

function InvoiceDocument({ invoice }: { invoice: IssuedInvoice }) {
  return <article className="ap-invoice-document" dir="rtl">
    <header><p>جمعية مقارئ البيان لتعليم القرآن الكريم</p><h2>إيصال تبرع</h2></header>
    <dl>
      <div><dt>رقم الإيصال</dt><dd><bdi>{invoice.invoiceNumber || "غير متاح"}</bdi></dd></div>
      <div><dt>اسم المتبرع</dt><dd>{invoice.donorName || "غير متاح"}</dd></div>
      <div><dt>المبلغ</dt><dd>{amount(invoice.amount)} ريال سعودي</dd></div>
      <div><dt>نوع التبرع</dt><dd>{donationLabel(invoice.type)}</dd></div>
      <div><dt>تاريخ الإصدار</dt><dd>{dateLabel(invoice.createdAt)}</dd></div>
      <div><dt>حالة الإيصال</dt><dd>{invoiceStatus(invoice.status)}</dd></div>
    </dl>
    <footer>نسخة من بيانات الإيصال الصادر والمسجّل في حسابك.</footer>
  </article>;
}

function InvoicePanel({ accountId }: { accountId: string }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const invoicesQuery = useQuery<IssuedInvoice[]>({
    queryKey: ["/api/invoices", "profile", accountId],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/invoices");
      const json = await res.json();
      if (!Array.isArray(json)) throw new Error("Invalid invoice response");
      return json;
    },
  });
  const invoiceQuery = useQuery<IssuedInvoice>({
    queryKey: ["/api/invoices", selectedId, accountId],
    enabled: !!selectedId,
    queryFn: async () => {
      if (!selectedId) throw new Error("No invoice selected");
      const res = await apiRequest("GET", `/api/invoices/${encodeURIComponent(selectedId)}`);
      const json = await res.json();
      if (!json || json.success === false || String(json.id || json._id) !== selectedId) throw new Error("Invalid invoice response");
      return json;
    },
    staleTime: 0,
  });
  const invoice = !invoiceQuery.isError ? invoiceQuery.data : undefined;
  return <>
    <section id="profile-receipts" className="ap-panel ap-invoices" aria-labelledby="profile-receipts-title">
      <div className="ap-panel-heading"><div><h2 id="profile-receipts-title">الإيصالات الصادرة</h2><p>اعرض إيصالك واطبعه أو احفظه بصيغة PDF من نافذة طباعة المتصفح، دون الحاجة إلى البريد.</p></div><FileText aria-hidden="true" /></div>
      {invoicesQuery.isPending ? <LoadingRows /> : invoicesQuery.isError ? <QueryError retry={() => { void invoicesQuery.refetch(); }} pending={invoicesQuery.isFetching} />
        : !invoicesQuery.data.length ? <div className="ap-empty"><FileText /><h3>لا توجد إيصالات صادرة بعد</h3><p>ستظهر هنا الإيصالات التي تصدرها الجمعية لحسابك. تأكيد التبرع وحده لا يعني صدور إيصال.</p></div>
          : invoicesQuery.data.map((item, index) => <article className="ap-invoice-row" key={item.id || index} data-testid={`invoice-row-${index}`}>
            <div><h3>{item.invoiceNumber ? <>إيصال رقم <bdi>{item.invoiceNumber}</bdi></> : "إيصال صادر دون رقم ظاهر"}</h3><p>{amount(item.amount)} ر.س · {dateLabel(item.createdAt)}</p><p>الحالة: {invoiceStatus(item.status)}</p></div>
            <button className="ap-button" disabled={!item.id} onClick={() => setSelectedId(item.id)} data-testid={`button-view-invoice-${index}`}><FileText />عرض الإيصال</button>
          </article>)}
    </section>
    <Dialog open={!!selectedId} onOpenChange={open => { if (!open) setSelectedId(null); }}>
      <DialogContent className="ap-dialog ap-invoice-dialog" dir="rtl">
        <DialogHeader className="text-right"><DialogTitle>عرض الإيصال</DialogTitle><DialogDescription>بيانات الإيصال الصادر من الجمعية. اختر «حفظ بصيغة PDF» في نافذة الطباعة لحفظ نسخة على جهازك.</DialogDescription></DialogHeader>
        {invoiceQuery.isPending || invoiceQuery.isFetching ? <LoadingRows /> : invoiceQuery.isError ? <QueryError retry={() => { void invoiceQuery.refetch(); }} pending={invoiceQuery.isFetching} />
          : invoice ? <><InvoiceDocument invoice={invoice} /><button className="ap-button ap-button-primary" onClick={() => window.print()} data-testid="button-print-invoice"><Printer />طباعة / حفظ PDF</button></> : null}
      </DialogContent>
    </Dialog>
    {selectedId && invoice && !invoiceQuery.isFetching && createPortal(<div className="ap-print-root"><InvoiceDocument invoice={invoice} /></div>, document.body)}
  </>;
}

function DonationRow({ donation, index }: {
  donation: DonorDonation; index: number;
}) {
  const status = statusInfo(donation.status);
  return <article className="ap-donation" data-testid={`donation-row-${index}`}>
    <div className="ap-donation-main">
      <div className={`ap-status-icon ${status.className}`}><status.Icon aria-hidden="true" /></div>
      <div className="ap-donation-info">
        <div className="ap-donation-top">
          <h3>{donation.campaignTitle || donationLabel(donation.type)}</h3>
          <div className="ap-amount">{amount(donation.amount)} <small>{donation.currency && donation.currency !== "SAR" ? donation.currency : "ر.س"}</small></div>
        </div>
        <div className="ap-donation-meta">
          <time>{dateLabel(donation.createdAt)}</time>
          <span className={`ap-status ${status.className}`}>{status.label}</span>
        </div>
        {donation.status === "pending" && <p className="ap-notice">بانتظار التأكيد، ولا يُحتسب ضمن إجمالي تبرعاتك المؤكدة.</p>}
        {donation.status === "confirmed" && <div className="ap-receipt">
          <span>الإيصالات المتاحة تظهر في قسم الإيصالات الصادرة.</span>
          <a href="#profile-receipts" className="ap-button"><FileText />عرض الإيصالات الصادرة</a>
        </div>}
      </div>
    </div>
  </article>;
}

export default function Profile() {
  const { user, isLoading, togglePrivacy } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: "", email: "" });
  const [filter, setFilter] = useState<DonationFilter>("all");
  const [privacyPending, setPrivacyPending] = useState(false);
  const [privacyError, setPrivacyError] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Recurring | null>(null);
  const accountId = user?._id || user?.id || "";
  // The list endpoint treats an invalid Mongo ID as no filter. Never issue an
  // unscoped request, especially when an administrator opens their own account.
  const userId = /^[a-f\d]{24}$/i.test(accountId) ? accountId : "";
  // An observer for the existing auth query exposes its error without changing useAuth.
  const authState = useQuery<User | null>({ queryKey: ["/api/auth/me"], enabled: false });
  const donationsQuery = useQuery({
    queryKey: ["/api/donations", "profile", userId],
    enabled: !!userId,
    queryFn: () => fetchPersonalDonations(userId),
    select: (data) => data.donations,
  });
  const recurringQuery = useQuery<RecurringEnvelope, Error, Recurring[]>({
    queryKey: ["/api/recurring"],
    enabled: !!user,
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/recurring");
      const json = await res.json();
      if (json.success === false || !Array.isArray(json.data)) throw new Error("Invalid recurring response");
      return json;
    },
    select: data => data.data,
  });

  const profileMutation = useMutation({
    mutationFn: async (data: { name: string; email: string }) => {
      const res = await apiRequest("PATCH", "/api/user/profile", data);
      const json = await res.json();
      if (json?.success === false) throw new Error("Profile was not updated");
      return json;
    },
    onSuccess: (_data, values) => {
      queryClient.setQueryData<User>(["/api/auth/me"], old => old ? { ...old, ...values } : old);
      setIsEditing(false);
      toast({ title: "تم حفظ بياناتك" });
    },
  });
  const recurringMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "active" | "paused" }) => {
      const res = await apiRequest("PATCH", `/api/recurring/${encodeURIComponent(id)}`, { status });
      const json = await res.json();
      if (json.success === false || !json.data) throw new Error("Recurring update failed");
      return json.data as Recurring;
    },
    onSuccess: item => {
      queryClient.setQueryData<RecurringEnvelope>(["/api/recurring"], old => old ? {
        ...old, data: old.data.map(r => (r._id || r.id) === (item._id || item.id) ? item : r),
      } : old);
      toast({ title: "تم تحديث التبرع الدوري" });
    },
  });
  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/recurring/${encodeURIComponent(id)}`);
      const json = await res.json();
      if (json.success === false) throw new Error("Recurring cancellation failed");
    },
    onSuccess: (_data, id) => {
      queryClient.setQueryData<RecurringEnvelope>(["/api/recurring"], old => old ? {
        ...old, data: old.data.filter(r => (r._id || r.id) !== id),
      } : old);
      setCancelTarget(null);
      toast({ title: "تم إلغاء التبرع الدوري" });
    },
  });

  useEffect(() => {
    if (!isLoading && !user && !authState.isError) setLocation("/login");
  }, [isLoading, user, authState.isError, setLocation]);

  const startEditing = () => {
    setEditData({ name: user?.name || "", email: user?.email || "" });
    profileMutation.reset();
    setIsEditing(true);
  };
  const changePrivacy = async (checked: boolean) => {
    setPrivacyPending(true);
    setPrivacyError(false);
    try { await togglePrivacy(checked); }
    catch { setPrivacyError(true); }
    finally { setPrivacyPending(false); }
  };
  const donations = donationsQuery.data || [];
  const confirmed = donations.filter(d => d.status === "confirmed" && !d.isDeleted);
  const pending = donations.filter(d => d.status === "pending" && !d.isDeleted);
  const visible = donations.filter(d => !d.isDeleted && (filter === "all" || d.status === filter));
  const currencies = Array.from(new Set(confirmed.map(d => d.currency || "SAR")));
  const confirmedSAR = confirmed.filter(d => !d.currency || d.currency === "SAR").reduce((sum, d) => sum + Number(d.amount || 0), 0);
  const recurring = recurringQuery.data || [];
  const workDashboard = user?.role === "admin" || user?.role === "manager" ? "/admin"
    : user?.role === "delivery" ? "/delivery"
      : ["employee", "accountant", "programmer", "sales"].includes(user?.role || "") ? "/employee" : null;

  return <div className="ab-profile" dir="rtl">
    <Navbar />
    <main className="ap-main">
      {isLoading ? <><div className="ap-skeleton ap-loading-overview" /><LoadingRows /></>
        : !user ? authState.isError ? <QueryError retry={() => { void authState.refetch(); }} pending={authState.isFetching} /> : <div className="ap-skeleton ap-loading-overview" role="status" aria-label="جارٍ الانتقال لتسجيل الدخول" />
          : <>
            <nav className="ap-breadcrumb" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><ChevronLeft aria-hidden="true" /><span aria-current="page">حسابي</span></nav>
            <div className="ap-page-title"><div><h1>حسابي</h1><p>عطاؤك وبياناتك، في مكان واحد.</p></div><Link href="/campaigns" className="ap-button">استعرض فرص العطاء<ArrowLeft /></Link></div>
            {workDashboard && <aside className="ap-staff"><span>هذا حسابك الشخصي. لإدارة مهام العمل:</span><Link href={workDashboard} className="ap-button"><LayoutDashboard />انتقل إلى لوحة العمل<ArrowLeft /></Link></aside>}
            <div className="ap-overview">
              <section className="ap-identity" aria-label="بيانات الحساب">
                <div className="ap-identity-top"><div className="ap-avatar" aria-hidden="true">{user.name?.trim().charAt(0) || "ب"}</div><div><span className="ap-eyebrow">مرحباً بك في مقارئ البيان</span><h2>{user.name || "حساب المتبرع"}</h2></div></div>
                <div className="ap-contact"><Phone aria-hidden="true" /><bdi>{user.mobile || user.phone || "لم يُضف رقم جوال"}</bdi></div>
                <div className="ap-contact"><Mail aria-hidden="true" /><span dir={user.email ? "ltr" : undefined}>{user.email || "لم يُضف بريد إلكتروني"}</span></div>
                <div className="ap-identity-footer"><span>بيانات الحساب الشخصي</span><button className="ap-button" onClick={startEditing} data-testid="button-edit-profile"><Edit2 />تعديل البيانات</button></div>
              </section>
              <section className="ap-summary" aria-label="ملخص التبرعات">
                <div className="ap-summary-heading"><Heart aria-hidden="true" />إجمالي تبرعاتك المؤكدة</div>
                {donationsQuery.isPending && userId ? <div className="ap-skeleton ap-skeleton-summary" role="status" aria-label="جارٍ حساب الإجمالي" />
                  : donationsQuery.isError || !userId ? <><div className="ap-summary-total"><strong>—</strong></div><p>الإجمالي غير متاح حالياً. أعد تحميل السجل أدناه.</p></>
                    : <><div className="ap-summary-total"><strong data-testid="confirmed-donations-total">{amount(confirmedSAR)}</strong><span>ريال سعودي</span></div><p>المبالغ المؤكدة فقط، دون المعلّقة أو المستردة.</p>
                      {currencies.some(c => c !== "SAR") && <p>تبرعات العملات الأخرى موضّحة في السجل ولا تُجمع مع الريال.</p>}
                      <div className="ap-summary-bottom"><span><CheckCircle2 />{amount(confirmed.length)} تبرع مؤكد</span><span><Clock />{amount(pending.length)} قيد المراجعة</span></div></>}
              </section>
            </div>
            <Tabs defaultValue="donations" dir="rtl">
              <TabsList className="ap-tabs" aria-label="أقسام الحساب">
                <TabsTrigger value="donations" data-testid="tab-donations"><History />تبرعاتي وإيصالاتي</TabsTrigger>
                <TabsTrigger value="recurring" data-testid="tab-recurring"><RefreshCw />التبرعات الدورية</TabsTrigger>
                <TabsTrigger value="settings" data-testid="tab-settings"><ShieldCheck />الخصوصية</TabsTrigger>
              </TabsList>
              <TabsContent value="donations">
                <section className="ap-panel">
                  <div className="ap-panel-heading"><div><h2>سجلّ العطاء</h2><p>تابع حالة تبرعاتك. الإيصالات الصادرة متاحة للعرض والطباعة أسفل السجل.</p></div><span className="ap-small">الأحدث أولاً</span></div>
                  {donationsQuery.isPending && userId ? <LoadingRows />
                    : donationsQuery.isError || !userId ? <QueryError retry={() => { if (userId) void donationsQuery.refetch(); else void authState.refetch(); }} pending={donationsQuery.isFetching || authState.isFetching} />
                      : donations.length === 0 ? <div className="ap-empty"><Heart /><h3>هنا يبدأ سجلّ عطائك</h3><p>ليس لديك تبرعات مسجّلة حتى الآن. ستظهر تبرعاتك وحالتها هنا عند تسجيلها.</p><Link href="/campaigns" className="ap-button ap-button-primary">استعرض الحملات<ArrowLeft /></Link></div>
                        : <><div className="ap-filters" aria-label="تصفية التبرعات">{([
                          ["all", "الكل"], ["confirmed", "المؤكدة"], ["pending", "قيد المراجعة"],
                        ] as const).map(([value, label]) => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}</div>
                          {visible.length ? visible.map((donation, index) => <DonationRow key={donation._id || donation.id || index} donation={donation} index={index} />)
                            : <div className="ap-empty"><FileText /><h3>لا توجد تبرعات بهذه الحالة</h3><p>يمكنك العودة إلى السجل الكامل لرؤية بقية تبرعاتك.</p><button className="ap-button" onClick={() => setFilter("all")}>عرض الكل</button></div>}
                        </>}
                </section>
                <InvoicePanel key={accountId} accountId={accountId} />
              </TabsContent>
              <TabsContent value="recurring">
                <section className="ap-panel">
                  <div className="ap-panel-heading"><div><h2>التبرعات الدورية</h2><p>إدارة سجلات التبرعات المتكررة. وجود سجل دوري لا يعني تأكيد سداد المبلغ.</p></div></div>
                  {recurringQuery.isPending ? <LoadingRows /> : recurringQuery.isError ? <QueryError retry={() => { void recurringQuery.refetch(); }} pending={recurringQuery.isFetching} />
                    : recurring.length === 0 ? <div className="ap-empty"><RefreshCw /><h3>لا توجد تبرعات دورية</h3><p>إذا كان لديك تبرع دوري مسجّل، فسيظهر هنا لتتمكن من إدارته.</p></div>
                      : recurring.map((r, index) => {
                        const id = r._id || r.id;
                        const label = ({ active: "نشط", paused: "موقوف مؤقتاً", completed: "مكتمل", cancelled: "ملغي" } as Record<string, string>)[r.status] || "الحالة غير متاحة";
                        return <article className="ap-donation" key={id || index} data-testid={`recurring-row-${index}`}>
                          <div className="ap-donation-top"><h3>{donationLabel(r.type)}</h3><span className="ap-amount">{amount(r.amount)} <small>ر.س / {r.frequency === "daily" ? "يوم" : r.frequency === "monthly" ? "شهر" : r.frequency === "weekly" ? "أسبوع" : r.frequency}</small></span></div>
                          <div className="ap-donation-meta"><span className={`ap-status ${r.status === "active" ? "" : "ap-neutral"}`}>{label}</span>
                            {r.nextChargeDate && r.status === "active" && <span>الموعد المسجّل القادم: {dateLabel(r.nextChargeDate)}</span>}</div>
                          {(r.status === "active" || r.status === "paused") && <div className="ap-recurring-actions">
                            <button className="ap-button" disabled={!id || recurringMutation.isPending || cancelMutation.isPending} onClick={() => id && recurringMutation.mutate({ id, status: r.status === "active" ? "paused" : "active" })}>
                              {r.status === "active" ? <Pause /> : <Play />}{recurringMutation.isPending && recurringMutation.variables?.id === id ? "جارٍ التحديث…" : r.status === "active" ? "إيقاف مؤقت" : "استئناف"}
                            </button>
                            <button className="ap-button ap-button-danger" disabled={!id || recurringMutation.isPending || cancelMutation.isPending} onClick={() => { cancelMutation.reset(); setCancelTarget(r); }}><Ban />إلغاء التبرع الدوري</button>
                          </div>}
                          {recurringMutation.isError && recurringMutation.variables?.id === id && <p role="alert" className="ap-inline-error">تعذّر تحديث الحالة. لم يُحفظ التغيير؛ أعد المحاولة من الزر أعلاه.</p>}
                        </article>;
                      })}
                </section>
              </TabsContent>
              <TabsContent value="settings">
                <section className="ap-panel">
                  <div className="ap-panel-heading"><div><h2>خصوصيتك أولاً</h2><p>اختر كيف يظهر اسمك في قائمة الداعمين العامة.</p></div></div>
                  <div className="ap-privacy"><ShieldCheck aria-hidden="true" /><div className="ap-privacy-copy"><label htmlFor="public-donor">إظهار اسمي في قائمة الداعمين</label><p id="public-donor-description">عند تعطيل الخيار لن يظهر اسمك في القائمة العامة. لا يغيّر ذلك بيانات حسابك أو سجلّ تبرعاتك.</p></div>
                    <Switch id="public-donor" checked={!!user.isPublicDonor} disabled={privacyPending} onCheckedChange={changePrivacy} aria-describedby="public-donor-description" data-testid="switch-privacy" /></div>
                  <p className="ap-small mt-3" role="status">{privacyPending ? "جارٍ حفظ اختيارك…" : user.isPublicDonor ? "اسمك ظاهر في قائمة الداعمين." : "اسمك مخفي من قائمة الداعمين."}</p>
                  {privacyError && <div className="ap-inline-error" role="alert"><p>تعذّر حفظ إعداد الخصوصية. بقي اختيارك السابق دون تغيير.</p><button className="ap-button mt-2" disabled={privacyPending} onClick={() => { void changePrivacy(!user.isPublicDonor); }}>إعادة المحاولة</button></div>}
                  <div className="ap-security-note"><LockKeyhole aria-hidden="true" /><p>دخول حساب المتبرع عبر رمز التحقق المرسل إلى رقم الجوال. لا تشارك رمز الدخول مع أي شخص.</p></div>
                </section>
              </TabsContent>
            </Tabs>
          </>}
    </main>
    <Footer />
    <Dialog open={isEditing} onOpenChange={open => { if (!profileMutation.isPending) setIsEditing(open); }}>
      <DialogContent className="ap-dialog" dir="rtl">
        <DialogHeader className="text-right"><DialogTitle>بياناتك الشخصية</DialogTitle><DialogDescription>حدّث اسمك وبريدك. عرض الإيصالات وطباعتها لا يتطلب إضافة بريد إلكتروني.</DialogDescription></DialogHeader>
        <form className="ap-form" onSubmit={event => { event.preventDefault(); if (editData.name.trim()) profileMutation.mutate({ name: editData.name.trim(), email: editData.email.trim() }); }}>
          <div><label htmlFor="profile-name">الاسم</label><Input id="profile-name" required maxLength={120} autoComplete="name" value={editData.name} disabled={profileMutation.isPending} onChange={e => setEditData(p => ({ ...p, name: e.target.value }))} data-testid="input-edit-name" /></div>
          <div><label htmlFor="profile-email">البريد الإلكتروني <span className="ap-small">(اختياري)</span></label><Input id="profile-email" type="email" maxLength={254} autoComplete="email" dir="ltr" value={editData.email} disabled={profileMutation.isPending} onChange={e => setEditData(p => ({ ...p, email: e.target.value }))} data-testid="input-edit-email" /></div>
          {profileMutation.isError && <p className="ap-inline-error" role="alert">تعذّر حفظ بياناتك. لم تفقد تعديلاتك؛ حاول الحفظ مرة أخرى.</p>}
          <div className="ap-form-footer"><button type="submit" className="ap-button ap-button-primary" disabled={profileMutation.isPending || !editData.name.trim()} data-testid="button-save-profile"><Save />{profileMutation.isPending ? "جارٍ الحفظ…" : "حفظ التعديلات"}</button><button type="button" className="ap-button" disabled={profileMutation.isPending} onClick={() => setIsEditing(false)}>إلغاء</button></div>
        </form>
      </DialogContent>
    </Dialog>
    <AlertDialog open={!!cancelTarget} onOpenChange={open => { if (!open && !cancelMutation.isPending) setCancelTarget(null); }}>
      <AlertDialogContent className="ap-dialog" dir="rtl">
        <AlertDialogHeader className="text-right"><AlertDialogTitle>إلغاء التبرع الدوري؟</AlertDialogTitle><AlertDialogDescription>سيُحذف هذا السجل الدوري. لن تتأثر التبرعات السابقة المسجّلة. إذا أردت التوقف لفترة فقط، استخدم الإيقاف المؤقت بدلاً من الإلغاء.</AlertDialogDescription></AlertDialogHeader>
        {cancelMutation.isError && <p className="ap-inline-error" role="alert">تعذّر الإلغاء. لم يتغير السجل؛ أعد المحاولة.</p>}
        <AlertDialogFooter className="gap-2"><AlertDialogCancel disabled={cancelMutation.isPending}>الاحتفاظ بالتبرع الدوري</AlertDialogCancel><button className="ap-button ap-button-danger" disabled={cancelMutation.isPending} onClick={() => { const id = cancelTarget?._id || cancelTarget?.id; if (id) cancelMutation.mutate(id); }}>{cancelMutation.isPending ? "جارٍ الإلغاء…" : "تأكيد الإلغاء"}</button></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>;
}
