import { jsPDF } from 'jspdf';

// Background PDF Assembler Engine
let pdf: jsPDF | null = null;
let state = {
  yPosition: 10,
  margin: 10,
  pdfWidth: 0,
  pageHeight: 0,
  contentWidth: 0
};

self.onmessage = async (e) => {
  const { type, payload } = e.data;

  try {
    if (type === 'START') {
      pdf = new jsPDF('p', 'mm', 'a4');
      state.pdfWidth = pdf.internal.pageSize.getWidth();
      state.pageHeight = pdf.internal.pageSize.getHeight();
      state.margin = 10;
      state.yPosition = state.margin;
      state.contentWidth = state.pdfWidth - (state.margin * 2);
      
      self.postMessage({ type: 'READY' });
    }

    if (type === 'ADD_BATCH' && pdf) {
      const { imgData, format } = payload;
      
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * state.contentWidth) / imgProps.width;

      // Handle Page Breaks
      if (state.yPosition + imgHeight > state.pageHeight - state.margin) {
        pdf.addPage();
        state.yPosition = state.margin;
      }

      pdf.addImage(imgData, format, state.margin, state.yPosition, state.contentWidth, imgHeight, undefined, 'FAST');
      state.yPosition += imgHeight + 4;
      
      // Signal main thread we are ready for more data
      self.postMessage({ type: 'BATCH_PROCESSED' });
    }

    if (type === 'FINALIZE' && pdf) {
      // Add system footer
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(
        "BrainWave Core Protocol • Confidential Evaluation", 
        state.pdfWidth / 2, 
        state.pageHeight - 5, 
        { align: 'center' }
      );

      const blob = pdf.output('blob');
      self.postMessage({ type: 'FINISHED', blob });
      
      // Cleanup
      pdf = null;
    }
  } catch (err: any) {
    self.postMessage({ type: 'ERROR', error: err.message || 'Worker Internal Error' });
  }
};
