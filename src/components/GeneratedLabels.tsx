import React, { useState } from 'react';
import { Edit, Download, Settings } from 'lucide-react';
import QRCode from 'qrcode.react';
import type { Label, PDFSettings, EditingState, PageSettings } from '../types';
import { LabelEditor } from './LabelEditor';
import { PageSettingsModal } from './PageSettingsModal';
import { getScaleFactor } from '../utils';
import { LabelPreview } from './LabelPreview';

interface GeneratedLabelsProps {
  labels: Label[];
  onUpdateLabels: (labels: Label[]) => void;
  pdfSettings: PDFSettings;
  onUpdatePdfSettings: (settings: PDFSettings) => void;
  onExportPdf: (selectedLabels: Label[]) => void;
  onRestart: () => void;
}

export function GeneratedLabels({
  labels,
  onUpdateLabels,
  pdfSettings,
  onUpdatePdfSettings,
  onExportPdf,
  onRestart
}: GeneratedLabelsProps) {
  const [editingState, setEditingState] = useState<EditingState>({
    isEditing: false,
    selectedLabels: [],
    editingAll: false
  });
  const [showPageSettings, setShowPageSettings] = useState(false);

  const defaultPageSettings: PageSettings = {
    width: 210,
    height: 297,
    unit: 'mm',
    marginTop: 10,
    marginRight: 10,
    marginBottom: 10,
    marginLeft: 10,
    spacing: 2
  };

  const handleLabelUpdate = (updatedLabel: Label) => {
    const newLabels = labels.map(label => 
      label.id === updatedLabel.id ? updatedLabel : label
    );
    onUpdateLabels(newLabels);
  };

  const handleBulkUpdate = (updatedLabel: Label) => {
    const newLabels = labels.map(label => {
      if (editingState.selectedLabels.includes(label.id) || editingState.editingAll) {
        return {
          ...label,
          elements: updatedLabel.elements,
          size: updatedLabel.size,
          companyName: updatedLabel.companyName,
          productName: label.productName
        };
      }
      return label;
    });
    onUpdateLabels(newLabels);
  };

  const toggleLabelSelection = (labelId: string) => {
    setEditingState(prev => ({
      ...prev,
      selectedLabels: prev.selectedLabels.includes(labelId) ?
        prev.selectedLabels.filter(id => id !== labelId) :
        [...prev.selectedLabels, labelId]
    }));
  };

  const startEditing = (labelId?: string) => {
    if (labelId) {
      setEditingState({
        isEditing: true,
        selectedLabels: [labelId],
        editingAll: false
      });
    } else if (editingState.selectedLabels.length > 0) {
      setEditingState(prev => ({
        ...prev,
        isEditing: true,
        editingAll: false
      }));
    } else {
      setEditingState({
        isEditing: true,
        selectedLabels: [],
        editingAll: true
      });
    }
  };

  const stopEditing = () => {
    setEditingState({
      isEditing: false,
      selectedLabels: [],
      editingAll: false
    });
  };

  const handleExportPdf = () => {
    const selectedLabels = editingState.selectedLabels.length > 0 
      ? labels.filter(label => editingState.selectedLabels.includes(label.id))
      : labels;
    onExportPdf(selectedLabels);
  };

  const handlePdfTypeChange = (type: 'single' | 'multiple') => {
    if (type === 'multiple' && !pdfSettings.pageSettings) {
      onUpdatePdfSettings({
        ...pdfSettings,
        type,
        pageSettings: defaultPageSettings
      });
      setShowPageSettings(true);
    } else {
      onUpdatePdfSettings({ ...pdfSettings, type });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Generated Labels</h2>
            <div className="flex gap-2">
              <button
                onClick={() => startEditing()}
                className={`flex items-center gap-2 px-4 py-2 ${
                  editingState.selectedLabels.length === 0 
                    ? 'bg-blue-500 hover:bg-blue-600' 
                    : 'bg-gray-500 hover:bg-gray-600'
                } text-white rounded-md transition-colors`}
              >
                <Edit className="w-4 h-4" />
                Edit All Labels
              </button>
              {editingState.selectedLabels.length > 0 && (
                <button
                  onClick={() => startEditing(undefined)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit Selected ({editingState.selectedLabels.length})
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <select
                value={pdfSettings.type}
                onChange={(e) => handlePdfTypeChange(e.target.value as 'single' | 'multiple')}
                className="block rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="single">One Label per Page</option>
                <option value="multiple">Multiple Labels per Page</option>
              </select>
            </div>
            {pdfSettings.type === 'multiple' && (
              <button
                onClick={() => setShowPageSettings(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Page Settings
              </button>
            )}
            <button
              onClick={handleExportPdf}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export {editingState.selectedLabels.length > 0 ? `Selected (${editingState.selectedLabels.length})` : 'All'} to PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {labels.map((label) => (
            <div key={label.id} className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={editingState.selectedLabels.includes(label.id)}
                    onChange={() => toggleLabelSelection(label.id)}
                    className="rounded border-gray-300 text-blue-500 focus:ring-blue-500 dark:border-gray-600"
                  />
                  <button
                    onClick={() => startEditing(label.id)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                </div>
                <div>
                  <input
                    type="text"
                    value={label.productName}
                    onChange={(e) => handleLabelUpdate({ ...label, productName: e.target.value })}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter product name"
                  />
                </div>
              </div>
              
              <LabelPreview label={label} />
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onRestart}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
      >
        Create New Labels
      </button>

      {editingState.isEditing && (
        <LabelEditor
          label={editingState.editingAll ? labels[0] : 
            labels.find(l => l.id === editingState.selectedLabels[0])!}
          onUpdate={editingState.editingAll || editingState.selectedLabels.length > 1 ? 
            handleBulkUpdate : 
            handleLabelUpdate}
          onClose={stopEditing}
        />
      )}

      {showPageSettings && pdfSettings.pageSettings && (
        <PageSettingsModal
          settings={pdfSettings.pageSettings}
          onUpdate={(newSettings) => {
            onUpdatePdfSettings({
              ...pdfSettings,
              pageSettings: newSettings
            });
          }}
          onClose={() => setShowPageSettings(false)}
        />
      )}
    </div>
  );
}