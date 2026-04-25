import { jsPDF } from 'jspdf';
import type { Question } from '../store/useQuizStore';

// Enterprise-standard AMOLED/Silver Palette
const COLORS = {
  bg: [0, 0, 0],
  card: [12, 12, 12],
  border: [38, 38, 38],
  accent: [229, 229, 229], // Silver
  accentBlue: [0, 122, 255],
  textMain: [245, 245, 245],
  textMuted: [115, 115, 115],
  success: [34, 197, 94],
  danger: [239, 68, 68],
  warning: [249, 115, 22]
};

const drawGlassCard = (doc: jsPDF, x: number, y: number, w: number, h: number, statusColor: number[]) => {
  // Card Shadow/Glow effect (Subtle)
  doc.setDrawColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.setLineWidth(0.5);
  
  // Card Background
  doc.setFillColor(COLORS.card[0], COLORS.card[1], COLORS.card[2]);
  doc.roundedRect(x, y, w, h, 4, 4, 'FD');
  
  // Status Accent Line (Left border like the UI)
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.rect(x, y, 3, h, 'F');
};

export const generateAnswerKeyPDF = async (questions: Question[]) => {
  const doc = jsPDF('p', 'mm', 'a4');
  let y = 20;

  // Header
  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, 210, 297, 'F');
  
  doc.setTextColor(COLORS.accentBlue[0], COLORS.accentBlue[1], COLORS.accentBlue[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('OFFICIAL ANSWER KEY', 105, y, { align: 'center' });
  
  y += 10;
  doc.setFontSize(10);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text(`System-Generated Engineering Protocol • ${new Date().toLocaleDateString()}`, 105, y, { align: 'center' });
  
  y += 20;

  questions.forEach((q, i) => {
    const cardH = 45;
    if (y + cardH > 280) {
      doc.addPage();
      doc.setFillColor(0, 0, 0);
      doc.rect(0, 0, 210, 297, 'F');
      y = 20;
    }

    drawGlassCard(doc, 15, y, 180, cardH, COLORS.accentBlue);
    
    // Question Header
    doc.setTextColor(COLORS.accentBlue[0], COLORS.accentBlue[1], COLORS.accentBlue[2]);
    doc.setFontSize(10);
    doc.text(`SUBJECT: ${q.category.toUpperCase()}`, 22, y + 8);

    // Question Text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    const splitTitle = doc.splitTextToSize(`Q${i+1}. ${q.question}`, 160);
    doc.text(splitTitle, 22, y + 16);

    // Answer Line
    y += 30;
    doc.setFillColor(COLORS.success[0], COLORS.success[1], COLORS.success[2]);
    doc.roundedRect(22, y, 160, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text(`CORRECT OPTION: ${q.answer} - ${q.options[q.answer as keyof typeof q.options]}`, 26, y + 5.5);

    y += 25;
  });

  doc.save('BrainWave_Answer_Key.pdf');
};

export const generateUserResultPDF = async (
  questions: Question[], 
  userAnswers: Record<number, string>, 
  score: number,
  userName: string
) => {
  const doc = jsPDF('p', 'mm', 'a4');
  let y = 20;

  // Background
  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, 210, 297, 'F');

  // Evaluation Header
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text('EVALUATION REPORT', 20, y);
  
  y += 12;
  doc.setFontSize(12);
  doc.setTextColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
  doc.text(`CANDIDATE: ${userName.toUpperCase()}`, 20, y);
  
  y += 15;
  // Score Card
  doc.setFillColor(COLORS.card[0], COLORS.card[1], COLORS.card[2]);
  doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2]);
  doc.roundedRect(20, y, 170, 30, 5, 5, 'FD');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.text(`${score.toFixed(1)}`, 105, y + 18, { align: 'center' });
  doc.setFontSize(9);
  doc.setTextColor(COLORS.textMuted[0], COLORS.textMuted[1], COLORS.textMuted[2]);
  doc.text('FINAL PERFORMANCE INDEX', 105, y + 25, { align: 'center' });

  y += 45;

  questions.forEach((q, i) => {
    const userAns = userAnswers[i];
    const isCorrect = userAns === q.answer;
    const isSkipped = !userAns;
    const statusColor = isSkipped ? COLORS.warning : isCorrect ? COLORS.success : COLORS.danger;
    const statusText = isSkipped ? 'SKIPPED' : isCorrect ? 'PERFECT' : 'FAULT';

    const cardH = 55;
    if (y + cardH > 280) {
      doc.addPage();
      doc.setFillColor(0, 0, 0);
      doc.rect(0, 0, 210, 297, 'F');
      y = 20;
    }

    drawGlassCard(doc, 15, y, 180, cardH, statusColor);
    
    // Category & Status
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.setFontSize(8);
    doc.text(`${q.category.toUpperCase()} // ${statusText}`, 22, y + 8);

    // Question
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    const splitQ = doc.splitTextToSize(`Q${i+1}. ${q.question}`, 160);
    doc.text(splitQ, 22, y + 18);

    // User Selection
    y += 32;
    doc.setDrawColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.roundedRect(22, y, 160, 8, 1, 1, 'D');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    const userAnsText = userAns ? `${userAns} - ${q.options[userAns as keyof typeof q.options]}` : 'NONE';
    doc.text(`YOUR SELECTION: ${userAnsText}`, 26, y + 5.5);

    // Correct Answer
    y += 10;
    doc.setFillColor(COLORS.success[0], COLORS.success[1], COLORS.success[2]);
    doc.roundedRect(22, y, 160, 8, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text(`VALIDATED ANSWER: ${q.answer} - ${q.options[q.answer as keyof typeof q.options]}`, 26, y + 5.5);

    y += 20;
  });

  doc.save(`${userName.replace(/\s+/g, '_')}_Evaluation.pdf`);
};

export const generateSampleQuizPDF = () => {
  const doc = jsPDF('p', 'mm', 'a4');
  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, 210, 297, 'F');
  
  doc.setTextColor(COLORS.accentBlue[0], COLORS.accentBlue[1], COLORS.accentBlue[2]);
  doc.setFontSize(22);
  doc.text('BrainWave Sample Format', 20, 30);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text('This template demonstrates the preferred layout for question ingestion.', 20, 45);

  const samples = [
    { q: "What is the capital of France?", a: "B", opts: "A) London, B) Paris, C) Berlin" },
    { q: "What is 5 + 5?", a: "C", opts: "A) 8, B) 9, C) 10" }
  ];

  let y = 60;
  samples.forEach((s, i) => {
    doc.setFillColor(20, 20, 20);
    doc.roundedRect(20, y, 170, 30, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text(`${i+1}. ${s.q}`, 25, y + 10);
    doc.setTextColor(150, 150, 150);
    doc.text(s.opts, 25, y + 18);
    doc.setTextColor(COLORS.success[0], COLORS.success[1], COLORS.success[2]);
    doc.text(`Answer: ${s.a}`, 25, y + 25);
    y += 40;
  });

  doc.save('BrainWave_Sample_Quiz.pdf');
};
