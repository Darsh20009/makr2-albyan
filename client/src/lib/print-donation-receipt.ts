import { albayanAssociation } from "@/lib/albayan-donation-facts";

const TYPE_LABELS: Record<string, string> = {
  water: "سقيا الماء",
  food: "إطعام الجائع",
  iftar: "إفطار صائم",
  "special-cases": "الحالات الخاصة",
  general: "تبرع عام",
  zakat: "زكاة مال",
  waqf: "وقف",
  "ramadan-basket": "سلة رمضانية",
};

function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char] || char);
}

function formatReceiptDate(value: unknown): string {
  const date = value ? new Date(String(value)) : new Date();
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function printDonationReceipt(invoice: Record<string, any>): void {
  const typeLabel = TYPE_LABELS[invoice.type] || invoice.type || "تبرع عام";
  const projectName = invoice.projectName || invoice.campaignTitle || invoice.serviceTitle || typeLabel;
  const receiptNumber = invoice.receiptId || invoice.invoiceNumber || invoice.id || "—";
  const paymentMethod = invoice.paymentMethod === "bank_transfer"
    ? "تحويل بنكي"
    : invoice.paymentMethod === "rajhi"
      ? "مصرف الراجحي"
      : invoice.paymentMethod === "online"
        ? "دفع إلكتروني"
        : "—";
  const amount = Number(invoice.amount || 0).toLocaleString("ar-SA");
  const origin = window.location.origin;
  const rows = [
    ["رقم الإيصال", receiptNumber],
    ["التاريخ", formatReceiptDate(invoice.createdAt)],
    ["اسم المشروع", projectName],
    ["نوع التبرع", typeLabel],
    ["طريقة الدفع", paymentMethod],
    ["المبلغ", `${amount} ريال سعودي`],
  ];
  const tableRows = rows.map(([label, value], index) =>
    `<tr class="${index === rows.length - 1 ? "amount-row" : ""}">
      <th scope="row">${escapeHtml(label)}</th>
      <td>${escapeHtml(value)}</td>
    </tr>`,
  ).join("");

  const html = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>إيصال تبرع — ${escapeHtml(receiptNumber)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');
    * { box-sizing: border-box; }
    body { margin: 0; padding: 28px; background: #f6f4ec; color: #173f35; font-family: Tajawal, Arial, sans-serif; }
    .receipt { width: min(100%, 760px); min-height: 900px; margin: 0 auto; padding: 42px; background: #fffefa; border: 1px solid #e8e4d8; border-radius: 18px; box-shadow: 0 12px 40px #173f3510; }
    .header { display: flex; align-items: center; justify-content: space-between; gap: 24px; padding-bottom: 28px; border-bottom: 1px solid #e9e6dc; }
    .logo { width: 190px; height: 88px; object-fit: contain; object-position: left center; }
    h1 { margin: 0; color: #124c3d; font-size: 34px; font-weight: 800; }
    .subhead { margin-top: 7px; color: #77847b; font-size: 13px; }
    table { width: 100%; margin-top: 38px; border: 1px solid #e8e5dc; border-radius: 14px; border-spacing: 0; overflow: hidden; }
    th, td { padding: 17px 20px; border-bottom: 1px solid #eeece5; font-size: 16px; line-height: 1.6; }
    tr:last-child th, tr:last-child td { border-bottom: 0; }
    th { width: 36%; color: #778078; background: #faf9f4; text-align: right; font-weight: 700; }
    td { color: #173f35; text-align: left; font-weight: 700; overflow-wrap: anywhere; }
    .amount-row th, .amount-row td { color: #0d614b; background: #f0f6ef; font-size: 20px; font-weight: 800; }
    .proof { display: grid; grid-template-columns: 1fr 120px 1fr; align-items: center; gap: 22px; margin-top: 46px; padding: 22px 4px; }
    .org-name { margin: 0 0 10px; font-size: 15px; font-weight: 800; line-height: 1.7; }
    .org-meta { margin: 4px 0; color: #68776d; font-size: 12px; line-height: 1.8; }
    .qr-wrap { text-align: center; }
    .qr { display: block; width: 94px; height: 94px; margin: auto; object-fit: contain; }
    .qr-caption { margin-top: 7px; color: #6d7a70; font-size: 10px; line-height: 1.5; }
    .stamp { width: 104px; height: 104px; display: grid; place-items: center; margin: auto; border: 2px solid #a98946; border-radius: 50%; color: #17614b; font-size: 17px; font-weight: 800; line-height: 1.35; text-align: center; transform: rotate(-9deg); }
    .note { margin: 24px 0 0; padding-top: 16px; border-top: 1px solid #e9e6dc; color: #899189; font-size: 11px; text-align: center; }
    @media (max-width: 600px) {
      body { padding: 10px; }
      .receipt { min-height: 0; padding: 22px 16px; border-radius: 12px; }
      .header { gap: 10px; padding-bottom: 18px; }
      .logo { width: 120px; height: 62px; }
      h1 { font-size: 25px; }
      .subhead { font-size: 11px; }
      th, td { padding: 13px 11px; font-size: 13px; }
      .amount-row th, .amount-row td { font-size: 16px; }
      .proof { grid-template-columns: 1fr 86px; gap: 14px; margin-top: 26px; }
      .stamp { grid-column: 1 / -1; grid-row: 2; width: 84px; height: 84px; font-size: 14px; }
      .qr { width: 76px; height: 76px; }
      .org-name { font-size: 12px; }
      .org-meta { font-size: 10px; }
    }
    @media print {
      @page { size: A4 portrait; margin: 12mm; }
      body { padding: 0; background: #fff; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .receipt { width: 100%; min-height: 0; padding: 24px; border: 1px solid #e8e4d8; border-radius: 0; box-shadow: none; }
    }
  </style>
</head>
<body>
  <main class="receipt">
    <header class="header">
      <img class="logo" src="${origin}/images/albayan-official-logo.png" alt="${escapeHtml(albayanAssociation.brandName)}">
      <div>
        <h1>فاتورة تبرع</h1>
        <p class="subhead">${escapeHtml(albayanAssociation.brandName)} · إيصال إلكتروني</p>
      </div>
    </header>
    <table aria-label="تفاصيل إيصال التبرع"><tbody>${tableRows}</tbody></table>
    <section class="proof">
      <div class="qr-wrap">
        <img class="qr" src="${origin}/images/albayan-registration-qr.png" alt="رمز بيانات تسجيل الجمعية">
        <p class="qr-caption">رمز التحقق من تسجيل الجمعية</p>
      </div>
      <div class="stamp">تم<br>الاستلام</div>
      <div>
        <p class="org-name">${escapeHtml(albayanAssociation.legalName)}</p>
        <p class="org-meta">رقم الترخيص: ${escapeHtml(albayanAssociation.licenseNumber)}</p>
        <p class="org-meta">قرار التسجيل: ${escapeHtml(albayanAssociation.registrationDecision)}</p>
        <p class="org-meta">${escapeHtml(albayanAssociation.city)}، المملكة العربية السعودية</p>
      </div>
    </section>
    <p class="note">صدر هذا الإيصال بعد تأكيد العملية. رمز QR للتحقق من بيانات تسجيل الجمعية، وليس للتحقق من حالة الدفع.</p>
  </main>
  <script>window.onload = () => window.print();</script>
</body>
</html>`;

  const printWindow = window.open("", "_blank", "width=900,height=900");
  if (!printWindow) return;
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
