import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode.react';
import { Move, QrCode, Type, Building, Package } from 'lucide-react';
import type { Label, LabelElements, ElementStyle, Position, TextStyle } from '../types';
import { getScaleFactor, constrainPosition, findNonOverlappingPosition, calculateTextDimensions } from '../utils';

interface LabelEditorProps {
  label: Label;
  onUpdate: (updatedLabel: Label) => void;
  onClose?: () => void;
  onNext?: () => void;
  showNextButton?: boolean;
}

export function LabelEditor({ 
  label, 
  onUpdate, 
  onClose,
  onNext,
  showNextButton = false 
}: LabelEditorProps) {
  const [elements, setElements] = useState<LabelElements>(label.elements);
  const [padding, setPadding] = useState(label.size.padding);
  const [elementSpacing, setElementSpacing] = useState(label.size.elementSpacing || 1);
  const editorRef = useRef<HTMLDivElement>(null);
  const [draggingElement, setDraggingElement] = useState<keyof LabelElements | null>(null);
  const [showSaveCancel, setShowSaveCancel] = useState(false);
  const [selectedElement, setSelectedElement] = useState<keyof LabelElements | null>(null);

  const scale = getScaleFactor(label.size.unit);

  // Update elements when label changes (e.g., when UUID length changes)
  useEffect(() => {
    setElements(label.elements);
  }, [label.elements]);

  const handleNumberInput = (value: string, setter: (num: number) => void) => {
    if (value === '') {
      setter(0);
      return;
    }
    
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      setter(num);
    }
  };

  const updateElementPosition = (element: keyof LabelElements, position: Partial<Position>) => {
    const updatedElements = { ...elements };
    const currentElement = updatedElements[element];
    const otherElements = Object.entries(updatedElements)
      .filter(([key]) => key !== element)
      .map(([, value]) => value);

    const newPosition = constrainPosition(
      { ...currentElement.position, ...position },
      currentElement.size,
      { ...label.size, padding, elementSpacing },
      currentElement.width
    );

    const finalPosition = findNonOverlappingPosition(
      { ...currentElement, position: newPosition },
      otherElements,
      { ...label.size, padding, elementSpacing },
      scale
    );

    updatedElements[element] = {
      ...currentElement,
      position: finalPosition
    };

    setElements(updatedElements);
    setShowSaveCancel(true);
  };

  const updateElementSize = (element: keyof LabelElements, size: number) => {
    const updatedElements = { ...elements };
    updatedElements[element] = { ...updatedElements[element], size };
    setElements(updatedElements);
    setShowSaveCancel(true);
  };

  const updateTextStyle = (element: 'companyName' | 'productName', textStyle: Partial<TextStyle>) => {
    const updatedElements = { ...elements };
    updatedElements[element] = {
      ...updatedElements[element],
      textStyle: { ...updatedElements[element].textStyle, ...textStyle }
    };
    setElements(updatedElements);
    setShowSaveCancel(true);
  };

  const handleDragStart = (element: keyof LabelElements) => {
    setDraggingElement(element);
    setSelectedElement(element);
  };

  const handleDragEnd = () => {
    setDraggingElement(null);
  };

  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggingElement || !editorRef.current) return;

    const rect = editorRef.current.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / scale);
    const y = Math.round((e.clientY - rect.top) / scale);

    updateElementPosition(draggingElement, { x, y });
  };

  const handleSave = () => {
    onUpdate({ 
      ...label, 
      elements, 
      size: { 
        ...label.size, 
        padding, 
        elementSpacing 
      } 
    });
    setShowSaveCancel(false);
    if (onNext) {
      onNext();
    } else if (onClose) {
      onClose();
    }
  };

  const handleCancel = () => {
    setElements(label.elements);
    setPadding(label.size.padding);
    setElementSpacing(label.size.elementSpacing || 1);
    setShowSaveCancel(false);
    if (onClose) {
      onClose();
    }
  };

  const renderElement = (
    element: keyof LabelElements,
    content: React.ReactNode,
    style: React.CSSProperties
  ) => {
    const elementStyle = elements[element];
    const isSelected = selectedElement === element;
    const isDragging = draggingElement === element;

    return (
      <div 
        className={`absolute cursor-move ${isSelected ? 'ring-2 ring-blue-500' : ''} ${
          isDragging ? 'ring-2 ring-blue-500 opacity-75' : ''
        }`}
        style={{
          ...style,
          left: `${elementStyle.position.x * scale}px`,
          top: `${elementStyle.position.y * scale}px`,
          outline: '1px solid rgba(59, 130, 246, 0.5)',
          background: 'rgba(255, 255, 255, 0.8)',
          padding: '2px'
        }}
        onMouseDown={() => handleDragStart(element)}
        onMouseUp={handleDragEnd}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedElement(isSelected ? null : element);
        }}
      >
        {content}
      </div>
    );
  };

  const ElementControls = ({ 
    element, 
    icon, 
    label: elementLabel,
    showTextControls = false 
  }: { 
    element: keyof LabelElements;
    icon: React.ReactNode;
    label: string;
    showTextControls?: boolean;
  }) => {
    const elementStyle = elements[element];
    const isSelected = selectedElement === element;
    
    return (
      <div className={`bg-gray-50 p-4 rounded-lg ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <h3 className="font-medium">{elementLabel}</h3>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">X Position ({label.size.unit})</label>
              <input
                type="number"
                value={elementStyle.position.x}
                onChange={(e) => {
                  handleNumberInput(e.target.value, (num) => {
                    updateElementPosition(element, { x: num });
                  });
                }}
                step="0.1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Y Position ({label.size.unit})</label>
              <input
                type="number"
                value={elementStyle.position.y}
                onChange={(e) => {
                  handleNumberInput(e.target.value, (num) => {
                    updateElementPosition(element, { y: num });
                  });
                }}
                step="0.1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Size {element === 'qrCode' ? '(px)' : '(pt)'}
            </label>
            <input
              type="number"
              value={elementStyle.size}
              onChange={(e) => updateElementSize(element, Number(e.target.value))}
              min={element === 'qrCode' ? 20 : 8}
              max={element === 'qrCode' ? 200 : 72}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          {showTextControls && 'textStyle' in elementStyle && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Text Alignment</label>
                <select
                  value={elementStyle.textStyle.align}
                  onChange={(e) => updateTextStyle(element as 'companyName' | 'productName', { 
                    align: e.target.value as TextStyle['align']
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={elementStyle.textStyle.multiline}
                    onChange={(e) => updateTextStyle(element as 'companyName' | 'productName', { 
                      multiline: e.target.checked
                    })}
                    className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Enable Multiline</span>
                </label>
              </div>
              {elementStyle.textStyle.multiline && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Max Width ({label.size.unit})</label>
                  <input
                    type="number"
                    value={elementStyle.textStyle.maxWidth || elementStyle.width || elementStyle.size}
                    onChange={(e) => updateTextStyle(element as 'companyName' | 'productName', { 
                      maxWidth: Number(e.target.value)
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Edit Label</h2>
          {!showSaveCancel && !showNextButton && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Border Padding ({label.size.unit})</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={padding}
                onChange={(e) => {
                  handleNumberInput(e.target.value, (num) => {
                    setPadding(num);
                    setShowSaveCancel(true);
                  });
                }}
                min={0}
                step="0.1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={padding === 0}
                  onChange={(e) => {
                    setPadding(e.target.checked ? 0 : 1);
                    setShowSaveCancel(true);
                  }}
                  className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Disable</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Element Spacing ({label.size.unit})</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={elementSpacing}
                onChange={(e) => {
                  handleNumberInput(e.target.value, (num) => {
                    setElementSpacing(num);
                    setShowSaveCancel(true);
                  });
                }}
                min={0}
                step="0.1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={elementSpacing === 0}
                  onChange={(e) => {
                    setElementSpacing(e.target.checked ? 0 : 1);
                    setShowSaveCancel(true);
                  }}
                  className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Disable</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          <div 
            ref={editorRef}
            onClick={(e) => {
              handleEditorClick(e);
              setSelectedElement(null);
            }}
            className="border-2 border-gray-200 rounded-lg p-4 bg-white cursor-pointer relative"
            style={{
              width: `${label.size.width * scale}px`,
              height: `${label.size.height * scale}px`
            }}
          >
            {renderElement(
              'qrCode',
              <QRCode value={`${label.prefix}${label.uuid}`} size={elements.qrCode.size} />,
              { fontSize: `${elements.qrCode.size}px` }
            )}
            
            {renderElement(
              'uuid',
              <p className="text-gray-600">{label.shortUuid}</p>,
              { fontSize: `${elements.uuid.size}px` }
            )}
            
            {renderElement(
              'companyName',
              <p 
                className="font-bold whitespace-pre-wrap"
                style={{ 
                  textAlign: elements.companyName.textStyle.align,
                  maxWidth: elements.companyName.textStyle.maxWidth ? 
                    `${elements.companyName.textStyle.maxWidth * scale}px` : 
                    undefined
                }}
              >
                {label.companyName}
              </p>,
              { fontSize: `${elements.companyName.size}px` }
            )}
            
            {renderElement(
              'productName',
              <p 
                className="font-bold whitespace-pre-wrap"
                style={{ 
                  textAlign: elements.productName.textStyle.align,
                  maxWidth: elements.productName.textStyle.maxWidth ? 
                    `${elements.productName.textStyle.maxWidth * scale}px` : 
                    undefined
                }}
              >
                {label.productName}
              </p>,
              { fontSize: `${elements.productName.size}px` }
            )}
          </div>

          <div className="flex-1 space-y-4">
            <ElementControls 
              element="qrCode" 
              icon={<QrCode className="w-5 h-5" />} 
              label="QR Code" 
            />
            <ElementControls 
              element="uuid" 
              icon={<Type className="w-5 h-5" />} 
              label="UUID Text" 
            />
            <ElementControls 
              element="companyName" 
              icon={<Building className="w-5 h-5" />} 
              label="Company Name" 
              showTextControls
            />
            <ElementControls 
              element="productName" 
              icon={<Package className="w-5 h-5" />} 
              label="Product Name" 
              showTextControls
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          {showSaveCancel ? (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Save Changes
              </button>
            </>
          ) : showNextButton && (
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}