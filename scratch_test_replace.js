const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

function prepareXmlForTemplating(xmlText) {
    let cleaned = xmlText
        .replace(/<w:proofErr[^/]*\/>/g, '')
        .replace(/<w:noProof\s*\/>/g, '')
        .replace(/<w:noProof>[^<]*<\/w:noProof>/g, '')

    // Step 2: Merge split curly-brace style {tag} -> {tag}
    cleaned = cleaned.replace(/(\{)([^{}]+)(\})/g, (match, open, content, close) => {
        if (content.includes('<') && content.includes('>')) {
            const plainText = content.replace(/<[^>]+>/g, '').trim()
            return `{${plainText}}`
        }
        return match
    })

    return cleaned
}

const uploadsDir = path.join(__dirname, 'public', 'uploads', 'webinars');
const docxFiles = fs.readdirSync(uploadsDir).filter(f => f.endsWith('.docx'));

console.log('Found DOCX files:', docxFiles);

docxFiles.forEach(file => {
    try {
        console.log(`\n=================== TESTING FILE: ${file} ===================`);
        const filePath = path.join(uploadsDir, file);
        const templateBytes = fs.readFileSync(filePath);
        
        const zip = new PizZip(templateBytes);
        
        // Show raw and processed document.xml snippet
        const docXml = zip.file('word/document.xml');
        if (docXml) {
            const rawText = docXml.asText();
            console.log('--- Raw document.xml placeholders detection ---');
            const rawPlaceholders = rawText.match(/{[^{}]+}/g) || [];
            console.log('Placeholders found in raw XML:', rawPlaceholders);

            const processedText = prepareXmlForTemplating(rawText);
            console.log('--- Processed document.xml placeholders detection ---');
            const processedPlaceholders = processedText.match(/{[^{}]+}/g) || [];
            console.log('Placeholders found in processed XML:', processedPlaceholders);
            
            // Apply templating
            zip.file('word/document.xml', processedText);
            const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
            
            const testData = {
                nama: 'TEST NAMA USER',
                nip: 'NIP. 1999123456789',
                opd: 'TEST OPD / INSTANSI',
                nomor: '999/TEST-NOMOR/2026',
                nomer: '999/TEST-NOMOR/2026',
                name: 'TEST NAMA USER',
                date: '20-05-2026'
            };
            
            doc.render(testData);
            
            const outputBuffer = doc.getZip().generate({ type: 'nodebuffer' });
            
            // Check if the rendered text contains the test values
            const outputZip = new PizZip(outputBuffer);
            const outputXml = outputZip.file('word/document.xml').asText();
            
            console.log('--- Rendering verification ---');
            console.log('Contains TEST NAMA USER:', outputXml.includes('TEST NAMA USER'));
            console.log('Contains TEST OPD / INSTANSI:', outputXml.includes('TEST OPD / INSTANSI'));
            console.log('Contains 999/TEST-NOMOR/2026:', outputXml.includes('999/TEST-NOMOR/2026'));
            
            if (!outputXml.includes('TEST NAMA USER')) {
                console.log('Snippet of outputXml around first 1000 chars:');
                console.log(outputXml.substring(0, 1000));
            }
        }
    } catch (err) {
        console.error(`Error processing ${file}:`, err.message);
    }
});
