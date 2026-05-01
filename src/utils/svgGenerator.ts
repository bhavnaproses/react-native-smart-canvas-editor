interface Element {
  id: string;
  type:
    | 'path'
    | 'rect'
    | 'circle'
    | 'eraser'
    | 'brush'
    | 'text'
    | 'image'
    | 'sticker';
  path?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number;
  color: string;
  strokeWidth: number;
  opacity: number;
  blur?: number;
  roughness?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  uri?: string;
  assetId?: string;
}

export const elementsToSVG = (elements: Element[], width: number = 1000, height: number = 1000): string => {
  let svgContent = '';
  
  // Create a mask for erasers if any
  const erasers = elements.filter(el => el.type === 'eraser');
  const blurredElements = elements.filter(el => (el.blur || 0) > 0);
  
  let defs = '';
  if (erasers.length > 0 || blurredElements.length > 0) {
    defs += '  <defs>\n';
    
    if (erasers.length > 0) {
      defs += `    <mask id="eraserMask">\n      <rect width="100%" height="100%" fill="white" />\n`;
      erasers.forEach(el => {
        if (el.path) {
          defs += `      <path d="${el.path}" transform="translate(${el.x || 0}, ${el.y || 0})" stroke="black" stroke-width="${el.strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round" />\n`;
        }
      });
      defs += `    </mask>\n`;
    }

    blurredElements.forEach(el => {
      defs += `    <filter id="blur-${el.id}">\n      <feGaussianBlur in="SourceGraphic" stdDeviation="${el.blur || 0}" />\n    </filter>\n`;
    });

    defs += '  </defs>\n';
  }

  svgContent += defs;
  svgContent += `  <g ${erasers.length > 0 ? `mask="url(#eraserMask)"` : ''}>\n`;

  elements.forEach(el => {
    if (el.type === 'eraser') return; // Handled by mask

    const color = el.color || '#000000';
    const opacity = el.opacity ?? 1;
    const strokeWidth = el.strokeWidth || 1;
    const transform = `translate(${el.x || 0}, ${el.y || 0})`;
    const filter = (el.blur || 0) > 0 ? `url(#blur-${el.id})` : '';

    if (el.type === 'path' || el.type === 'brush') {
      if (el.path) {
        svgContent += `    <path d="${el.path}" transform="${transform}" stroke="${color}" stroke-width="${strokeWidth}" fill="none" opacity="${opacity}" stroke-linecap="round" stroke-linejoin="round" ${filter ? `filter="${filter}"` : ''} />\n`;
      }
    } else if (el.type === 'rect') {
      svgContent += `    <rect x="${el.x || 0}" y="${el.y || 0}" width="${el.width || 0}" height="${el.height || 0}" fill="${color}" opacity="${opacity}" />\n`;
    } else if (el.type === 'circle') {
      svgContent += `    <circle cx="${el.x || 0}" cy="${el.y || 0}" r="${el.radius || 0}" fill="${color}" opacity="${opacity}" />\n`;
    } else if (el.type === 'text') {
      svgContent += `    <text x="${el.x || 0}" y="${(el.y || 0) + (el.fontSize || 20)}" fill="${color}" opacity="${opacity}" font-size="${el.fontSize || 20}" font-family="${el.fontFamily || 'Arial'}">${el.text || ''}</text>\n`;
    }
  });

  svgContent += `  </g>\n`;

  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
${svgContent}</svg>`;
};
