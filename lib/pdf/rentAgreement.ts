import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export interface RentAgreementData {
  ownerName: string;
  ownerPhone: string;
  ownerAddress: string;
  tenantName: string;
  tenantPhone: string;
  tenantAddress: string;
  propertyAddress: string;
  propertyType: string;
  rentAmount: number;
  depositAmount: number;
  startDate: string;
  durationMonths: number;
  noticePeriodDays: number;
  includeFurniture: boolean;
  city: string;
}

export async function generateRentAgreement(data: RentAgreementData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const { width, height } = page.getSize();
  const m = 50;
  const maxW = width - m * 2;
  let y = height - m;

  function wrap(str: string, size = 11) {
    const words = str.split(' ');
    let line = '';
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (font.widthOfTextAtSize(test, size) > maxW - 5) {
        page.drawText(line, { x: m, y, size, font });
        y -= size + 4;
        line = w;
      } else line = test;
    }
    if (line) {
      page.drawText(line, { x: m, y, size, font });
      y -= size + 4;
    }
  }

  page.drawText('RENT AGREEMENT', { x: m, y: height - m, size: 20, font: bold });
  y = height - m - 26;
  page.drawText(`Place: ${data.city}`, { x: m, y, size: 11, font });
  const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  page.drawText(`Date: ${dateStr}`, { x: m, y: y - 16, size: 11, font });
  y -= 40;

  page.drawText('PARTIES', { x: m, y, size: 13, font: bold }); y -= 20;
  wrap(`1. LANDLORD: ${data.ownerName}`);
  wrap(`   Address: ${data.ownerAddress}`);
  wrap(`   Contact: ${data.ownerPhone}`);
  wrap(`2. TENANT: ${data.tenantName}`);
  wrap(`   Address: ${data.tenantAddress}`);
  wrap(`   Contact: ${data.tenantPhone}`);

  y -= 12;
  page.drawText('PROPERTY DETAILS', { x: m, y, size: 13, font: bold }); y -= 20;
  wrap(`Property Type: ${data.propertyType}`);
  wrap(`Address: ${data.propertyAddress}`);
  wrap(`City: ${data.city}`);

  y -= 12;
  page.drawText('TERMS & CONDITIONS', { x: m, y, size: 13, font: bold }); y -= 20;

  const terms = [
    `1. Rent: Rs. ${data.rentAmount.toLocaleString('en-IN')} per month, payable on or before 5th of each calendar month.`,
    `2. Security Deposit: Rs. ${data.depositAmount.toLocaleString('en-IN')} refundable on vacating, subject to deductions for damages.`,
    `3. Duration: ${data.durationMonths} months starting ${new Date(data.startDate).toLocaleDateString('en-IN')}.`,
    `4. Notice Period: ${data.noticePeriodDays} days written notice from either party.`,
    `5. Utilities: Tenant pays water and electricity as per actual consumption.`,
    `6. Maintenance: Minor repairs up to Rs. 500 borne by Tenant; major structural repairs by Landlord.`,
    `7. Subletting: Not allowed without Landlord's written consent.`,
    data.includeFurniture
      ? `8. Furniture: Property is rented furnished with existing fixtures.`
      : `8. Furniture: Property is rented unfurnished.`,
    `9. Use: Residential purposes only.`,
    `10. Legal: Disputes subject to jurisdiction of courts in ${data.city}, Madhya Pradesh.`,
  ];
  for (const t of terms) { wrap(t); y -= 4; }

  y -= 30;
  page.drawText('_______________________', { x: m, y, size: 12, font });
  page.drawText('_______________________', { x: width / 2 + 20, y, size: 12, font });
  page.drawText(`LANDLORD: ${data.ownerName}`, { x: m, y: y - 18, size: 10, font: bold });
  page.drawText(`TENANT: ${data.tenantName}`, { x: width / 2 + 20, y: y - 18, size: 10, font: bold });

  page.drawText('Computer-generated agreement. Both parties should retain a copy.', {
    x: m, y: 30, size: 8, font, color: rgb(0.5, 0.5, 0.5),
  });

  return await pdf.save();
}