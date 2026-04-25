// This logic is identical to the textFormatter.ts but runs in a background thread
// to keep the UI smooth during massive text pastes.

self.onmessage = (e: MessageEvent) => {
  const { text } = e.data;
  if (!text) {
    self.postMessage({ formatted: '', count: 0 });
    return;
  }

  let cleanText = text.replace(/\r\n/g, '\n').replace(/\s+/g, ' ').trim();
  cleanText = cleanText.replace(/\b([A-D])[)\.]\s+/g, '\n[OPT]$1) ');
  cleanText = cleanText.replace(/\b(Answer:\s*[A-D])/gi, '\n[ANS]$1\n[END_BLOCK]\n');

  const rawBlocks = cleanText.split('[END_BLOCK]').map((b: string) => b.trim()).filter((b: string) => b !== '');
  
  const formattedBlocks: string[] = [];
  let currentQuestionNumber = 1;

  rawBlocks.forEach((block: string) => {
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

  self.postMessage({
    formatted: formattedBlocks.join('\n\n'),
    count: formattedBlocks.length
  });
};
