/**
 * Certificate Template Configuration
 * 
 * Berisi konfigurasi default untuk berbagai template sertifikat.
 * Dapat disesuaikan per webinar untuk mendapatkan positioning yang tepat.
 */

export interface CertificatePosition {
    /**
     * Y coordinate dalam percentage dari total height
     * Contoh: 0.72 = 72% dari top (PDF coordinate system)
     */
    yPercent: number
    
    /**
     * Font size dalam points
     */
    fontSize: number
    
    /**
     * Text color dalam RGB [0-1]
     * Default: [1,1,1] = White
     */
    color?: [number, number, number]
    
    /**
     * Shadow offset untuk better readability
     */
    shadowOffset?: number
    
    /**
     * Bold text?
     */
    bold?: boolean
}

export interface CertificateConfig {
    /** ID webinar */
    webinarId: number
    
    /** Template type */
    templateType: 'pdf' | 'image' | 'docx'
    
    /** Page dimensions */
    dimensions?: {
        width: number
        height: number
    }
    
    /** Positioning untuk setiap field */
    positions: {
        nomor: CertificatePosition
        nama: CertificatePosition
        nip: CertificatePosition
        opd: CertificatePosition
    }
}

/**
 * Default configuration untuk template standar A4 Landscape (842x595)
 * 
 * Y-coordinates: PDF uses bottom-left origin
 * - 0.72 = ~427px dari bottom = upper area
 * - 0.52 = ~310px dari bottom = middle area
 * - 0.45 = ~268px dari bottom = lower-middle area
 * - 0.40 = ~238px dari bottom = lower area
 */
export const defaultCertificateConfig: Omit<CertificateConfig, 'webinarId'> = {
    templateType: 'image',
    dimensions: {
        width: 842,
        height: 595
    },
    positions: {
        nomor: {
            yPercent: 0.72,
            fontSize: 10,
            color: [1, 1, 1],
            shadowOffset: 1,
            bold: false
        },
        nama: {
            yPercent: 0.52,
            fontSize: 22,
            color: [1, 1, 1],
            shadowOffset: 1,
            bold: true
        },
        nip: {
            yPercent: 0.45,
            fontSize: 12,
            color: [1, 1, 1],
            shadowOffset: 0.5,
            bold: false
        },
        opd: {
            yPercent: 0.40,
            fontSize: 12,
            color: [1, 1, 1],
            shadowOffset: 0.5,
            bold: false
        }
    }
}

/**
 * Template configurations untuk berbagai template types
 * Key = webinar_id atau template_filename
 * 
 * Tambahkan custom configuration disini untuk webinar tertentu
 */
export const templateConfigs: Record<string, Partial<CertificateConfig>> = {
    // Contoh: Custom config untuk webinar tertentu
    // 'webinar-123': {
    //     positions: {
    //         nomor: { yPercent: 0.70, fontSize: 11, ... },
    //         nama: { yPercent: 0.50, fontSize: 24, ... },
    //         ...
    //     }
    // },
    
    // Jika template memiliki dark background, gunakan warna text yang lebih terang
    // 'dark-template': {
    //     positions: {
    //         nama: {
    //             yPercent: 0.52,
    //             fontSize: 22,
    //             color: [1, 1, 1], // White
    //             shadowOffset: 2,  // Lebih besar shadow untuk dark bg
    //             bold: true
    //         }
    //     }
    // }
}

/**
 * Get certificate configuration untuk specific template
 * 
 * @param webinarId - ID webinar
 * @param templateName - Nama template file (opsional)
 * @returns Merged configuration (custom + default)
 */
export function getCertificateConfig(
    webinarId: number,
    templateName?: string
): CertificateConfig {
    // Cek custom config dulu
    const customKey = templateName || String(webinarId)
    const custom = templateConfigs[customKey]
    
    // Merge dengan default
    return {
        webinarId,
        templateType: custom?.templateType || defaultCertificateConfig.templateType as 'pdf' | 'image' | 'docx',
        dimensions: custom?.dimensions || defaultCertificateConfig.dimensions,
        positions: {
            nomor: { ...defaultCertificateConfig.positions.nomor, ...custom?.positions?.nomor },
            nama: { ...defaultCertificateConfig.positions.nama, ...custom?.positions?.nama },
            nip: { ...defaultCertificateConfig.positions.nip, ...custom?.positions?.nip },
            opd: { ...defaultCertificateConfig.positions.opd, ...custom?.positions?.opd }
        }
    }
}

/**
 * Validate positioning untuk memastikan tidak out of bounds
 */
export function validatePositioning(config: CertificateConfig): string[] {
    const errors: string[] = []
    
    Object.entries(config.positions).forEach(([field, pos]) => {
        if (pos.yPercent < 0 || pos.yPercent > 1) {
            errors.push(`${field}: yPercent harus antara 0 dan 1 (current: ${pos.yPercent})`)
        }
        if (pos.fontSize < 8 || pos.fontSize > 72) {
            errors.push(`${field}: fontSize harus antara 8 dan 72 (current: ${pos.fontSize})`)
        }
    })
    
    return errors
}
