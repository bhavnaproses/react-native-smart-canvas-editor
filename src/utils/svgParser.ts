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
}

const getAttribute = (tag: string, attr: string): string | null => {
  const regex = new RegExp(`${attr}="([^"]*)"`);
  const match = tag.match(regex);
  return match?.[1] ?? null;
};

const parseTransform = (transform: string | null): { x: number; y: number } => {
  if (!transform) return { x: 0, y: 0 };
  const translateMatch = transform.match(/translate\(([-\d.]+),\s*([-\d.]+)\)/);
  if (translateMatch && translateMatch[1] !== undefined && translateMatch[2] !== undefined) {
    return { x: parseFloat(translateMatch[1]), y: parseFloat(translateMatch[2]) };
  }
  return { x: 0, y: 0 };
};

export const parseSVGToElements = (svgString: string): Element[] => {
  const elements: Element[] = [];
  
  // Find all path, rect, circle, text tags
  const tagRegex = /<(path|rect|circle|text)\s+([^>]*)\/?>|(<text\s+([^>]*)>([^<]*)<\/text>)/gi;
  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(svgString)) !== null) {
    const tagName = match[1] || 'text';
    const attributes = match[2] || match[4] || '';
    const content = match[5];

    const id = getAttribute(attributes, 'id') || Math.random().toString(36).substr(2, 9);
    const color = getAttribute(attributes, 'fill') || getAttribute(attributes, 'stroke') || '#000000';
    const strokeWidthAttr = getAttribute(attributes, 'stroke-width');
    const strokeWidth = strokeWidthAttr ? parseFloat(strokeWidthAttr) : 1;
    const opacityAttr = getAttribute(attributes, 'opacity');
    const opacity = opacityAttr ? parseFloat(opacityAttr) : 1;
    const transform = parseTransform(getAttribute(attributes, 'transform'));
    const filter = getAttribute(attributes, 'filter');
    const isBrush = filter && filter.includes('blur');

    const baseElement = {
      id,
      color,
      strokeWidth,
      opacity,
      x: transform.x,
      y: transform.y,
    };

    if (tagName === 'path') {
      const d = getAttribute(attributes, 'd');
      if (d) {
        elements.push({
          ...baseElement,
          type: isBrush ? 'brush' : 'path',
          path: d,
          blur: isBrush ? 3 : 0, // Default blur if it was a brush
        } as Element);
      }
    } else if (tagName === 'rect') {
      const xAttr = getAttribute(attributes, 'x');
      const yAttr = getAttribute(attributes, 'y');
      const widthAttr = getAttribute(attributes, 'width');
      const heightAttr = getAttribute(attributes, 'height');
      
      const x = xAttr ? parseFloat(xAttr) : 0;
      const y = yAttr ? parseFloat(yAttr) : 0;
      const width = widthAttr ? parseFloat(widthAttr) : 0;
      const height = heightAttr ? parseFloat(heightAttr) : 0;
      
      elements.push({
        ...baseElement,
        type: 'rect',
        x: x + transform.x,
        y: y + transform.y,
        width,
        height,
      } as Element);
    } else if (tagName === 'circle') {
      const cxAttr = getAttribute(attributes, 'cx');
      const cyAttr = getAttribute(attributes, 'cy');
      const rAttr = getAttribute(attributes, 'r');
      
      const cx = cxAttr ? parseFloat(cxAttr) : 0;
      const cy = cyAttr ? parseFloat(cyAttr) : 0;
      const r = rAttr ? parseFloat(rAttr) : 0;
      
      elements.push({
        ...baseElement,
        type: 'circle',
        x: cx + transform.x,
        y: cy + transform.y,
        radius: r,
      } as Element);
    } else if (tagName === 'text') {
      const xAttr = getAttribute(attributes, 'x');
      const yAttr = getAttribute(attributes, 'y');
      const fontSizeAttr = getAttribute(attributes, 'font-size');
      
      const x = xAttr ? parseFloat(xAttr) : 0;
      const y = yAttr ? parseFloat(yAttr) : 0;
      const fontSize = fontSizeAttr ? parseFloat(fontSizeAttr) : 20;
      const fontFamily = getAttribute(attributes, 'font-family') || 'Arial';
      
      elements.push({
        ...baseElement,
        type: 'text',
        x: x + transform.x,
        y: y + transform.y - fontSize, // SVG text y is baseline, we use top-left mostly
        text: content || '',
        fontSize,
        fontFamily,
      } as Element);
    }
  }

  return elements;
};
