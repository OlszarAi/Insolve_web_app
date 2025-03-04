import React from 'react';
import QRCode from 'qrcode.react';
import type { Label } from '../types';
import { getScaleFactor } from '../utils';

interface LabelPreviewProps {
  label: Label;
}

export function LabelPreview({ label }: LabelPreviewProps) {
  const scale = getScaleFactor(label.size.unit);
  
  return (
    <div 
      className="border-2 border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800 relative" 
      style={{
        width: `${label.size.width * scale}px`,
        height: `${label.size.height * scale}px`,
        ...(label.size.border.enabled && {
          border: `${label.size.border.width * scale}px solid ${label.size.border.color}`
        })
      }}
    >
      <div style={{
        position: 'absolute',
        left: `${label.elements.qrCode.position.x * scale}px`,
        top: `${label.elements.qrCode.position.y * scale}px`
      }}>
        <QRCode value={`${label.prefix}${label.uuid}`} size={label.elements.qrCode.size} />
      </div>
      <div style={{
        position: 'absolute',
        left: `${label.elements.uuid.position.x * scale}px`,
        top: `${label.elements.uuid.position.y * scale}px`,
        fontSize: `${label.elements.uuid.size}px`
      }}>
        <p className="text-gray-600 dark:text-gray-400">{label.shortUuid}</p>
      </div>
      <div style={{
        position: 'absolute',
        left: `${label.elements.companyName.position.x * scale}px`,
        top: `${label.elements.companyName.position.y * scale}px`,
        fontSize: `${label.elements.companyName.size}px`,
        maxWidth: label.elements.companyName.textStyle.maxWidth ? 
          `${label.elements.companyName.textStyle.maxWidth * scale}px` : 
          undefined,
        wordBreak: 'break-word',
        whiteSpace: label.elements.companyName.textStyle.multiline ? 'pre-wrap' : 'nowrap',
        overflow: 'hidden'
      }}>
        <p 
          className="font-bold dark:text-white"
          style={{ 
            textAlign: label.elements.companyName.textStyle.align,
          }}
        >
          {label.companyName}
        </p>
      </div>
      <div style={{
        position: 'absolute',
        left: `${label.elements.productName.position.x * scale}px`,
        top: `${label.elements.productName.position.y * scale}px`,
        fontSize: `${label.elements.productName.size}px`,
        maxWidth: label.elements.productName.textStyle.maxWidth ? 
          `${label.elements.productName.textStyle.maxWidth * scale}px` : 
          undefined,
        wordBreak: 'break-word',
        whiteSpace: label.elements.productName.textStyle.multiline ? 'pre-wrap' : 'nowrap',
        overflow: 'hidden'
      }}>
        <p 
          className="font-bold dark:text-white"
          style={{ 
            textAlign: label.elements.productName.textStyle.align,
          }}
        >
          {label.productName}
        </p>
      </div>
    </div>
  );
}