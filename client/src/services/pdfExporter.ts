import jsPDF from 'jspdf';
import { SavedNote } from '../types';

export function exportNotesToPdf(note: SavedNote) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Title & Header (EventLooped style header banner)
  doc.setFillColor(37, 99, 235); // Blue 600
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('MentorVoice — AI English Speaking Coach', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Lesson Summary: ${note.title}`, 14, 20);

  y = 38;

  // Metadata block
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Session Details:', 14, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Date: ${note.date}   |   Mode: ${note.modeTitle}   |   CEFR Score: ${note.cefrLevel}   |   Cadence: ${note.speakingSpeedWpm} WPM`, 14, y);
  y += 10;

  // Overview
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Session Overview & Recap:', 14, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const overviewLines = doc.splitTextToSize(note.overview, pageWidth - 28);
  doc.text(overviewLines, 14, y);
  y += overviewLines.length * 5 + 6;

  // Grammar Diagnostics
  if (note.grammarFeedback && note.grammarFeedback.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Grammar Corrections & Explanations:', 14, y);
    y += 6;

    note.grammarFeedback.forEach((item, idx) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(225, 29, 72); // Rose 600
      doc.text(`${idx + 1}. Original: "${item.original}"`, 16, y);
      y += 5;

      doc.setTextColor(5, 150, 105); // Emerald 600
      doc.text(`   Corrected: "${item.correction}"`, 16, y);
      y += 5;

      doc.setTextColor(100, 116, 139); // Slate 500
      const tipLines = doc.splitTextToSize(`   Rule: ${item.explanation}`, pageWidth - 32);
      doc.text(tipLines, 16, y);
      y += tipLines.length * 5 + 4;
    });
  }

  // Natural Alternatives
  if (note.naturalAlternatives && note.naturalAlternatives.length > 0) {
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Native Phrasing Alternatives:', 14, y);
    y += 6;

    note.naturalAlternatives.forEach((alt, idx) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text(`${idx + 1}. Said: "${alt.learnerSaid}"`, 16, y);
      y += 5;
      doc.setTextColor(37, 99, 235); // Blue 600
      doc.text(`   Native Upgrade: "${alt.betterAlternative}"`, 16, y);
      y += 6;
    });
  }

  // Highlighted Vocabulary
  if (note.newVocabulary && note.newVocabulary.length > 0) {
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Key Vocabulary Highlighted:', 14, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text(note.newVocabulary.join('  •  '), 16, y);
    y += 10;
  }

  // Personal Notes
  if (note.userNotes) {
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Learner Self-Reflection:', 14, y);
    y += 6;

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    const userNotesLines = doc.splitTextToSize(`"${note.userNotes}"`, pageWidth - 28);
    doc.text(userNotesLines, 14, y);
  }

  doc.save(`MentorVoice-${note.title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
}
