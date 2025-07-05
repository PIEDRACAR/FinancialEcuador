// Utilidades para exportación de datos en múltiples formatos

export interface ExportData {
  filename: string;
  data: any[];
  headers: string[];
  title?: string;
  subtitle?: string;
}

export const generatePDF = (exportData: ExportData): void => {
  const { filename, data, headers, title, subtitle } = exportData;
  
  // Generar contenido HTML para PDF
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title || 'Reporte'}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 20px;
          font-size: 12px;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #003d82;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #003d82;
          margin: 0;
          font-size: 24px;
        }
        .header h2 {
          color: #666;
          margin: 5px 0;
          font-size: 16px;
          font-weight: normal;
        }
        .date {
          text-align: right;
          margin-bottom: 20px;
          color: #666;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #003d82;
          color: white;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          color: #666;
          font-size: 10px;
          border-top: 1px solid #ddd;
          padding-top: 10px;
        }
        .summary {
          background-color: #f0f8ff;
          padding: 15px;
          border-radius: 5px;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Sistema Contable Pro</h1>
        <h2>${title || 'Reporte de Datos'}</h2>
        ${subtitle ? `<p>${subtitle}</p>` : ''}
      </div>
      
      <div class="date">
        Fecha de generación: ${new Date().toLocaleDateString('es-EC', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </div>
      
      <table>
        <thead>
          <tr>
            ${headers.map(header => `<th>${header}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>
              ${headers.map(header => `<td>${getNestedValue(row, header) || '-'}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="summary">
        <strong>Resumen:</strong><br>
        Total de registros: ${data.length}<br>
        Generado por: Sistema Contable Pro<br>
        Cumple con normativa ecuatoriana vigente 2024
      </div>
      
      <div class="footer">
        Sistema Contable Pro - Cumplimiento SRI Ecuador 2024<br>
        Este reporte ha sido generado automáticamente
      </div>
    </body>
    </html>
  `;

  // Crear blob y descargar
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.html`;
  link.click();
  URL.revokeObjectURL(url);
};

export const generateExcel = (exportData: ExportData): void => {
  const { filename, data, headers } = exportData;
  
  // Generar CSV con formato Excel-compatible
  const csvContent = [
    // BOM para UTF-8
    '\ufeff',
    // Headers
    headers.join(','),
    // Data rows
    ...data.map(row => 
      headers.map(header => {
        const value = getNestedValue(row, header);
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

export const generateJSON = (exportData: ExportData): void => {
  const { filename, data, title } = exportData;
  
  const jsonData = {
    metadata: {
      title: title || 'Exportación de datos',
      generatedAt: new Date().toISOString(),
      totalRecords: data.length,
      system: 'Sistema Contable Pro',
      compliance: 'SRI Ecuador 2024'
    },
    data: data
  };

  const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
};

export const generateXML = (exportData: ExportData): void => {
  const { filename, data, title, headers } = exportData;
  
  let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<export>
  <metadata>
    <title>${title || 'Exportación de datos'}</title>
    <generatedAt>${new Date().toISOString()}</generatedAt>
    <totalRecords>${data.length}</totalRecords>
    <system>Sistema Contable Pro</system>
    <compliance>SRI Ecuador 2024</compliance>
  </metadata>
  <records>
`;

  data.forEach((row, index) => {
    xmlContent += `    <record id="${index + 1}">\n`;
    headers.forEach(header => {
      const value = getNestedValue(row, header);
      const sanitizedHeader = header.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      xmlContent += `      <${sanitizedHeader}>${escapeXml(String(value || ''))}</${sanitizedHeader}>\n`;
    });
    xmlContent += `    </record>\n`;
  });

  xmlContent += `  </records>
</export>`;

  const blob = new Blob([xmlContent], { type: 'application/xml' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.xml`;
  link.click();
  URL.revokeObjectURL(link.href);
};

// Función para obtener valores anidados de objetos
const getNestedValue = (obj: any, path: string): any => {
  // Si el path contiene espacios, trata de mapear a propiedades del objeto
  const mapping: { [key: string]: string } = {
    'Código': 'code',
    'Nombre': 'name',
    'Fecha': 'date',
    'Total': 'total',
    'Estado': 'status',
    'Descripción': 'description',
    'Proveedor': 'supplier',
    'Cliente': 'client',
    'Número': 'number',
    'Subtotal': 'subtotal',
    'IVA': 'iva',
    'Precio': 'price',
    'Stock': 'stock',
    'Categoría': 'category'
  };

  const key = mapping[path] || path;
  
  return key.split('.').reduce((current, prop) => {
    return current && current[prop] !== undefined ? current[prop] : null;
  }, obj);
};

// Función para escapar XML
const escapeXml = (unsafe: string): string => {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
};

export const exportData = (data: any[], format: string, config: Partial<ExportData>): void => {
  const timestamp = new Date().toISOString().split('T')[0];
  const exportConfig: ExportData = {
    filename: `${config.filename || 'export'}_${timestamp}`,
    data,
    headers: config.headers || Object.keys(data[0] || {}),
    title: config.title,
    subtitle: config.subtitle
  };

  switch (format.toLowerCase()) {
    case 'pdf':
    case 'html':
      generatePDF(exportConfig);
      break;
    case 'excel':
    case 'csv':
      generateExcel(exportConfig);
      break;
    case 'json':
      generateJSON(exportConfig);
      break;
    case 'xml':
      generateXML(exportConfig);
      break;
    default:
      console.error('Formato de exportación no soportado:', format);
  }
};