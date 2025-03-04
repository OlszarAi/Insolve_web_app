export interface Position {
  x: number;
  y: number;
}

export interface TextStyle {
  align: 'left' | 'center' | 'right';
  multiline: boolean;
  maxWidth?: number;
}

export interface ElementStyle {
  position: Position;
  size: number;
  width?: number;
  textStyle?: TextStyle;
}

export interface LabelSize {
  width: number;
  height: number;
  unit: 'mm' | 'cm' | 'in';
  padding: number;
  elementSpacing: number;
  border: {
    enabled: boolean;
    width: number;
    color: string;
  };
}

export interface LabelElements {
  qrCode: ElementStyle;
  uuid: ElementStyle;
  companyName: ElementStyle & { textStyle: TextStyle };
  productName: ElementStyle & { textStyle: TextStyle };
}

export interface Label {
  id: string;
  size: LabelSize;
  elements: LabelElements;
  companyName: string;
  uuid: string;
  shortUuid: string;
  prefix: string;
  productName: string;
}

export interface PageSettings {
  width: number;
  height: number;
  unit: 'mm' | 'cm';
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  spacing: number;
}

export interface PDFSettings {
  type: 'single' | 'multiple';
  labelsPerPage?: number;
  pageSettings?: PageSettings;
}

export interface ElementBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface EditingState {
  isEditing: boolean;
  selectedLabels: string[];
  editingAll: boolean;
}