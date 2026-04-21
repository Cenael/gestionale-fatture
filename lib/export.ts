import jsPDF from "jspdf";
import * as XLSX from "xlsx";

export interface Fattura {
  id: string;
  numero: string;
  data: string;
  importo: number;
  fornitori?: { nome: string };
}

export interface FornitoreData {
  nome: string;
  fatture: Fattura[];
  totale: number;
}

export function handleExportPDF(
  data: Fattura[],
  mese: string,
  fornitori_ordinati: FornitoreData[]
) {
  const doc = new jsPDF();
  let yPosition = 10;

  doc.setFont("", "bold");
  doc.setFontSize(18);
  doc.text("Gestionale Bar", 10, yPosition);
  yPosition += 10;

  doc.setFontSize(12);
  doc.setFont("", "normal");
  const [anno, mese_num] = mese.split("-");
  const mesiNomi = [
    "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
    "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
  ];
  doc.text(
    `Report: ${mesiNomi[parseInt(mese_num) - 1]} ${anno}`,
    10,
    yPosition
  );
  yPosition += 10;

  // TOTALI
  const totaleGenerale = data.reduce(
    (acc, f) => acc + Number(f.importo),
    0
  );
  doc.setFont("", "bold");
  doc.text(`Totale Fatture: € ${totaleGenerale.toFixed(2)}`, 10, yPosition);
  yPosition += 8;
  doc.setFont("", "normal");
  doc.text(`Numero Fatture: ${data.length}`, 10, yPosition);
  yPosition += 12;

  fornitori_ordinati.forEach((fornitore) => {
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 10;
    }

    doc.setFont("", "bold");
    doc.text(fornitore.nome, 10, yPosition);
    yPosition += 7;

    doc.setFont("", "normal");
    doc.setFontSize(10);

    fornitore.fatture.forEach((f: any) => {
      if (yPosition > 260) {
        doc.addPage();
        yPosition = 10;
      }

      const data_formatted = new Date(f.data).toLocaleDateString("it-IT");
      doc.text(`${f.numero}`, 15, yPosition);
      doc.text(data_formatted, 35, yPosition);
      doc.text(`€ ${Number(f.importo).toFixed(2)}`, 55, yPosition);
      yPosition += 6;
    });

    doc.setFont("", "bold");
    doc.text(
      `Subtotale: € ${fornitore.totale.toFixed(2)}`,
      60,
      yPosition
    );
    yPosition += 10;
    doc.setFont("", "normal");
  });

  yPosition += 5;
  doc.setFont("", "bold");
  doc.text(`TOTALE: € ${totaleGenerale.toFixed(2)}`, 10, yPosition);

  const filename = `Gestionale_Bar_${anno}_${mese_num}.pdf`;
  doc.save(filename);
}

export function handleExportPDFFornitore(
  nomeFornitore: string,
  data: Fattura[],
  mese: string
) {
  const fornitoreFatture = data.filter(
    (f) => (f.fornitori?.nome || "Sconosciuto") === nomeFornitore
  );

  if (fornitoreFatture.length === 0) return;

  const doc = new jsPDF();
  let yPosition = 10;

  doc.setFont("", "bold");
  doc.setFontSize(16);
  doc.text(nomeFornitore, 10, yPosition);
  yPosition += 8;

  const [anno, mese_num] = mese.split("-");
  const mesiNomi = [
    "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
    "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
  ];

  doc.setFont("", "normal");
  doc.setFontSize(11);
  doc.text(
    `Report: ${mesiNomi[parseInt(mese_num) - 1]} ${anno}`,
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
  let subtotale = 0;

  fornitoreFatture.forEach((f) => {
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 10;
    }

    const data_formatted = new Date(f.data).toLocaleDateString("it-IT");
    doc.text(`${f.numero}`, 15, yPosition);
    doc.text(data_formatted, 50, yPosition);
    doc.text(`€ ${Number(f.importo).toFixed(2)}`, 100, yPosition);
    yPosition += 6;
    subtotale += Number(f.importo);
  });

  yPosition += 3;
  doc.setFont("", "bold");
  doc.text(`TOTALE: € ${subtotale.toFixed(2)}`, 100, yPosition);

  const filename = `Gestionale_Bar_${nomeFornitore}_${anno}_${mese_num}.pdf`;
  doc.save(filename);
}

export function handleExportExcel(
  data: Fattura[],
  mese: string,
  fornitori_ordinati: FornitoreData[]
) {
  const rows: any[] = [];
  fornitori_ordinati.forEach((fornitore) => {
    rows.push([fornitore.nome]);
    rows.push(["Numero", "Data", "Importo"]);
    fornitore.fatture.forEach((f: any) => {
      const data_formatted = new Date(f.data).toLocaleDateString("it-IT");
      rows.push([f.numero, data_formatted, Number(f.importo).toFixed(2)]);
    });
    rows.push([`Subtotale: €`, fornitore.totale.toFixed(2)]);
    rows.push([]);
  });

  const totaleGenerale = data.reduce(
    (acc, f) => acc + Number(f.importo),
    0
  );
  rows.push(["TOTALE", totaleGenerale.toFixed(2)]);

  const sheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Fatture");

  const [anno, mese_num] = mese.split("-");
  const filename = `Gestionale_Bar_${anno}_${mese_num}.xlsx`;
  XLSX.writeFile(workbook, filename);
}

export function handleExportExcelFornitore(
  nomeFornitore: string,
  data: Fattura[],
  mese: string
) {
  const fornitoreFatture = data.filter(
    (f) => (f.fornitori?.nome || "Sconosciuto") === nomeFornitore
  );

  if (fornitoreFatture.length === 0) return;

  const rows: any[] = [];
  rows.push([nomeFornitore]);
  rows.push(["Numero", "Data", "Importo"]);

  let subtotale = 0;
  fornitoreFatture.forEach((f: any) => {
    const data_formatted = new Date(f.data).toLocaleDateString("it-IT");
    rows.push([f.numero, data_formatted, Number(f.importo).toFixed(2)]);
    subtotale += Number(f.importo);
  });

  rows.push([`TOTALE: €`, subtotale.toFixed(2)]);

  const sheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Fatture");

  const [anno, mese_num] = mese.split("-");
  const filename = `Gestionale_Bar_${nomeFornitore}_${anno}_${mese_num}.xlsx`;
  XLSX.writeFile(workbook, filename);
}
