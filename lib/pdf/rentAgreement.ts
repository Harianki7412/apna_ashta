import { PDFDocument, StandardFonts, rgb, PDFPage, PDFFont } from 'pdf-lib';

export interface RentAgreementData {
  // Place & Date
  place: string;
  agreementDate: string; // ISO date

  // Owner
  ownerName: string;
  ownerFatherName: string;
  ownerAddress: string;

  // Tenant
  tenantName: string;
  tenantFatherName: string;
  tenantOfficeOrInstitution: string;
  tenantAddress: string;

  // Property
  propertyAddress: string;
  propertyType: string;
  bhk?: string;

  // Lease
  startDate: string;
  expiryDate: string;
  rentAmount: number;
  maintenanceCharge: number;
  securityDeposit: number;
  chequeNumber: string;
  chequeDate: string;
  noticePeriodDays: number;
  city: string;

  // Annexure-I
  bedrooms: number;
  fans: number;
  cflLights: number;
  geysers: number;
  mirrors: number;

  // Witnesses
  witness1Name: string;
  witness1Address: string;
  witness2Name: string;
  witness2Address: string;
}

interface PDFContext {
  doc: PDFDocument;
  page: PDFPage;
  font: PDFFont;
  bold: PDFFont;
  margin: number;
  maxW: number;
  y: number;
  pageNum: number;
}

const PAGE_W = 595; // A4 width in points
const PAGE_H = 842; // A4 height in points
const MARGIN = 50;

async function createContext(doc: PDFDocument): Promise<PDFContext> {
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.addPage([PAGE_W, PAGE_H]);
  return {
    doc,
    page,
    font,
    bold,
    margin: MARGIN,
    maxW: PAGE_W - MARGIN * 2,
    y: PAGE_H - MARGIN,
    pageNum: 1,
  };
}

async function newPage(ctx: PDFContext): Promise<void> {
  ctx.page = ctx.doc.addPage([PAGE_W, PAGE_H]);
  ctx.y = PAGE_H - MARGIN;
  ctx.pageNum += 1;
}

function ensureSpace(ctx: PDFContext, needed: number): void {
  if (ctx.y - needed < MARGIN + 30) {
    newPage(ctx);
  }
}

function drawHeader(ctx: PDFContext): void {
  // Page number top-right
  const pageText = `Page ${ctx.pageNum}`;
  const pageWidth = ctx.font.widthOfTextAtSize(pageText, 8);
  ctx.page.drawText(pageText, {
    x: PAGE_W - MARGIN - pageWidth,
    y: PAGE_H - 25,
    size: 8,
    font: ctx.font,
    color: rgb(0.6, 0.6, 0.6),
  });

  // Divider
  ctx.page.drawLine({
    start: { x: MARGIN, y: ctx.y + 5 },
    end: { x: PAGE_W - MARGIN, y: ctx.y + 5 },
    thickness: 0.5,
    color: rgb(0.85, 0.85, 0.85),
  });
  ctx.y -= 12;
}

function drawTitle(ctx: PDFContext, text: string): void {
  ensureSpace(ctx, 40);
  const width = ctx.bold.widthOfTextAtSize(text, 16);
  const x = (PAGE_W - width) / 2;
  ctx.page.drawText(text, {
    x,
    y: ctx.y,
    size: 16,
    font: ctx.bold,
    color: rgb(0.1, 0.1, 0.1),
  });
  ctx.y -= 24;
}

function drawHeading(ctx: PDFContext, text: string): void {
  ensureSpace(ctx, 25);
  ctx.page.drawText(text, {
    x: MARGIN,
    y: ctx.y,
    size: 11,
    font: ctx.bold,
    color: rgb(0.15, 0.15, 0.15),
  });
  ctx.y -= 16;
}

function drawText(
  ctx: PDFContext,
  text: string,
  opts: {
    size?: number;
    bold?: boolean;
    indent?: number;
    color?: { r: number; g: number; b: number };
    lineGap?: number;
  } = {}
): void {
  const size = opts.size ?? 10;
  const isBold = opts.bold ?? false;
  const indent = opts.indent ?? 0;
  const lineGap = opts.lineGap ?? 4;
  const font = isBold ? ctx.bold : ctx.font;
  const color = opts.color
    ? rgb(opts.color.r, opts.color.g, opts.color.b)
    : rgb(0.15, 0.15, 0.15);

  const maxWidth = ctx.maxW - indent;
  const words = text.split(' ');
  let line = '';

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    const width = font.widthOfTextAtSize(test, size);
    if (width > maxWidth) {
      ensureSpace(ctx, size + lineGap);
      ctx.page.drawText(line, { x: MARGIN + indent, y: ctx.y, size, font, color });
      ctx.y -= size + lineGap;
      line = word;
    } else {
      line = test;
    }
  }
  if (line) {
    ensureSpace(ctx, size + lineGap);
    ctx.page.drawText(line, { x: MARGIN + indent, y: ctx.y, size, font, color });
    ctx.y -= size + lineGap;
  }
}

function drawNumberedClause(ctx: PDFContext, number: number, text: string): void {
  ensureSpace(ctx, 20);
  // Number
  ctx.page.drawText(`${number}.`, {
    x: MARGIN,
    y: ctx.y,
    size: 10,
    font: ctx.bold,
    color: rgb(0.15, 0.15, 0.15),
  });
  // Text with indent
  const originalMaxW = ctx.maxW;
  ctx.maxW = originalMaxW - 20;
  const originalMargin = MARGIN + 20;
  // Re-implement inline
  const size = 10;
  const font = ctx.font;
  const color = rgb(0.15, 0.15, 0.15);
  const maxWidth = originalMaxW - 20;
  const words = text.split(' ');
  let line = '';
  let firstLine = true;

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    const width = font.widthOfTextAtSize(test, size);
    if (width > maxWidth) {
      ensureSpace(ctx, size + 4);
      ctx.page.drawText(line, {
        x: originalMargin,
        y: ctx.y,
        size,
        font,
        color,
      });
      ctx.y -= size + 4;
      line = word;
      firstLine = false;
    } else {
      line = test;
    }
  }
  if (line) {
    ensureSpace(ctx, size + 4);
    ctx.page.drawText(line, {
      x: originalMargin,
      y: ctx.y,
      size,
      font,
      color,
    });
    ctx.y -= size + 4;
  }

  ctx.maxW = originalMaxW;
  ctx.y -= 4; // Extra gap between clauses
}

function drawBlankLine(ctx: PDFContext, height = 12): void {
  ensureSpace(ctx, height);
  ctx.y -= height;
}

function drawSignatureBox(
  ctx: PDFContext,
  label: string,
  name: string,
  x: number
): void {
  const boxW = 200;
  const boxY = ctx.y;

  // Line for signature
  ctx.page.drawLine({
    start: { x, y: boxY + 30 },
    end: { x: x + boxW, y: boxY + 30 },
    thickness: 0.7,
    color: rgb(0.4, 0.4, 0.4),
  });

  ctx.page.drawText(label, {
    x,
    y: boxY + 18,
    size: 9,
    font: ctx.bold,
    color: rgb(0.15, 0.15, 0.15),
  });

  ctx.page.drawText(name, {
    x,
    y: boxY + 4,
    size: 9,
    font: ctx.font,
    color: rgb(0.3, 0.3, 0.3),
  });
}

function formatDate(isoDate: string): { day: string; month: string; year: string } {
  try {
    const d = new Date(isoDate);
    const day = d.getDate().toString().padStart(2, '0');
    const month = d.toLocaleDateString('en-IN', { month: 'long' });
    const year = d.getFullYear().toString();
    return { day, month, year };
  } catch {
    return { day: '____', month: '____', year: '____' };
  }
}

/* ══════════════════════════════════════════════════════════════════
   MAIN PDF GENERATOR
   ══════════════════════════════════════════════════════════════════ */
export async function generateRentAgreement(data: RentAgreementData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const ctx = await createContext(doc);

  const date = formatDate(data.agreementDate);

  /* ─────────────── TITLE ─────────────── */
  drawHeader(ctx);
  drawTitle(ctx, 'RENTAL AGREEMENT');
  drawBlankLine(ctx, 8);

  /* ─────────────── PREAMBLE ─────────────── */
  drawText(
    ctx,
    `This RENTAL AGREEMENT is executed at ${data.place} on this ${date.day} day of ${date.month}, ${date.year} by and between:`,
    { size: 10 }
  );
  drawBlankLine(ctx, 6);

  // OWNER
  drawHeading(ctx, 'THE OWNER:');
  drawText(ctx, data.ownerName, { size: 10, bold: true, indent: 20 });
  drawText(ctx, `S/o or D/o. ${data.ownerFatherName}`, { size: 10, indent: 20 });
  drawText(ctx, data.ownerAddress, { size: 10, indent: 20 });
  drawText(
    ctx,
    `(hereinafter jointly and severally called the "OWNER", which expression shall include their heirs, legal representatives, successors and assigns) of the ONE PART:`,
    { size: 10, indent: 20 }
  );

  drawBlankLine(ctx, 8);

  // TENANT
  drawHeading(ctx, 'AND, in favour of:');
  drawText(ctx, 'THE TENANT:', { size: 10, bold: true, indent: 20 });
  drawText(ctx, data.tenantName, { size: 10, bold: true, indent: 20 });
  drawText(ctx, `S/o or D/o. ${data.tenantFatherName}`, { size: 10, indent: 20 });
  drawText(ctx, `Working/Studying at ${data.tenantOfficeOrInstitution}`, {
    size: 10,
    indent: 20,
  });
  drawText(ctx, `having a permanent address at ${data.tenantAddress}`, {
    size: 10,
    indent: 20,
  });
  drawText(
    ctx,
    `(hereinafter called the "TENANT", which expression shall include its legal representatives, successors and assigns) of the OTHER PART.`,
    { size: 10, indent: 20 }
  );

  drawBlankLine(ctx, 10);

  // WHEREAS
  drawText(
    ctx,
    `WHEREAS the Owner is the absolute owner of the property situated at ${data.propertyAddress} as detailed in Annexure-I, hereinafter referred to as "Demised Premises".`,
    { size: 10 }
  );
  drawBlankLine(ctx, 6);
  drawText(
    ctx,
    `WHEREAS the Tenant has requested the Owner to grant Rent with respect to the Schedule Premises and the Owner has agreed to rent out to the Tenant the Property with two-wheeler and four-wheeler parking space in the ground floor for residential purposes only, on the following terms and conditions:`,
    { size: 10 }
  );
  drawBlankLine(ctx, 8);

  drawText(ctx, 'NOW THIS DEED WITNESSETH AS FOLLOWS:', { size: 11, bold: true });
  drawBlankLine(ctx, 8);

  /* ─────────────── CLAUSES 1-21 ─────────────── */
  const clauses: string[] = [
    // 1
    `The rent in respect of the "Demised Premises" shall commence from ${new Date(data.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })} and shall be valid till ${new Date(data.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}. Thereafter, the same may be extended further on mutual consent of both the parties.`,
    // 2
    `That the Tenant shall pay to the Owner a monthly rent of Rs. ${data.rentAmount.toLocaleString('en-IN')}/- (Rupees ${numberToWords(data.rentAmount)} only), excluding electricity and water bill. The rent shall be paid on or before 7th day of each month without fail.`,
    // 3
    `That the Tenant shall pay to the Owner a monthly maintenance charge of Rs. ${data.maintenanceCharge.toLocaleString('en-IN')}/- towards the maintenance of Generator & Elevator, Salaries towards guards, Charges for Electricity Maintenance for Common Areas, Charges towards cleaning of Common Areas and towards maintaining the lawn.`,
    // 4
    `That the Tenant shall pay for the running cost of elevator and generator separately to the Owner.`,
    // 5
    `That during the Rent period, in addition to the rental amount payable to the Owner, the Tenant shall pay for the use of electricity and water as per bills received from the authorities concerned directly. For all the dues of electricity bills and water bills till the date the possession of the premises is handed over by the Owner to the Tenant it is the responsibility of the Owner to pay and clear them according to the readings on the respective meters. At the time of handing over possession of the premises back to the Owner by Tenant, it is the responsibility of the Tenant to pay electricity & water bills, as presented by the Departments concerned according to the readings on the respective meters up to the date of vacation of the property.`,
    // 6
    `The Tenant will pay to the Owner an interest-free refundable security deposit of Rs. ${data.securityDeposit.toLocaleString('en-IN')}/- vide cheque no. ${data.chequeNumber} dated ${data.chequeDate ? new Date(data.chequeDate).toLocaleDateString('en-IN') : '____'} at the time of signing the Rent Agreement. The said amount of the Security deposit shall be refunded by the Owner to the Tenant at the time of handing over possession of the demised premises by the Tenant upon expiry or sooner termination of this Rent after adjusting any dues (if any) or cost towards damages caused by the negligence of the Tenant or the person he is responsible for, normal wear & tear and damages due to act of god exempted. In case the Owner fails to refund the security deposit to the Tenant on early termination or expiry of the Rent agreement, the Tenant is entitled to hold possession of the Rented premises, without payment of rent and/or any other charges whatsoever, till such time the Owner refunds the security deposit to the Tenant. This is without prejudice and in addition to the other remedies available to the Tenant to recover the amount from the Owner.`,
    // 7
    `That all the sanitary, electrical and other fittings and fixtures and appliances in the premises shall be handed over from the Owner to the Tenant in good working condition.`,
    // 8
    `That the Tenant shall not sublet, assign or part with the demised premises in whole or part thereof to any person in any circumstances whatsoever and the same shall be used for the bonafide residential purposes only.`,
    // 9
    `That the day-to-day minor repairs will be the responsibility for the Tenant at his/her own expense. However, any structural or major repairs, if so required, shall be carried out by the Owner.`,
    // 10
    `That no structural additions or alterations shall be made by the Tenant in the premises without the prior written consent of the Owner but the Tenant can install air-conditioners in the space provided and other electrical gadgets and make such changes for the purposes as may be necessary, at his own cost. On termination of the tenancy or earlier, the Tenant will be entitled to remove such equipment and restore the changes made, if any, to the original state.`,
    // 11
    `That the Owner shall hold the right to visit in person or through his authorized agent(s), servants, workmen etc., to enter upon the demised premises for inspection (not exceeding once in a month) or to carry out repairs / construction, as and when required.`,
    // 12
    `That the Tenant shall comply with all the rules and regulations of the local authority applicable to the demised premises. The premises will be used only for residential purposes of its employees, families and guests.`,
    // 13
    `That the Owner shall pay for all taxes/cesses levied on the premises by the local or government authorities in the way of property tax for the premises and so on. Further, any other payment in the nature of subscription or periodical fee to the welfare association shall be paid by the Owner.`,
    // 14
    `That the Owner will keep the Tenant free and harmless from any claims, proceedings, demands, or actions by others with respect to quiet possession of the premises.`,
    // 15
    `That this Rent Agreement can be terminated before the expiry of this tenancy period by serving ${data.noticePeriodDays} days prior notice in writing by either party.`,
    // 16
    `The Tenant shall maintain the Demised Premises in good and tenable condition and all the minor repairs such as leakage in the sanitary fittings, water taps and electrical usage etc. shall be carried out by the Tenant. That it shall be the responsibility of the Tenant to hand over the vacant and peaceful possession of the demised premises on expiry of the Rent period, or on its early termination, as stated hereinabove in the same condition subject to natural wear and tear.`,
    // 17
    `That in case, where the Premises are not vacated by the Tenant, at the termination of the Rent period, the Tenant will pay damages calculated at two times the rent for any period of occupation commencing from the expiry of the Rent period. The payment of damages as aforesaid will not preclude the Owner from initiating legal proceedings against the Tenant for recovering possession of premises or for any other purpose.`,
    // 18
    `That both the parties shall observe and adhere to the terms and conditions contained hereinabove.`,
    // 19
    `That the Tenant and Owners represent and warrant that they are fully empowered and competent to make this Rent. That both the parties have read over and understood all the contents of this agreement and have signed the same without any force or pressure from any side.`,
    // 20
    `In case of any dispute to this agreement and the clauses herein, the same will be settled in the jurisdiction of the ${data.city} civil courts.`,
    // 21
    `That the Rent Agreement will be registered in front of the Registrar and the charges towards stamp duty, court fee & lawyer/coordinator will be equally borne by the Owner and Tenant.`,
  ];

  clauses.forEach((clause, i) => drawNumberedClause(ctx, i + 1, clause));

  /* ─────────────── ANNEXURE-I ─────────────── */
  newPage(ctx);
  drawHeader(ctx);
  drawTitle(ctx, 'ANNEXURE-I');
  drawBlankLine(ctx, 8);

  drawHeading(ctx, 'DETAILS OF THE DEMISED PREMISES:');
  drawText(ctx, data.propertyAddress, { size: 10, indent: 20 });
  drawBlankLine(ctx, 6);

  drawText(
    ctx,
    `The property consists of ${data.bedrooms} bedroom(s), living room, family lounge, kitchen, servant room and inbuilt fittings & fixtures, along with the following inventory:`,
    { size: 10 }
  );
  drawBlankLine(ctx, 8);

  // Inventory table
  const invY = ctx.y;
  const items = [
    { label: 'Fans', count: data.fans },
    { label: 'CFL Lights', count: data.cflLights },
    { label: 'Geysers', count: data.geysers },
    { label: 'Mirrors', count: data.mirrors },
  ];

  ctx.page.drawText('Item', {
    x: MARGIN + 20,
    y: invY,
    size: 10,
    font: ctx.bold,
    color: rgb(0.15, 0.15, 0.15),
  });
  ctx.page.drawText('Quantity', {
    x: MARGIN + 250,
    y: invY,
    size: 10,
    font: ctx.bold,
    color: rgb(0.15, 0.15, 0.15),
  });

  ctx.page.drawLine({
    start: { x: MARGIN + 20, y: invY - 4 },
    end: { x: MARGIN + 350, y: invY - 4 },
    thickness: 0.5,
    color: rgb(0.7, 0.7, 0.7),
  });

  ctx.y -= 20;
  items.forEach((item) => {
    ctx.page.drawText(item.label, {
      x: MARGIN + 20,
      y: ctx.y,
      size: 10,
      font: ctx.font,
      color: rgb(0.15, 0.15, 0.15),
    });
    ctx.page.drawText(String(item.count), {
      x: MARGIN + 250,
      y: ctx.y,
      size: 10,
      font: ctx.font,
      color: rgb(0.15, 0.15, 0.15),
    });
    ctx.y -= 18;
  });

  drawBlankLine(ctx, 20);

  /* ─────────────── SIGNATURE SECTION ─────────────── */
  newPage(ctx);
  drawHeader(ctx);
  drawBlankLine(ctx, 20);

  drawText(
    ctx,
    'IN WITNESS WHEREOF BOTH PARTIES AGREE AND SIGN THIS AGREEMENT ON THIS DAY AND YEAR.',
    { size: 10, bold: true }
  );
  drawBlankLine(ctx, 30);

  // Witnesses
  drawHeading(ctx, 'WITNESSES:');
  drawBlankLine(ctx, 12);

  // Witness 1
  drawText(ctx, '1.', { size: 10, bold: true });
  drawText(ctx, `Name: ${data.witness1Name}`, { size: 10, indent: 20 });
  drawText(ctx, `Address: ${data.witness1Address}`, { size: 10, indent: 20 });
  drawText(ctx, 'Signature: _______________________', { size: 10, indent: 20 });
  drawBlankLine(ctx, 20);

  // Witness 2
  drawText(ctx, '2.', { size: 10, bold: true });
  drawText(ctx, `Name: ${data.witness2Name}`, { size: 10, indent: 20 });
  drawText(ctx, `Address: ${data.witness2Address}`, { size: 10, indent: 20 });
  drawText(ctx, 'Signature: _______________________', { size: 10, indent: 20 });
  drawBlankLine(ctx, 40);

  // Signature blocks — owner + tenant
  const sigY = ctx.y;
  ctx.y = sigY;
  drawSignatureBox(ctx, 'OWNER', data.ownerName, MARGIN);

  ctx.y = sigY;
  drawSignatureBox(ctx, 'TENANT', data.tenantName, PAGE_W / 2 + 20);

  ctx.y -= 60;

  // Date + Place footer
  drawText(
    ctx,
    `Signed at ${data.place} on ${date.day}/${date.month}/${date.year}`,
    { size: 9, color: { r: 0.4, g: 0.4, b: 0.4 } }
  );

  return await doc.save();
}

/* ─────────────────────────────────────────────
   Number to Words (Indian format) — for rent amount
   ───────────────────────────────────────────── */
function numberToWords(num: number): string {
  if (num === 0) return 'Zero';

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convert(n: number): string {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
  }

  return convert(num);
}