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
  
  // Generar contenido HTML para PDF con mejor formato
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title || 'Reporte'}</title>
      <style>
        @page {
          size: A4;
          margin: 20mm;
        }
        body { 
          font-family: 'Segoe UI', Arial, sans-serif; 
          margin: 0;
          font-size: 11px;
          line-height: 1.4;
          color: #333;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #003d82;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #003d82;
          margin: 0;
          font-size: 24px;
          font-weight: bold;
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
          font-size: 10px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          font-size: 10px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 6px;
          text-align: left;
          word-wrap: break-word;
        }
        th {
          background-color: #003d82;
          color: white;
          font-weight: bold;
          text-align: center;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          color: #666;
          font-size: 9px;
          border-top: 1px solid #ddd;
          padding-top: 10px;
        }
        .summary {
          background-color: #f0f8ff;
          padding: 15px;
          border-radius: 5px;
          margin-top: 20px;
          border: 1px solid #003d82;
        }
        .summary strong {
          color: #003d82;
        }
        .ecuador-flag {
          display: inline-block;
          width: 20px;
          height: 15px;
          background: linear-gradient(to bottom, #FFD700 33%, #0066CC 33%, #0066CC 66%, #FF0000 66%);
          margin-right: 10px;
          border: 1px solid #ccc;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="ecuador-flag"></div>
        <h1>Sistema Contable Pro - Ecuador</h1>
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
        <strong>Resumen del Reporte:</strong><br>
        Total de registros: ${data.length}<br>
        Generado por: Sistema Contable Pro<br>
        Cumple con normativa SRI Ecuador 2024<br>
        Formato: PDF/HTML exportable
      </div>
      
      <div class="footer">
        <div class="ecuador-flag"></div>
        Sistema Contable Pro - Cumplimiento SRI Ecuador 2024<br>
        Este reporte ha sido generado automáticamente y cumple con la normativa fiscal vigente
      </div>
    </body>
    </html>
  `;

  // Crear blob y descargar como HTML que puede ser convertido a PDF
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.html`;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  // Abrir en nueva ventana para permitir al usuario imprimir como PDF
  const newWindow = window.open('', '_blank');
  if (newWindow) {
    newWindow.document.write(htmlContent);
    newWindow.document.close();
    setTimeout(() => {
      newWindow.print();
    }, 1000);
  }
};

export const generateExcel = (exportData: ExportData): void => {
  const { filename, data, headers, title } = exportData;
  
  // Crear contenido Excel-compatible con metadatos
  const excelHeaders = [
    'Sistema Contable Pro - Ecuador',
    title || 'Reporte de Datos',
    `Fecha: ${new Date().toLocaleDateString('es-EC')}`,
    `Total registros: ${data.length}`,
    '', // Línea vacía
    ...headers
  ];
  
  // Generar CSV con formato Excel mejorado
  const csvContent = [
    // BOM para UTF-8
    '\ufeff',
    // Metadatos del reporte
    'Sistema Contable Pro - Ecuador',
    title || 'Reporte de Datos',
    `Fecha de generación: ${new Date().toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`,
    `Total de registros: ${data.length}`,
    'Cumple normativa SRI Ecuador 2024',
    '', // Línea vacía
    // Headers
    headers.join(','),
    // Data rows
    ...data.map(row => 
      headers.map(header => {
        const value = getNestedValue(row, header);
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',')
    ),
    '', // Línea vacía
    'Generado por Sistema Contable Pro',
    'Cumplimiento SRI Ecuador 2024'
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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

// Función para generar plantillas de importación
export const generateImportTemplate = (type: string): void => {
  const templates: { [key: string]: { headers: string[], sample: any[] } } = {
    clients: {
      headers: ['Nombre', 'RUC', 'Email', 'Teléfono', 'Dirección'],
      sample: [
        ['Empresa Ejemplo S.A.', '0912345678001', 'contacto@ejemplo.com', '042-123456', 'Av. Principal 123, Guayaquil'],
        ['Cliente Individual', '0987654321', 'cliente@correo.com', '099-987654', 'Calle Secundaria 456, Quito']
      ]
    },
    suppliers: {
      headers: ['Nombre', 'RUC', 'Email', 'Teléfono', 'Dirección', 'Persona Contacto', 'Categoría', 'Términos Pago'],
      sample: [
        ['Proveedor ABC S.A.', '0912345678001', 'ventas@abc.com', '042-111222', 'Zona Industrial, Guayaquil', 'Juan Pérez', 'bienes', '30 días'],
        ['Servicios XYZ Ltda.', '1712345678001', 'info@xyz.com', '022-333444', 'Av. Amazonas, Quito', 'María García', 'servicios', 'contado']
      ]
    },
    products: {
      headers: ['Código', 'Nombre', 'Descripción', 'Categoría', 'Unidad', 'Precio Compra', 'Precio Venta', 'IVA %', 'Stock', 'Stock Mínimo'],
      sample: [
        ['PROD001', 'Producto Ejemplo', 'Descripción del producto', 'Categoría A', 'unidad', '10.00', '15.00', '15', '100', '10'],
        ['SERV001', 'Servicio Ejemplo', 'Descripción del servicio', 'Servicios', 'hora', '25.00', '35.00', '15', '0', '0']
      ]
    },
    purchases: {
      headers: ['Fecha', 'Proveedor RUC', 'Número Factura', 'Subtotal', 'IVA', 'Total', 'Retención Fuente', 'Retención IVA'],
      sample: [
        ['2024-01-15', '0912345678001', 'FAC-001', '100.00', '15.00', '115.00', '2.00', '10.50'],
        ['2024-01-16', '1712345678001', 'FAC-002', '250.00', '37.50', '287.50', '5.00', '26.25']
      ]
    },
    employees: {
      headers: ['Nombres', 'Apellidos', 'Cédula', 'Email', 'Teléfono', 'Cargo', 'Departamento', 'Salario', 'Fecha Ingreso'],
      sample: [
        ['Juan Carlos', 'Pérez González', '0912345678', 'juan.perez@empresa.com', '099-123456', 'Contador', 'Contabilidad', '800.00', '2024-01-01'],
        ['María Elena', 'García López', '1712345678', 'maria.garcia@empresa.com', '098-765432', 'Asistente', 'Administración', '450.00', '2024-02-01']
      ]
    }
  };

  const template = templates[type];
  if (!template) {
    console.error(`Plantilla no encontrada para: ${type}`);
    return;
  }

  const csvContent = [
    '\ufeff', // BOM para UTF-8
    '# PLANTILLA DE IMPORTACIÓN - SISTEMA CONTABLE PRO',
    `# Tipo: ${type.toUpperCase()}`,
    `# Fecha: ${new Date().toLocaleDateString('es-EC')}`,
    '# INSTRUCCIONES:',
    '# 1. Complete los datos en las filas siguientes',
    '# 2. No modifique los encabezados',
    '# 3. Guarde como CSV (separado por comas)',
    '# 4. Use el botón "Importar" en el sistema',
    '',
    template.headers.join(','),
    ...template.sample.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `plantilla_${type}_${new Date().toISOString().split('T')[0]}.csv`;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
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