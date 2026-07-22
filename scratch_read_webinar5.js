const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');

const dbUrl = 'postgresql://postgres:1453@localhost:5432/sisoto';

// Since we know the uploaded files in public/uploads/webinars:
const uploadsDir = path.join(__dirname, 'public', 'uploads', 'webinars');
const docxFiles = fs.readdirSync(uploadsDir).filter(f => f.endsWith('.docx'));

console.log('Available DOCX files:', docxFiles);

docxFiles.forEach(file => {
    const filePath = path.join(uploadsDir, file);
    const bytes = fs.readFileSync(filePath);
    const zip = new PizZip(bytes);
    const docXml = zip.file('word/document.xml');
    if (docXml) {
        const text = docXml.asText();
        console.log(`\n--- FILE: ${file} ---`);
        console.log(`Length: ${text.length}`);
        
        // Find all characters '{' and track their context (up to 40 characters before and after)
        let idx = -1;
        let matchCount = 0;
        while ((idx = text.indexOf('{', idx + 1)) !== -1) {
            matchCount++;
            const snippet = text.substring(Math.max(0, idx - 40), Math.min(text.length, idx + 40));
            console.log(`Match ${matchCount} at index ${idx}:`);
            console.log(`   snippet: [${snippet.replace(/\r?\n/g, ' ')}]`);
        }
    }
});
