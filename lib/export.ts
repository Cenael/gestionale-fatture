import jsPDF from "jspdf";
import * as XLSX from "xlsx";

export interface Invoice {
  id: string;
  numero: string;
  data: string;
  importo: number;
  fornitori?: { nome: string };
}

export interface FornitoreData {
  nome: string;
  fatture: Invoice[];
  total: number;
}

export function handleExportPDF(
  data: Invoice[],
  month: string,
  orderedSuppliers: FornitoreData[]
) {
  const doc = new jsPDF();
  let yPosition = 10;

  doc.setFont("", "bold");
  doc.setFontSize(18);
  doc.text("Fatture Bar", 10, yPosition);
  yPosition += 10;

  doc.setFontSize(12);
  doc.setFont("", "normal");
  const [year, monthNum] = month.split("-");
  const monthNames = [
    "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
    "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
  ];
  doc.text(
    `Report: ${monthNames[parseInt(monthNum) - 1]} ${year}`,
    10,
    yPosition
  );
  yPosition += 10;

  // Totals
  const totalAmount = data.reduce(
    (acc, invoice) => acc + Number(invoice.importo),
    0
  );
  doc.setFont("", "bold");
  doc.text(`Totale Fatture: € ${totalAmount.toFixed(2)}`, 10, yPosition);
  yPosition += 8;
  doc.setFont("", "normal");
  doc.text(`Numero Fatture: ${data.length}`, 10, yPosition);
  yPosition += 12;

  orderedSuppliers.forEach((supplier) => {
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 10;
    }

    doc.setFont("", "bold");
    doc.text(supplier.nome, 10, yPosition);
    yPosition += 7;

    doc.setFont("", "normal");
    doc.setFontSize(10);

    supplier.fatture.forEach((inv: Invoice) => {
      if (yPosition > 260) {
        doc.addPage();
        yPosition = 10;
      }

      const formattedDate = new Date(inv.data).toLocaleDateString("it-IT");
      doc.text(`${inv.numero}`, 15, yPosition);
      doc.text(formattedDate, 35, yPosition);
      doc.text(`€ ${Number(inv.importo).toFixed(2)}`, 55, yPosition);
      yPosition += 6;
    });

    doc.setFont("", "bold");
    doc.text(
      `Subtotale: € ${supplier.total.toFixed(2)}`,
      60,
      yPosition
    );
    yPosition += 10;
    doc.setFont("", "normal");
  });

  yPosition += 5;
  doc.setFont("", "bold");
  doc.text(`TOTALE: € ${totalAmount.toFixed(2)}`, 10, yPosition);

  const filename = `Gestionale_Bar_${year}_${monthNum}.pdf`;
  doc.save(filename);
}

export function handleExportPDFFornitore(
  supplierName: string,
  data: Invoice[],
  month: string
) {
  const supplierInvoices = data.filter(
    (inv) => (inv.fornitori?.nome || "Unknown") === supplierName
  );

  if (supplierInvoices.length === 0) return;

  const doc = new jsPDF();
  let yPosition = 10;

  doc.setFont("", "bold");
  doc.setFontSize(16);
  doc.text(supplierName, 10, yPosition);
  yPosition += 8;

  const [year, monthNum] = month.split("-");
  const monthNames = [
    "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
    "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
  ];

  doc.setFont("", "normal");
  doc.setFontSize(11);
  doc.text(
    `Report: ${monthNames[parseInt(monthNum) - 1]} ${year}`,
    10,
    yPosition
  );
  yPosition += 8;

  doc.setFont("", "bold");
  doc.text("Numero", 15, yPosition);
  doc.text("Data", 50, yPosition);
  doc.text("Importo", 100, yPosition);
  yPosition += 8;

  doc.setFont("", "normal");
  let subtotal = 0;

  supplierInvoices.forEach((inv: Invoice) => {
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 10;
    }

    const formattedDate = new Date(inv.data).toLocaleDateString("it-IT");
    doc.text(`${inv.numero}`, 15, yPosition);
    doc.text(formattedDate, 50, yPosition);
    doc.text(`€ ${Number(inv.importo).toFixed(2)}`, 100, yPosition);
    yPosition += 6;
    subtotal += Number(inv.importo);
  });

  yPosition += 3;
  doc.setFont("", "bold");
  doc.text(`TOTALE: € ${subtotal.toFixed(2)}`, 100, yPosition);

  const filename = `Gestionale_Bar_${supplierName}_${year}_${monthNum}.pdf`;
  doc.save(filename);
}

export function handleExportExcel(
  data: Invoice[],
  month: string,
  orderedSuppliers: FornitoreData[]
) {
  const rows: any[] = [];
  orderedSuppliers.forEach((supplier) => {
    rows.push([supplier.nome]);
    rows.push(["Numero", "Data", "Importo"]);
    supplier.fatture.forEach((inv: Invoice) => {
      const formattedDate = new Date(inv.data).toLocaleDateString("it-IT");
      rows.push([inv.numero, formattedDate, Number(inv.importo).toFixed(2)]);
    });
    rows.push([`Subtotale: €`, supplier.total.toFixed(2)]);
    rows.push([]);
  });

  const totalAmount = data.reduce(
    (acc, inv) => acc + Number(inv.importo),
    0
  );
  rows.push(["TOTALE", totalAmount.toFixed(2)]);

  const sheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Fatture");

  const [year, monthNum] = month.split("-");
  const filename = `Gestionale_Bar_${year}_${monthNum}.xlsx`;
  XLSX.writeFile(workbook, filename);
}

export function handleExportExcelFornitore(
  supplierName: string,
  data: Invoice[],
  month: string
) {
  const supplierInvoices = data.filter(
    (inv) => (inv.fornitori?.nome || "Unknown") === supplierName
  );

  if (supplierInvoices.length === 0) return;

  const rows: any[] = [];
  rows.push([supplierName]);
  rows.push(["Numero", "Data", "Importo"]);

  let subtotal = 0;
  supplierInvoices.forEach((inv: Invoice) => {
    const formattedDate = new Date(inv.data).toLocaleDateString("it-IT");
    rows.push([inv.numero, formattedDate, Number(inv.importo).toFixed(2)]);
    subtotal += Number(inv.importo);
  });

  rows.push([`TOTALE: €`, subtotal.toFixed(2)]);

  const sheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Fatture");

  const [year, monthNum] = month.split("-");
  const filename = `Gestionale_Bar_${supplierName}_${year}_${monthNum}.xlsx`;
  XLSX.writeFile(workbook, filename);
}
