import { ECUADOR_TAX_RATES } from "@shared/schema";

// Servicio de integración con SRI Ecuador
export class SRIService {
  private static instance: SRIService;
  private baseUrl = "https://srienlinea.sri.gob.ec/sri-en-linea/SriRucWeb/ConsultaRuc";
  
  public static getInstance(): SRIService {
    if (!SRIService.instance) {
      SRIService.instance = new SRIService();
    }
    return SRIService.instance;
  }

  // Validación de RUC/CI en tiempo real
  async validateRucCi(identifier: string): Promise<{
    valid: boolean;
    data?: {
      ruc: string;
      razonSocial: string;
      estado: string;
      clase: string;
      tipoContribuyente: string;
      fechaInicio: string;
      fechaReinicio?: string;
      actividadEconomica: string;
      direccion: string;
    };
    error?: string;
  }> {
    try {
      // Validación básica del formato
      if (!this.isValidRucFormat(identifier)) {
        return {
          valid: false,
          error: "Formato de RUC/CI inválido"
        };
      }

      // Simulación de consulta al SRI (en producción usar API real)
      const isValid = this.validateRucCheckDigit(identifier);
      
      if (isValid) {
        return {
          valid: true,
          data: {
            ruc: identifier,
            razonSocial: this.generateMockName(identifier),
            estado: "ACTIVO",
            clase: "CONTRIBUYENTE ESPECIAL",
            tipoContribuyente: "SOCIEDAD",
            fechaInicio: "2020-01-01",
            actividadEconomica: "ACTIVIDADES DE CONTABILIDAD",
            direccion: "GUAYAQUIL, ECUADOR"
          }
        };
      } else {
        return {
          valid: false,
          error: "RUC/CI no válido según algoritmo de verificación"
        };
      }
    } catch (error) {
      return {
        valid: false,
        error: `Error en validación: ${error instanceof Error ? error.message : "Error desconocido"}`
      };
    }
  }

  // Generar XML para comprobantes electrónicos
  generateElectronicVoucherXML(data: {
    tipoComprobante: string;
    secuencial: string;
    fechaEmision: string;
    razonSocialEmisor: string;
    rucEmisor: string;
    dirEstablecimiento: string;
    razonSocialComprador: string;
    identificacionComprador: string;
    subtotal: number;
    iva: number;
    total: number;
    items: Array<{
      descripcion: string;
      cantidad: number;
      precioUnitario: number;
      descuento: number;
      subtotal: number;
    }>;
  }): string {
    const claveAcceso = this.generateAccessKey(data);
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<factura id="comprobante" version="2.1.0">
  <infoTributaria>
    <ambiente>${ECUADOR_TAX_RATES.SRI.AMBIENTE_PRUEBAS}</ambiente>
    <tipoEmision>1</tipoEmision>
    <razonSocial>${data.razonSocialEmisor}</razonSocial>
    <nombreComercial>${data.razonSocialEmisor}</nombreComercial>
    <ruc>${data.rucEmisor}</ruc>
    <claveAcceso>${claveAcceso}</claveAcceso>
    <codDoc>${data.tipoComprobante}</codDoc>
    <estab>001</estab>
    <ptoEmi>001</ptoEmi>
    <secuencial>${data.secuencial.padStart(9, '0')}</secuencial>
    <dirMatriz>${data.dirEstablecimiento}</dirMatriz>
    <regimenMicroempresas>NO</regimenMicroempresas>
  </infoTributaria>
  <infoFactura>
    <fechaEmision>${data.fechaEmision}</fechaEmision>
    <dirEstablecimiento>${data.dirEstablecimiento}</dirEstablecimiento>
    <obligadoContabilidad>SI</obligadoContabilidad>
    <tipoIdentificacionComprador>04</tipoIdentificacionComprador>
    <razonSocialComprador>${data.razonSocialComprador}</razonSocialComprador>
    <identificacionComprador>${data.identificacionComprador}</identificacionComprador>
    <totalSinImpuestos>${data.subtotal.toFixed(2)}</totalSinImpuestos>
    <totalDescuento>0.00</totalDescuento>
    <totalConImpuestos>
      <totalImpuesto>
        <codigo>2</codigo>
        <codigoPorcentaje>2</codigoPorcentaje>
        <baseImponible>${data.subtotal.toFixed(2)}</baseImponible>
        <valor>${data.iva.toFixed(2)}</valor>
      </totalImpuesto>
    </totalConImpuestos>
    <importeTotal>${data.total.toFixed(2)}</importeTotal>
    <moneda>DOLAR</moneda>
  </infoFactura>
  <detalles>
    ${data.items.map(item => `
    <detalle>
      <codigoPrincipal>PROD${Math.random().toString(36).substring(7).toUpperCase()}</codigoPrincipal>
      <descripcion>${item.descripcion}</descripcion>
      <cantidad>${item.cantidad.toFixed(2)}</cantidad>
      <precioUnitario>${item.precioUnitario.toFixed(6)}</precioUnitario>
      <descuento>${item.descuento.toFixed(2)}</descuento>
      <precioTotalSinImpuesto>${item.subtotal.toFixed(2)}</precioTotalSinImpuesto>
      <impuestos>
        <impuesto>
          <codigo>2</codigo>
          <codigoPorcentaje>2</codigoPorcentaje>
          <tarifa>${ECUADOR_TAX_RATES.IVA.GENERAL}</tarifa>
          <baseImponible>${item.subtotal.toFixed(2)}</baseImponible>
          <valor>${(item.subtotal * ECUADOR_TAX_RATES.IVA.GENERAL / 100).toFixed(2)}</valor>
        </impuesto>
      </impuestos>
    </detalle>
    `).join('')}
  </detalles>
  <infoAdicional>
    <campoAdicional nombre="SISTEMA">Sistema Contable Pro - Ecuador 2024</campoAdicional>
  </infoAdicional>
</factura>`;
  }

  // Cálculo automático de retenciones
  calculateRetentions(data: {
    baseAmount: number;
    type: 'renta' | 'iva';
    concept: string;
    supplierType: 'persona_natural' | 'sociedad';
  }): {
    percentage: number;
    retentionAmount: number;
    concept: string;
    legalBase: string;
  } {
    let percentage = 0;
    let legalBase = "";

    if (data.type === 'renta') {
      switch (data.concept) {
        case 'bienes':
          percentage = ECUADOR_TAX_RATES.RETENCIONES.RENTA.BIENES;
          legalBase = "Art. 45 LORTI";
          break;
        case 'servicios':
          percentage = ECUADOR_TAX_RATES.RETENCIONES.RENTA.SERVICIOS;
          legalBase = "Art. 45 LORTI";
          break;
        case 'arrendamientos':
          percentage = ECUADOR_TAX_RATES.RETENCIONES.RENTA.ARRENDAMIENTOS;
          legalBase = "Art. 45 LORTI";
          break;
        case 'honorarios':
          percentage = ECUADOR_TAX_RATES.RETENCIONES.RENTA.HONORARIOS;
          legalBase = "Art. 45 LORTI";
          break;
        default:
          percentage = ECUADOR_TAX_RATES.RETENCIONES.RENTA.OTROS_SERVICIOS;
          legalBase = "Art. 45 LORTI";
      }
    } else if (data.type === 'iva') {
      switch (data.concept) {
        case 'bienes':
          percentage = ECUADOR_TAX_RATES.RETENCIONES.IVA.BIENES;
          legalBase = "Art. 63 LIV";
          break;
        case 'servicios':
          percentage = ECUADOR_TAX_RATES.RETENCIONES.IVA.SERVICIOS;
          legalBase = "Art. 63 LIV";
          break;
        case 'servicios_profesionales':
          percentage = ECUADOR_TAX_RATES.RETENCIONES.IVA.SERVICIOS_PROFESIONALES;
          legalBase = "Art. 63 LIV";
          break;
        default:
          percentage = ECUADOR_TAX_RATES.RETENCIONES.IVA.SERVICIOS;
          legalBase = "Art. 63 LIV";
      }
    }

    const retentionAmount = (data.baseAmount * percentage) / 100;

    return {
      percentage,
      retentionAmount: Number(retentionAmount.toFixed(2)),
      concept: data.concept,
      legalBase
    };
  }

  // Cálculo de impuesto a la renta según tabla progresiva
  calculateIncomeTax(annualIncome: number): {
    totalTax: number;
    marginalRate: number;
    bracket: any;
  } {
    const brackets = ECUADOR_TAX_RATES.IMPUESTO_RENTA.TRAMOS;
    
    for (const bracket of brackets) {
      if (annualIncome >= bracket.desde && annualIncome <= bracket.hasta) {
        const exceso = annualIncome - bracket.desde;
        const impuestoExceso = (exceso * bracket.porcentaje) / 100;
        const totalTax = impuestoExceso + bracket.deduccion;
        
        return {
          totalTax: Number(totalTax.toFixed(2)),
          marginalRate: bracket.porcentaje,
          bracket
        };
      }
    }

    // Si no encuentra bracket (caso extremo)
    const lastBracket = brackets[brackets.length - 1];
    const exceso = annualIncome - lastBracket.desde;
    const impuestoExceso = (exceso * lastBracket.porcentaje) / 100;
    const totalTax = impuestoExceso + lastBracket.deduccion;

    return {
      totalTax: Number(totalTax.toFixed(2)),
      marginalRate: lastBracket.porcentaje,
      bracket: lastBracket
    };
  }

  private isValidRucFormat(ruc: string): boolean {
    return /^\d{10}$/.test(ruc) || /^\d{13}$/.test(ruc);
  }

  private validateRucCheckDigit(ruc: string): boolean {
    if (ruc.length === 10) {
      return this.validateCedulaCheckDigit(ruc);
    } else if (ruc.length === 13) {
      return this.validateRucCheckDigit13(ruc);
    }
    return false;
  }

  private validateCedulaCheckDigit(cedula: string): boolean {
    const digits = cedula.split('').map(Number);
    const checkDigit = digits[9];
    const provinceCode = digits[0] * 10 + digits[1];
    
    if (provinceCode < 1 || provinceCode > 24) return false;
    
    const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let sum = 0;
    
    for (let i = 0; i < 9; i++) {
      let product = digits[i] * coefficients[i];
      if (product >= 10) product -= 9;
      sum += product;
    }
    
    const calculatedDigit = sum % 10 === 0 ? 0 : 10 - (sum % 10);
    return calculatedDigit === checkDigit;
  }

  private validateRucCheckDigit13(ruc: string): boolean {
    const digits = ruc.split('').map(Number);
    const thirdDigit = digits[2];
    
    if (thirdDigit !== 9) return false;
    
    const cedula = ruc.substring(0, 10);
    return this.validateCedulaCheckDigit(cedula);
  }

  private generateAccessKey(data: any): string {
    const fecha = data.fechaEmision.replace(/-/g, '');
    const ambiente = ECUADOR_TAX_RATES.SRI.AMBIENTE_PRUEBAS.toString();
    const serie = "001001";
    const secuencial = data.secuencial.padStart(9, '0');
    const codigo = Math.floor(Math.random() * 99999999).toString().padStart(8, '0');
    const tipoEmision = "1";
    
    const base = fecha + data.tipoComprobante + data.rucEmisor + ambiente + serie + secuencial + codigo + tipoEmision;
    const checkDigit = this.calculateModule11(base);
    
    return base + checkDigit;
  }

  private calculateModule11(code: string): string {
    const digits = code.split('').map(Number);
    const coefficients = [2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7];
    
    let sum = 0;
    for (let i = 0; i < digits.length; i++) {
      sum += digits[i] * coefficients[i];
    }
    
    const remainder = sum % 11;
    const checkDigit = remainder === 0 ? 0 : remainder === 1 ? 1 : 11 - remainder;
    
    return checkDigit.toString();
  }

  private generateMockName(ruc: string): string {
    const empresas = [
      "COMERCIAL DEL PACIFICO S.A.",
      "DISTRIBUIDORA NACIONAL LTDA",
      "INDUSTRIAS ECUATORIANAS CIA",
      "SERVICIOS PROFESIONALES S.A.",
      "IMPORTADORA GUAYAQUIL LTDA"
    ];
    
    const index = parseInt(ruc.substring(0, 2)) % empresas.length;
    return empresas[index];
  }
}

export const sriService = SRIService.getInstance();