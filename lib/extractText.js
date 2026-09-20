// lib/extractText.js — pulls plain text out of an uploaded PDF, DOCX, or TXT file
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

async function extractText(buffer, originalName) {
  const ext = path.extname(originalName).toLowerCase();

  if (ext === '.pdf') {
    const { text } = await pdfParse(buffer);
    return text;
  }

  if (ext === '.docx') {
    const { value } = await mammoth.extractRawText({ buffer });
    return value;
  }

  if (ext === '.txt') {
    return buffer.toString('utf8');
  }

  throw new Error(`Unsupported file type: ${ext}. Please upload a .pdf, .docx, or .txt file.`);
}

module.exports = extractText;
