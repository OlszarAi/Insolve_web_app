import type { Position, LabelSize, ElementStyle, ElementBounds, TextStyle } from './types';

export const getScaleFactor = (unit: 'mm' | 'cm' | 'in') => {
  switch (unit) {
    case 'mm': return 3.779528;  // 1mm = 3.779528px
    case 'cm': return 37.79528;  // 1cm = 37.79528px
    case 'in': return 96;        // 1in = 96px
    default: return 3.779528;
  }
};

export const constrainPosition = (
  position: Position,
  elementSize: number,
  labelSize: LabelSize,
  elementWidth?: number
): Position => {
  const { width, height, padding } = labelSize;
  const elementW = elementWidth || elementSize;
  const effectivePadding = padding || 0;

  // Convert QR code size from pixels to label units (mm/cm/in)
  const scale = getScaleFactor(labelSize.unit);
  const elementWInUnits = elementW / scale;
  const elementHInUnits = elementSize / scale;

  return {
    x: Math.max(
      effectivePadding, 
      Math.min(position.x, width - elementWInUnits - effectivePadding)
    ),
    y: Math.max(
      effectivePadding, 
      Math.min(position.y, height - elementHInUnits - effectivePadding)
    )
  };
};

export const getElementBounds = (
  element: ElementStyle,
  scale: number
): ElementBounds => {
  const width = element.width || element.size;
  return {
    left: element.position.x * scale,
    top: element.position.y * scale,
    right: (element.position.x + width / scale) * scale,
    bottom: (element.position.y + element.size / scale) * scale
  };
};

export const doElementsOverlap = (bounds1: ElementBounds, bounds2: ElementBounds): boolean => {
  // Allow elements to touch but not overlap
  return !(
    bounds1.right <= bounds2.left ||
    bounds1.left >= bounds2.right ||
    bounds1.bottom <= bounds2.top ||
    bounds1.top >= bounds2.bottom
  );
};

export const findNonOverlappingPosition = (
  element: ElementStyle,
  otherElements: ElementStyle[],
  labelSize: LabelSize,
  scale: number
): Position => {
  const { padding, width, height } = labelSize;
  const effectivePadding = padding || 0;
  const elementWidth = element.width || element.size;
  
  // Convert element size from pixels to label units for QR code
  const elementWInUnits = elementWidth / scale;
  const elementHInUnits = element.size / scale;
  
  // Calculate maximum allowed positions
  const maxX = width - elementWInUnits - effectivePadding;
  const maxY = height - elementHInUnits - effectivePadding;
  
  // Try the requested position first
  const requestedPosition = {
    x: Math.max(effectivePadding, Math.min(element.position.x, maxX)),
    y: Math.max(effectivePadding, Math.min(element.position.y, maxY))
  };

  const requestedBounds = getElementBounds({ ...element, position: requestedPosition }, scale);
  const hasOverlap = otherElements.some(other => 
    doElementsOverlap(requestedBounds, getElementBounds(other, scale))
  );

  if (!hasOverlap) {
    return requestedPosition;
  }

  // If there's overlap, try alternative positions
  const positions: Position[] = [
    { x: effectivePadding, y: effectivePadding }, // Top-left
    { x: maxX, y: effectivePadding }, // Top-right
    { x: effectivePadding, y: maxY }, // Bottom-left
    { x: maxX, y: maxY }, // Bottom-right
    { x: (width - elementWInUnits) / 2, y: (height - elementHInUnits) / 2 }, // Center
  ];

  for (const pos of positions) {
    const newBounds = getElementBounds({ ...element, position: pos }, scale);
    const hasOverlap = otherElements.some(other => 
      doElementsOverlap(newBounds, getElementBounds(other, scale))
    );

    if (!hasOverlap) {
      return pos;
    }
  }

  // If no position works, return the original constrained position
  return requestedPosition;
};

export const calculateTextDimensions = (
  text: string,
  fontSize: number,
  maxWidth: number,
  textStyle: TextStyle
): { width: number; height: number } => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  context.font = `${fontSize}px sans-serif`;

  if (!textStyle.multiline) {
    const metrics = context.measureText(text);
    return {
      width: Math.min(metrics.width, maxWidth),
      height: fontSize
    };
  }

  const words = text.split(' ');
  let line = '';
  let lines = 1;
  let maxLineWidth = 0;

  for (const word of words) {
    const testLine = line + (line ? ' ' : '') + word;
    const metrics = context.measureText(testLine);

    if (metrics.width > maxWidth && line !== '') {
      line = word;
      lines++;
      maxLineWidth = Math.max(maxLineWidth, metrics.width);
    } else {
      line = testLine;
    }
  }

  return {
    width: Math.min(maxLineWidth, maxWidth),
    height: lines * (fontSize * 1.2) // 1.2 is the line height factor
  };
};

export const wrapText = (
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  fontSize: number,
  textStyle: TextStyle
): void => {
  const words = text.split(' ');
  let line = '';
  const lineHeight = fontSize * 1.2;
  let currentY = y;

  context.font = `${fontSize}px sans-serif`;
  context.textAlign = textStyle.align;
  
  for (const word of words) {
    const testLine = line + (line ? ' ' : '') + word;
    const metrics = context.measureText(testLine);

    if (metrics.width > maxWidth && line !== '') {
      const xPos = textStyle.align === 'center' ? x + maxWidth / 2 :
                  textStyle.align === 'right' ? x + maxWidth :
                  x;
      context.fillText(line, xPos, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }

  const xPos = textStyle.align === 'center' ? x + maxWidth / 2 :
              textStyle.align === 'right' ? x + maxWidth :
              x;
  context.fillText(line, xPos, currentY);
};

// Helper function to create DOM elements for labels
export const createLabelElement = async (
  label: any, 
  scale: number, 
  qrDataUrl?: string
) => {
  const labelDiv = document.createElement('div');
  labelDiv.style.width = `${label.size.width * scale}px`;
  labelDiv.style.height = `${label.size.height * scale}px`;
  labelDiv.style.position = 'relative';
  labelDiv.style.backgroundColor = 'white';
  labelDiv.style.overflow = 'hidden';

  if (label.size.border.enabled) {
    labelDiv.style.border = `${label.size.border.width * scale}px solid ${label.size.border.color}`;
  }

  // Create text container with proper wrapping and positioning
  const createTextContainer = (element: any) => {
    const wrapper = document.createElement('div');
    wrapper.style.position = 'absolute';
    wrapper.style.left = `${element.position.x * scale}px`;
    wrapper.style.top = `${element.position.y * scale}px`;
    
    const container = document.createElement('div');
    container.style.fontSize = `${element.size}px`;
    container.style.lineHeight = '1.2';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.fontWeight = 'bold';
    container.style.margin = '0';
    container.style.padding = '0';
    
    if (element.textStyle) {
      if (element.textStyle.multiline && element.textStyle.maxWidth) {
        container.style.width = `${element.textStyle.maxWidth * scale}px`;
        container.style.whiteSpace = 'pre-wrap';
        container.style.wordBreak = 'break-word';
        container.style.overflowWrap = 'break-word';
        container.style.textAlign = element.textStyle.align;
        wrapper.style.width = container.style.width;
      } else {
        container.style.whiteSpace = 'nowrap';
        if (element.textStyle.align === 'center') {
          wrapper.style.width = '0';
          wrapper.style.transform = 'translateX(50%)';
          container.style.transform = 'translateX(-50%)';
        } else if (element.textStyle.align === 'right') {
          wrapper.style.width = '0';
          container.style.transform = 'translateX(-100%)';
        }
        container.style.textAlign = element.textStyle.align;
      }
    }
    
    wrapper.appendChild(container);
    return { wrapper, container };
  };

  // Add QR Code if we have a data URL
  if (qrDataUrl) {
    const qrContainer = document.createElement('div');
    qrContainer.style.position = 'absolute';
    qrContainer.style.left = `${label.elements.qrCode.position.x * scale}px`;
    qrContainer.style.top = `${label.elements.qrCode.position.y * scale}px`;
    qrContainer.style.width = `${label.elements.qrCode.size}px`;
    qrContainer.style.height = `${label.elements.qrCode.size}px`;
    qrContainer.style.margin = '0';
    qrContainer.style.padding = '0';
    qrContainer.innerHTML = `
      <img 
        src="${qrDataUrl}" 
        width="${label.elements.qrCode.size}" 
        height="${label.elements.qrCode.size}" 
        style="display: block; image-rendering: pixelated; margin: 0; padding: 0;"
      />
    `;
    labelDiv.appendChild(qrContainer);
  }

  // Add UUID
  const { wrapper: uuidWrapper, container: uuidContainer } = createTextContainer(label.elements.uuid);
  uuidContainer.textContent = label.shortUuid;
  labelDiv.appendChild(uuidWrapper);

  // Add Company Name
  const { wrapper: companyWrapper, container: companyContainer } = createTextContainer(label.elements.companyName);
  companyContainer.textContent = label.companyName;
  labelDiv.appendChild(companyWrapper);

  // Add Product Name
  const { wrapper: productWrapper, container: productContainer } = createTextContainer(label.elements.productName);
  productContainer.textContent = label.productName;
  labelDiv.appendChild(productWrapper);

  return labelDiv;
};