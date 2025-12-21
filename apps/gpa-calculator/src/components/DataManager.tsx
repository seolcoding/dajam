import React, { useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@mini-apps/ui';
import { Download, Upload, FileJson, Database } from 'lucide-react';
import type { Semester } from '../types';
import { exportToCSV, exportToJSON, importFromCSV, importFromJSON } from '../lib/csvExport';

interface DataManagerProps {
  semesters: Semester[];
  onImport: (semesters: Semester[]) => Promise<void>;
  onClearAll: () => Promise<void>;
}

export function DataManager({ semesters, onImport, onClearAll }: DataManagerProps) {
  const csvInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  const handleCSVExport = () => {
    if (semesters.length === 0) {
      alert('내보낼 데이터가 없습니다.');
      return;
    }
    exportToCSV(semesters);
  };

  const handleJSONExport = () => {
    if (semesters.length === 0) {
      alert('내보낼 데이터가 없습니다.');
      return;
    }
    exportToJSON(semesters);
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importedSemesters = await importFromCSV(file);
      await onImport(importedSemesters);
      alert(`${importedSemesters.length}개 학기가 가져오기되었습니다.`);
    } catch (error) {
      console.error('CSV import error:', error);
      alert('CSV 파일 가져오기 중 오류가 발생했습니다.');
    }

    // Reset input
    if (csvInputRef.current) {
      csvInputRef.current.value = '';
    }
  };

  const handleJSONImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importedSemesters = await importFromJSON(file);
      await onImport(importedSemesters);
      alert(`${importedSemesters.length}개 학기가 가져오기되었습니다.`);
    } catch (error) {
      console.error('JSON import error:', error);
      alert('JSON 파일 가져오기 중 오류가 발생했습니다.');
    }

    // Reset input
    if (jsonInputRef.current) {
      jsonInputRef.current.value = '';
    }
  };

  const handleClearAll = async () => {
    if (!confirm('모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    await onClearAll();
    alert('모든 데이터가 삭제되었습니다.');
  };

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-gray-900">데이터 관리</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">내보내기</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCSVExport}
                disabled={semesters.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                CSV 내보내기
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleJSONExport}
                disabled={semesters.length === 0}
              >
                <FileJson className="w-4 h-4 mr-2" />
                JSON 백업
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">가져오기</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => csvInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                CSV 가져오기
              </Button>
              <input
                ref={csvInputRef}
                type="file"
                accept=".csv"
                onChange={handleCSVImport}
                className="hidden"
              />

              <Button
                variant="outline"
                size="sm"
                onClick={() => jsonInputRef.current?.click()}
              >
                <FileJson className="w-4 h-4 mr-2" />
                JSON 복원
              </Button>
              <input
                ref={jsonInputRef}
                type="file"
                accept=".json"
                onChange={handleJSONImport}
                className="hidden"
              />
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-sm font-semibold mb-2 text-red-600">위험 구역</h3>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearAll}
            >
              <Database className="w-4 h-4 mr-2" />
              모든 데이터 삭제
            </Button>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="font-semibold text-sm text-gray-900 mb-2">안내:</p>
            <ul className="list-disc list-inside space-y-1 text-xs text-gray-600">
              <li>CSV: 엑셀에서 열람 가능한 형식</li>
              <li>JSON: 완전한 백업 형식 (권장)</li>
              <li>데이터는 브라우저에만 저장됩니다</li>
              <li>정기적으로 백업하는 것을 권장합니다</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
