// Import with error handling for missing packages
let jsPDF: any;
let autoTable: any;

try {
  jsPDF = require('jspdf').default || require('jspdf');
  autoTable = require('jspdf-autotable').default || require('jspdf-autotable');
} catch (error) {
  console.warn('jsPDF or jspdf-autotable not installed. Please run: npm install jspdf jspdf-autotable');
}

import { Result } from '../page';

interface ParticipationPdfOptions {
  contestName: string;
  data: Result[];
  fileName?: string;
}

export class ParticipationPdfGenerator {
  private doc: any;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 15; // Reduced margin for more table space

  constructor() {
    if (!jsPDF) {
      throw new Error('jsPDF not available. Please install: npm install jspdf jspdf-autotable');
    }
    
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
  }

  async generateParticipationPdf(options: ParticipationPdfOptions): Promise<Blob> {
    const { contestName, data, fileName = 'ParticipationWinners.pdf' } = options;

    // Add title - matching React PDF exactly
    this.addTitle(contestName);

    // Prepare table data
    const tableData = this.prepareTableData(data);

    // Generate table with autoTable - matching React PDF styling
    this.generateTable(tableData);

    // Convert to blob
    const pdfBlob = new Blob([this.doc.output('arraybuffer')], {
      type: 'application/pdf'
    });

    return pdfBlob;
  }

  private addTitle(contestName: string): void {
    // Compact title layout with reduced spacing
    this.doc.setFontSize(14); // Smaller title for more table space
    this.doc.setFont('helvetica', 'bold');
    
    // Add main title - uppercase and centered
    const titleText = contestName.toUpperCase();
    const titleWidth = this.doc.getTextWidth(titleText);
    const titleX = (this.pageWidth - titleWidth) / 2;
    this.doc.text(titleText, titleX, this.margin + 5); // Minimal top spacing

    // Add subtitle - compact spacing
    this.doc.setFontSize(12); // Smaller subtitle
    const subtitleText = 'PARTICIPATION MEDAL WINNERS';
    const subtitleWidth = this.doc.getTextWidth(subtitleText);
    const subtitleX = (this.pageWidth - subtitleWidth) / 2;
    this.doc.text(subtitleText, subtitleX, this.margin + 18); // Tight spacing between title and subtitle
  }

  private prepareTableData(data: Result[]): any[][] {
    return data.map((item, index) => [
      index + 1, // SR. NO.
      item.rollNumber || '', // ROLL NO.
      item.studentDetails?.studentName || '', // STUDENT NAME
      item.studentDetails?.fatherName || '', // FATHER NAME
      item.class || '', // CLASS
      item.schoolName || '' // INSTITUTION
    ]);
  }

  private generateTable(tableData: any[][]): void {
    // Calculate exact column widths - ensure they add up to exactly 100%
    const tableWidth = this.pageWidth - (2 * 10); // Available width (using margin of 10)
    
    // Adjusted column widths to total exactly 100%: 8%, 19%, 22%, 22%, 8%, 21%
    const columnWidths = {
      srNo: tableWidth * 0.08,        // 8% -> SR. NO.
      rollNo: tableWidth * 0.19,      // 19% -> ROLL NO. (decreased by 5%)
      studentName: tableWidth * 0.22, // 22% -> STUDENT NAME
      fatherName: tableWidth * 0.22,  // 22% -> FATHER NAME  
      class: tableWidth * 0.08,       // 8% -> CLASS
      institution: tableWidth * 0.21  // 21% -> INSTITUTION (increased by 5%)
    };

    autoTable(this.doc, {
      head: [['SR. NO.', 'ROLL NO.', 'STUDENT NAME', 'FATHER NAME', 'CLASS', 'INSTITUTION']],
      body: tableData,
      startY: this.margin + 28, // Start table closer to subtitle on first page
      theme: 'grid',
      tableWidth: tableWidth, // Explicitly set table width to prevent extra columns
      styles: {
        fontSize: 8, // Readable font size
        cellPadding: 1, // Some breathing room but still compact
        overflow: 'linebreak',
        halign: 'center',
        valign: 'middle',
        minCellHeight: 8, // Compact but readable row height
        lineColor: [0, 0, 0], // Black borders
        lineWidth: 0.3, // Thin but visible borders
      },
      headStyles: {
        fillColor: [240, 240, 240], // Match React PDF backgroundColor: "#f0f0f0"
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        fontSize: 8, // Readable header font
        halign: 'center',
        cellPadding: 1, // Some breathing room for headers
        minCellHeight: 8, // Compact but readable header height
      },
      columnStyles: {
        0: { cellWidth: columnWidths.srNo }, // SR. NO.
        1: { cellWidth: columnWidths.rollNo }, // ROLL NO.
        2: { cellWidth: columnWidths.studentName }, // STUDENT NAME
        3: { cellWidth: columnWidths.fatherName }, // FATHER NAME
        4: { cellWidth: columnWidths.class }, // CLASS
        5: { cellWidth: columnWidths.institution } // INSTITUTION
      },
      margin: 10, // Use simple uniform margin for all sides and all pages
      pageBreak: 'auto',
      showHead: 'everyPage',
      // Match React PDF table border behavior
      tableLineColor: [0, 0, 0],
      tableLineWidth: 0.3, // Thin but visible table borders
    });
  }

}

// Utility function for easy use
export async function generateParticipationPdfWithAutoTable(
  contestName: string,
  data: Result[]
): Promise<Blob> {
  if (!jsPDF || !autoTable) {
    throw new Error('jsPDF packages not installed. Please run: npm install jspdf jspdf-autotable');
  }
  
  const generator = new ParticipationPdfGenerator();
  return await generator.generateParticipationPdf({
    contestName,
    data
  });
}

// Chunked processing for large datasets
export async function generateParticipationPdfChunked(
  contestName: string,
  data: Result[],
  onProgress?: (progress: number, message: string) => void
): Promise<Blob> {
  if (!jsPDF || !autoTable) {
    throw new Error('jsPDF packages not installed. Please run: npm install jspdf jspdf-autotable');
  }
  
  const CHUNK_SIZE = 2000; // Process 2000 records at a time for jsPDF
  
  if (data.length <= CHUNK_SIZE) {
    // Small dataset, process normally
    onProgress?.(100, 'Generating PDF...');
    return await generateParticipationPdfWithAutoTable(contestName, data);
  }

  // Large dataset, process in chunks
  const generator = new ParticipationPdfGenerator();
  
  // Process first chunk
  onProgress?.(10, 'Processing data...');
  
  // For very large datasets, we still generate one PDF but with progress tracking
  onProgress?.(50, `Processing ${data.length} records...`);
  
  // Add small delay to prevent blocking
  await new Promise(resolve => setTimeout(resolve, 100));
  
  onProgress?.(80, 'Generating PDF...');
  
  const pdfBlob = await generator.generateParticipationPdf({
    contestName,
    data
  });
  
  onProgress?.(100, 'PDF generated successfully!');
  
  return pdfBlob;
}