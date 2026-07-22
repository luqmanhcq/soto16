/**
 * Certificate Positioning Debugger Utility
 * 
 * Membantu debug dan troubleshoot positioning issue pada generated certificates.
 * 
 * Usage:
 * 1. Check server logs: grep "[Sertifikat Text]" logs
 * 2. Run debugger script untuk validate positioning
 * 3. Adjust config di certificate-config.ts jika perlu
 */

import { getCertificateConfig, validatePositioning } from '../config/certificate-config'

/**
 * Analyze certificate positioning untuk specific webinar
 * 
 * @param webinarId - ID webinar
 * @param templateName - Nama template (optional)
 * @returns Analysis report
 */
export function analyzeCertificatePositioning(
    webinarId: number,
    templateName?: string,
    pageHeight: number = 595
) {
    const config = getCertificateConfig(webinarId, templateName)
    const errors = validatePositioning(config)

    const analysis = {
        webinarId,
        template: templateName || 'default',
        pageHeight,
        pageWidth: config.dimensions?.width || 842,
        validation: {
            isValid: errors.length === 0,
            errors
        },
        positions: Object.entries(config.positions).map(([field, pos]) => ({
            field,
            yPercent: pos.yPercent,
            yPixels: Math.round(pos.yPercent * pageHeight),
            fontSize: pos.fontSize,
            color: pos.color ? `rgb(${pos.color.join(',')})` : 'rgb(1,1,1)',
            shadow: pos.shadowOffset ? `offset ${pos.shadowOffset}px` : 'none',
            bold: pos.bold ? 'yes' : 'no'
        }))
    }

    return analysis
}

/**
 * Generate visual representation of text positioning
 * Helpful untuk understand layout tanpa melihat actual PDF
 * 
 * ASCII art visualization:
 */
export function visualizePositioning(
    webinarId: number,
    templateName?: string,
    pageHeight: number = 595
) {
    const analysis = analyzeCertificatePositioning(webinarId, templateName, pageHeight)

    const lines = new Array(Math.ceil(pageHeight / 10)).fill('').map((_, i) => ({
        y: i * 10,
        content: ' '.repeat(80)
    }))

    // Create visual
    let visual = '╔' + '═'.repeat(82) + '╗\n'
    visual += '║ CERTIFICATE POSITIONING VISUALIZATION\n'
    visual += '║ WebinarID: ' + webinarId + ' | Template: ' + (templateName || 'default') + '\n'
    visual += '╠' + '═'.repeat(82) + '╣\n'

    analysis.positions.forEach(pos => {
        const lineIndex = Math.floor(pos.yPixels / 10)
        const marker = `[${pos.field.toUpperCase().padEnd(5)}] ${pos.fontSize}pt`
        visual += `║ ${pos.yPercent * 100}%: ${marker.padEnd(30)} | Y=${pos.yPixels}px\n`
    })

    visual += '╚' + '═'.repeat(82) + '╝\n'

    return visual
}

/**
 * Compare positioning antara default dan custom config
 */
export function compareConfigurations(
    webinarId: number,
    customTemplate?: string
) {
    const defaultConfig = getCertificateConfig(webinarId)
    const customConfig = getCertificateConfig(webinarId, customTemplate)

    const comparison = Object.keys(defaultConfig.positions).map(field => ({
        field,
        default: {
            y: (defaultConfig.positions[field as keyof typeof defaultConfig.positions].yPercent * 100).toFixed(1) + '%',
            size: defaultConfig.positions[field as keyof typeof defaultConfig.positions].fontSize
        },
        custom: {
            y: (customConfig.positions[field as keyof typeof customConfig.positions].yPercent * 100).toFixed(1) + '%',
            size: customConfig.positions[field as keyof typeof customConfig.positions].fontSize
        }
    }))

    return comparison
}

/**
 * Get recommendations untuk fixing positioning issues
 */
export function getPositioningRecommendations(
    webinarId: number,
    issue: 'text-too-high' | 'text-too-low' | 'text-invisible' | 'text-cut-off'
): string[] {
    const recommendations: Record<string, string[]> = {
        'text-too-high': [
            'Decrease yPercent value (move text down)',
            'Example: change yPercent from 0.52 to 0.48',
            'Smaller increment = smaller movement'
        ],
        'text-too-low': [
            'Increase yPercent value (move text up)',
            'Example: change yPercent from 0.52 to 0.56',
            'Larger increment = larger movement'
        ],
        'text-invisible': [
            'Warna sudah white (1,1,1) - verify template memiliki area kosong',
            'Increase shadowOffset untuk better contrast',
            'Check console logs: grep "[Sertifikat Text]" untuk verify positioning',
            'Jika masih invisible, check template image directly'
        ],
        'text-cut-off': [
            'Decrease fontSize untuk teks yang cut off',
            'Move text dengan adjust yPercent',
            'Verify page dimensions match template size'
        ]
    }

    return recommendations[issue] || []
}

/**
 * Troubleshooting guide
 */
export const troubleshootingGuide = `
CERTIFICATE TEXT VISIBILITY TROUBLESHOOTING GUIDE
═════════════════════════════════════════════════

1. TEXT NOT VISIBLE AT ALL
   └─ Check: 
      • Is text white? (should be rgb(1,1,1))
      • Check server logs: grep "[Sertifikat Text]"
      • Verify Y coordinate matches template layout
      • Try ?refresh=1 to force regenerate

2. TEXT POSITIONED WRONG (too high/low/left/right)
   └─ Check:
      • Server logs show actual positioning
      • Compare with visual template layout
      • Adjust yPercent in certificate-config.ts
      • Force regenerate with ?refresh=1

3. TEXT PARTIALLY CUT OFF
   └─ Check:
      • fontSize too large? Try reduce by 2-4pt
      • y position too close to edge? Adjust yPercent
      • Page dimensions match template size?

4. SHADOW NOT VISIBLE
   └─ Check:
      • shadowOffset value (try 1-3 pixels)
      • Shadow color contrasts with background
      • Template has sufficient white space

5. FONT NOT RENDERING
   └─ Check:
      • Helvetica is standard PDF font (should always work)
      • widthOfTextAtSize calculation correct
      • Text not empty or null

DIAGNOSTIC COMMANDS:
───────────────────
# Force regenerate certificate
GET /api/webinar/{id}/sertifikat/pdf?refresh=1

# Check server logs for positioning
grep "[Sertifikat Text]" /logs/server.log

# Analyze positioning
import { analyzeCertificatePositioning } from 'lib/utils/certificate-debugger'
console.log(analyzeCertificatePositioning(123))

ADJUSTMENT FORMULA:
──────────────────
New Y = Current Y ± ΔPercent
Where ΔPercent = movement / pageHeight

Example: Move text down 20px
ΔPercent = 20 / 595 ≈ 0.034 (3.4%)
New yPercent = 0.52 - 0.034 = 0.486
`

export default {
    analyzeCertificatePositioning,
    visualizePositioning,
    compareConfigurations,
    getPositioningRecommendations,
    troubleshootingGuide
}
