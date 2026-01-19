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

interface AwardsPdfOptions {
  contestName: string;
  data: Result[];
  awardType: string;
  fileName?: string;
}

export class AwardsPdfGenerator {
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

  private async loadRobotoFont(): Promise<void> {
    try {
      // Load Roboto font files and add them to jsPDF
      const robotoRegularResponse = await fetch('/fonts/Roboto-Regular.ttf');
      const robotoBoldResponse = await fetch('/fonts/Roboto-Bold.ttf');
      
      if (robotoRegularResponse.ok && robotoBoldResponse.ok) {
        const robotoRegularBuffer = await robotoRegularResponse.arrayBuffer();
        const robotoBoldBuffer = await robotoBoldResponse.arrayBuffer();
        
        // Convert to base64
        const robotoRegularBase64 = this.arrayBufferToBase64(robotoRegularBuffer);
        const robotoBoldBase64 = this.arrayBufferToBase64(robotoBoldBuffer);
        
        // Add fonts to jsPDF
        this.doc.addFileToVFS('Roboto-Regular.ttf', robotoRegularBase64);
        this.doc.addFileToVFS('Roboto-Bold.ttf', robotoBoldBase64);
        
        this.doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
        this.doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');
        
        console.log('Roboto fonts loaded successfully');
      } else {
        throw new Error('Could not fetch Roboto font files');
      }
    } catch (error) {
      console.warn('Could not load Roboto font, using Helvetica fallback:', error);
      // Fallback to helvetica if Roboto loading fails
    }
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  async generateAwardsPdf(options: AwardsPdfOptions): Promise<Blob> {
    const { contestName, data, awardType, fileName = `${awardType}Winners.pdf` } = options;

    // Load Roboto font first
    await this.loadRobotoFont();

    // Add title - matching React PDF exactly
    this.addTitle(contestName, awardType);

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

  private addTitle(contestName: string, awardType: string): void {
    // Compact title layout with reduced spacing - using Roboto font to match React PDF
    this.doc.setFontSize(14); // Smaller title for more table space
    
    try {
      this.doc.setFont('Roboto', 'bold'); // Try to use Roboto Bold
    } catch (error) {
      this.doc.setFont('helvetica', 'bold'); // Fallback to helvetica
    }
    
    // Add main title - uppercase and centered
    const titleText = contestName.toUpperCase();
    const titleWidth = this.doc.getTextWidth(titleText);
    const titleX = (this.pageWidth - titleWidth) / 2;
    this.doc.text(titleText, titleX, this.margin + 5); // Minimal top spacing

    // Add subtitle - reduced spacing between title and subtitle
    this.doc.setFontSize(12); // Smaller subtitle
    
    try {
      this.doc.setFont('Roboto', 'bold'); // Try to use Roboto Bold
    } catch (error) {
      this.doc.setFont('helvetica', 'bold'); // Fallback to helvetica
    }
    
    const subtitleText = `${awardType.toUpperCase()} MEDAL WINNERS`;
    const subtitleWidth = this.doc.getTextWidth(subtitleText);
    const subtitleX = (this.pageWidth - subtitleWidth) / 2;
    this.doc.text(subtitleText, subtitleX, this.margin + 15); // Reduced spacing for tighter layout
  }

  private prepareTableData(data: Result[]): any[][] {
    return data.map((item, index) => [
      index + 1, // SR. NO.
      item.rollNumber || '', // ROLL NO.
      item.studentDetails?.studentName || '', // STUDENT NAME
      item.studentDetails?.fatherName || '', // FATHER NAME
      item.class || '', // CLASS
      (item.schoolName || '').toUpperCase() // INSTITUTION - converted to uppercase
    ]);
  }

  private generateTable(tableData: any[][]): void {
    // Calculate exact column widths - ensure they add up to exactly 100%
    const tableWidth = this.pageWidth - (2 * 10); // Available width (using margin of 10)
    
    // Column widths: 8%, 20%, 20%, 20%, 8%, 24%
    const columnWidths = {
      srNo: tableWidth * 0.08,        // 8% -> SR. NO.
      rollNo: tableWidth * 0.20,      // 20% -> ROLL NO.
      studentName: tableWidth * 0.20, // 20% -> STUDENT NAME
      fatherName: tableWidth * 0.20,  // 20% -> FATHER NAME  
      class: tableWidth * 0.08,       // 8% -> CLASS
      institution: tableWidth * 0.24  // 24% -> INSTITUTION
    };

    autoTable(this.doc, {
      head: [['SR. NO.', 'ROLL NO.', 'STUDENT NAME', 'FATHER NAME', 'CLASS', 'INSTITUTION']],
      body: tableData,
      startY: this.margin + 25, // Adjusted to match reduced title/subtitle spacing
      theme: 'grid',
      tableWidth: tableWidth, // Explicitly set table width to prevent extra columns
      styles: {
        fontSize: 9, // Font size 9pt
        cellPadding: 1, // Some breathing room but still compact
        overflow: 'linebreak',
        halign: 'center',
        valign: 'middle',
        minCellHeight: 8, // Compact but readable row height
        lineColor: [0, 0, 0], // Black borders
        lineWidth: 0.3, // Thin but visible borders
        font: 'Roboto', // Use Roboto font to match React PDF
        fontStyle: 'normal', // Regular weight to match Roboto-Regular
        textColor: [0, 0, 0], // Black text color for cell content
      },
      headStyles: {
        fillColor: [240, 240, 240], // Match React PDF backgroundColor: "#f0f0f0"
        textColor: [0, 0, 0], // Black text color for headers
        fontStyle: 'bold', // Bold headers to match React PDF
        fontSize: 9, // Font size 9pt
        halign: 'center',
        cellPadding: 1, // Some breathing room for headers
        minCellHeight: 8, // Compact but readable header height
        font: 'Roboto', // Use Roboto font to match React PDF
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
      rowPageBreak: 'avoid', // Prevent rows from splitting across pages
      // Match React PDF table border behavior
      tableLineColor: [0, 0, 0],
      tableLineWidth: 0.3, // Thin but visible table borders
    });
  }
}

// Gold Winners PDF Generator
export async function generateGoldPdfWithAutoTable(
  contestName: string,
  data: Result[]
): Promise<Blob> {
  if (!jsPDF || !autoTable) {
    throw new Error('jsPDF packages not installed. Please run: npm install jspdf jspdf-autotable');
  }
  
  const generator = new AwardsPdfGenerator();
  return await generator.generateAwardsPdf({
    contestName,
    data,
    awardType: 'GOLD'
  });
}

// Silver Winners PDF Generator
export async function generateSilverPdfWithAutoTable(
  contestName: string,
  data: Result[]
): Promise<Blob> {
  if (!jsPDF || !autoTable) {
    throw new Error('jsPDF packages not installed. Please run: npm install jspdf jspdf-autotable');
  }
  
  const generator = new AwardsPdfGenerator();
  return await generator.generateAwardsPdf({
    contestName,
    data,
    awardType: 'SILVER'
  });
}

// Bronze Winners PDF Generator
export async function generateBronzePdfWithAutoTable(
  contestName: string,
  data: Result[]
): Promise<Blob> {
  if (!jsPDF || !autoTable) {
    throw new Error('jsPDF packages not installed. Please run: npm install jspdf jspdf-autotable');
  }
  
  const generator = new AwardsPdfGenerator();
  return await generator.generateAwardsPdf({
    contestName,
    data,
    awardType: 'BRONZE'
  });
}

// Three Star Winners PDF Generator
export async function generateThreeStarPdfWithAutoTable(
  contestName: string,
  data: Result[]
): Promise<Blob> {
  if (!jsPDF || !autoTable) {
    throw new Error('jsPDF packages not installed. Please run: npm install jspdf jspdf-autotable');
  }
  
  const generator = new AwardsPdfGenerator();
  return await generator.generateAwardsPdf({
    contestName,
    data,
    awardType: 'THREE STAR'
  });
}

// Two Star Winners PDF Generator
export async function generateTwoStarPdfWithAutoTable(
  contestName: string,
  data: Result[]
): Promise<Blob> {
  if (!jsPDF || !autoTable) {
    throw new Error('jsPDF packages not installed. Please run: npm install jspdf jspdf-autotable');
  }
  
  const generator = new AwardsPdfGenerator();
  return await generator.generateAwardsPdf({
    contestName,
    data,
    awardType: 'TWO STAR'
  });
}

// One Star Winners PDF Generator
export async function generateOneStarPdfWithAutoTable(
  contestName: string,
  data: Result[]
): Promise<Blob> {
  if (!jsPDF || !autoTable) {
    throw new Error('jsPDF packages not installed. Please run: npm install jspdf jspdf-autotable');
  }
  
  const generator = new AwardsPdfGenerator();
  return await generator.generateAwardsPdf({
    contestName,
    data,
    awardType: 'ONE STAR'
  });
}

// Chunked processing for large datasets - Generic function for all award types
export async function generateAwardsPdfChunked(
  contestName: string,
  data: Result[],
  awardType: string,
  onProgress?: (progress: number, message: string) => void
): Promise<Blob> {
  if (!jsPDF || !autoTable) {
    throw new Error('jsPDF packages not installed. Please run: npm install jspdf jspdf-autotable');
  }
  
  const CHUNK_SIZE = 2000; // Process 2000 records at a time for jsPDF
  
  if (data.length <= CHUNK_SIZE) {
    // Small dataset, process normally
    onProgress?.(100, `Generating ${awardType} PDF...`);
    
    const generator = new AwardsPdfGenerator();
    return await generator.generateAwardsPdf({
      contestName,
      data,
      awardType
    });
  }

  // Large dataset, process in chunks
  const generator = new AwardsPdfGenerator();
  
  // Process first chunk
  onProgress?.(10, 'Processing data...');
  
  // For very large datasets, we still generate one PDF but with progress tracking
  onProgress?.(50, `Processing ${data.length} ${awardType} records...`);
  
  // Add small delay to prevent blocking
  await new Promise(resolve => setTimeout(resolve, 100));
  
  onProgress?.(80, `Generating ${awardType} PDF...`);
  
  const pdfBlob = await generator.generateAwardsPdf({
    contestName,
    data,
    awardType
  });
  
  onProgress?.(100, `${awardType} PDF generated successfully!`);
  
  return pdfBlob;
}