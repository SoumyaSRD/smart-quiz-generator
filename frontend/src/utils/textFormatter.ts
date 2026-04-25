/**
 * Formats MCQ text by:
 * 1. Collapsing multiple spaces/newlines into a clean single structure.
 * 2. Ensuring the 'Answer: X' line has a clean newline before it.
 * 3. Removing leading numbers from the question text for a cleaner UI.
 */
export const formatMcqText = (text: string): string => {
  if (!text) return '';

  // 1. Initial cleanup: normalize whitespace
  let cleanText = text.replace(/\r\n/g, '\n').replace(/\s+/g, ' ').trim();

  // 2. Identify and mark key components
  // Mark options (A, B, C, D)
  cleanText = cleanText.replace(/\b([A-D])[)\.]\s+/g, '\n[OPT]$1) ');
  
  // Mark answers and add a unique block terminator
  cleanText = cleanText.replace(/\b(Answer:\s*[A-D])/gi, '\n[ANS]$1\n[END_BLOCK]\n');

  // 3. Split by the block terminator
  const rawBlocks = cleanText.split('[END_BLOCK]').map(b => b.trim()).filter(b => b !== '');
  
  const formattedBlocks: string[] = [];
  let currentQuestionNumber = 1;

  rawBlocks.forEach((block) => {
    const lines = block.split('\n').map(l => l.trim()).filter(l => l !== '');
    if (lines.length === 0) return;

    let questionText = '';
    const options: string[] = [];
    let answerText = '';

    lines.forEach(line => {
      if (line.startsWith('[OPT]')) {
        options.push(line.replace('[OPT]', ''));
      } else if (line.startsWith('[ANS]')) {
        answerText = line.replace('[ANS]', '');
      } else {
        // Remove existing numbers and gather question text
        const cleanLine = line.replace(/^\d+[\s\.)]*/, '').trim();
        if (cleanLine) {
          questionText += (questionText ? ' ' : '') + cleanLine;
        }
      }
    });

    if (questionText || options.length > 0) {
      let reconstructed = `${currentQuestionNumber}. ${questionText}\n`;
      if (options.length > 0) reconstructed += options.join('\n') + '\n';
      if (answerText) reconstructed += answerText;
      
      formattedBlocks.push(reconstructed.trim());
      currentQuestionNumber++;
    }
  });

  return formattedBlocks.join('\n\n');
};

/**
 * Validates if the text block contains at least one valid MCQ pattern.
 */
export const isValidMcqFormat = (text: string): boolean => {
  const pattern = /[A-D][.)\]]/i;
  const hasAnswer = /Answer:/i.test(text);
  return pattern.test(text) && hasAnswer;
};
