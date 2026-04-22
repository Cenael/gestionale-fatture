import jsPDF from "jspdf";
import * as XLSX from "xlsx-js-style";

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
}export function handleExportExcel(
  data: Invoice[],
  month: string,
  orderedSuppliers: FornitoreData[]
) {
  const rows: any[] = [];

  const [year, monthNum] = month.split("-");
  const monthNames = [
    "Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno",
    "Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"
  ];

  rows.push(["GESTIONALE FATTURE"]);
  rows.push([`Periodo: ${monthNames[parseInt(monthNum) - 1]} ${year}`]);
  rows.push([]);

  orderedSuppliers.forEach((supplier) => {
    rows.push([`FORNITORE: ${supplier.nome}`]);
    rows.push(["Numero", "Data", "Importo (€)"]);

    supplier.fatture.forEach((inv: Invoice) => {
      rows.push([
        inv.numero,
        new Date(inv.data).toLocaleDateString("it-IT"),
        Number(inv.importo),
      ]);
    });

    rows.push(["", "Subtotale", supplier.total]);
    rows.push([]);
  });

  const totalAmount = data.reduce(
    (acc, inv) => acc + Number(inv.importo),
    0
  );

  rows.push([]);
  rows.push(["", "TOTALE GENERALE", totalAmount]);

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // 🔥 COLONNE
  ws["!cols"] = [
    { wch: 25 },
    { wch: 18 },
    { wch: 18 },
  ];

  // 🔥 STILI
  const border = {
    top: { style: "thin" },
    bottom: { style: "thin" },
    left: { style: "thin" },
    right: { style: "thin" },
  };

  const range = XLSX.utils.decode_range(ws["!ref"]!);

  for (let r = range.s.r; r <= range.e.r; r++) {
    for (let c = 0; c <= 2; c++) {
      const cell = XLSX.utils.encode_cell({ r, c });
      if (!ws[cell]) continue;

      ws[cell].s = {
        border,
        alignment: {
          vertical: "center",
          horizontal: c === 2 ? "right" : "left",
        },
      };
    }
  }

  // 🔥 HEADER TABELLE
  for (let r = 0; r <= range.e.r; r++) {
    const cell = XLSX.utils.encode_cell({ r, c: 0 });
    if (ws[cell]?.v === "Numero") {
      ["A", "B", "C"].forEach((col) => {
        const headerCell = `${col}${r + 1}`;
        if (ws[headerCell]) {
          ws[headerCell].s = {
            ...ws[headerCell].s,
            font: { bold: true },
            fill: { fgColor: { rgb: "E5E7EB" } },
          };
        }
      });
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Fatture");

  XLSX.writeFile(wb, `Gestionale_Bar_${year}_${monthNum}.xlsx`);
}



export function handleExportExcelFornitore(
  supplierName: string,
  data: Invoice[],
  month: string
) {
  const supplierInvoices = data.filter(
    (inv) => (inv.fornitori?.nome || "Sconosciuto") === supplierName
  );

  if (supplierInvoices.length === 0) return;

  const rows: any[] = [];

  const [year, monthNum] = month.split("-");
  const monthNames = [
    "Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno",
    "Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"
  ];

  rows.push([`FORNITORE: ${supplierName}`]);
  rows.push([`Periodo: ${monthNames[parseInt(monthNum) - 1]} ${year}`]);
  rows.push([]);

  rows.push(["Numero", "Data", "Importo (€)"]);

  let subtotal = 0;

  supplierInvoices.forEach((inv: Invoice) => {
    rows.push([
      inv.numero,
      new Date(inv.data).toLocaleDateString("it-IT"),
      Number(inv.importo),
    ]);
    subtotal += Number(inv.importo);
  });

  rows.push([]);
  rows.push(["", "Totale", subtotal]);

  const ws = XLSX.utils.aoa_to_sheet(rows);

  ws["!cols"] = [
    { wch: 25 },
    { wch: 18 },
    { wch: 18 },
  ];

  const border = {
    top: { style: "thin" },
    bottom: { style: "thin" },
    left: { style: "thin" },
    right: { style: "thin" },
  };

  const range = XLSX.utils.decode_range(ws["!ref"]!);

  for (let r = 0; r <= range.e.r; r++) {
    for (let c = 0; c <= 2; c++) {
      const cell = XLSX.utils.encode_cell({ r, c });
      if (!ws[cell]) continue;

      ws[cell].s = {
        border,
        alignment: {
          vertical: "center",
          horizontal: c === 2 ? "right" : "left",
        },
      };
    }
  }

  // header bold + grigio
  ["A4", "B4", "C4"].forEach((cell) => {
    if (ws[cell]) {
      ws[cell].s = {
        ...ws[cell].s,
        font: { bold: true },
        fill: { fgColor: { rgb: "E5E7EB" } },
      };
    }
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, supplierName);

  XLSX.writeFile(
    wb,
    `Gestionale_Bar_${supplierName}_${year}_${monthNum}.xlsx`
  );
}