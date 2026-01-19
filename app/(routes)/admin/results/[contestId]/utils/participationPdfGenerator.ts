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

  async generateParticipationPdf(options: ParticipationPdfOptions): Promise<Blob> {
    const { contestName, data, fileName = 'ParticipationWinners.pdf' } = options;

    // Load Roboto font first
    await this.loadRobotoFont();

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
    
    const subtitleText = 'PARTICIPATION MEDAL WINNERS';
    const subtitleWidth = this.doc.getTextWidth(subtitleText);
    const subtitleX = (this.pageWidth - subtitleWidth) / 2;
    this.doc.text(subtitleText, subtitleX, this.margin + 15); // Reduced from 18 to 15 for tighter spacing
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
    
    // Adjusted column widths to total exactly 100%: 8%, 20%, 20%, 20%, 8%, 24%
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
      startY: this.margin + 20, // Adjusted to match reduced title/subtitle spacing
      theme: 'grid',
      tableWidth: tableWidth, // Explicitly set table width to prevent extra columns
      styles: {
        fontSize: 9, // Increased font size from 8 to 9
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
        fontSize: 9, // Increased font size from 8 to 9
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
      // Prevent row splitting across pages for long content
      willDrawCell: (data: any) => {
        // Check if this is a data row (not header) and we're at the first cell of a row
        if (data.section === 'body' && data.column.index === 0) {
          // Get the raw row data
          const rowData = data.row.raw;
          const studentName = rowData[2] || '';
          const fatherName = rowData[3] || '';
          const institution = rowData[5] || '';
          
          // Check if any of these fields are long enough to potentially cause wrapping
          const hasLongContent = 
            studentName.length > 25 || 
            fatherName.length > 25 || 
            institution.length > 30;
          
          // If content is long and we're near the bottom of the page, force a page break
          if (hasLongContent) {
            const pageHeight = data.doc.internal.pageSize.getHeight();
            const currentY = data.cursor.y;
            const remainingSpace = pageHeight - currentY;
            
            // If less than 20mm remaining space, force page break before this row
            if (remainingSpace < 20) {
              data.doc.addPage();
              data.cursor.y = 10; // Reset Y position to top margin
            }
          }
        }
      },
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