import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, GraduationCap } from 'lucide-react';
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Label,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@mini-apps/ui';

import type { GPAScale, Semester, Course, Term } from './types';
import { db, addSemester, deleteSemester, addCourseToSemester, deleteCourseFromSemester, clearAllData, importDatabase } from './lib/db';
import { calculateCumulativeGPA, calculateCategoryGPA } from './lib/gpa';

import { CourseInput } from './components/CourseInput';
import { SemesterList } from './components/SemesterList';
import { GPADisplay } from './components/GPADisplay';
import { GPAChart } from './components/GPAChart';
import { Simulator } from './components/Simulator';
import { DataManager } from './components/DataManager';

function App() {
  const [scale, setScale] = useState<GPAScale>('4.5');
  const [currentSemesterId, setCurrentSemesterId] = useState<string | null>(null);
  const [isAddSemesterOpen, setIsAddSemesterOpen] = useState(false);

  // Dexie 실시간 쿼리
  const semesters = useLiveQuery(
    () => db.semesters.orderBy('year').reverse().toArray(),
    []
  );

  // GPA 계산
  const cumulativeGPA = semesters
    ? calculateCumulativeGPA(semesters, scale)
    : { gpa: 0, totalCredits: 0, earnedCredits: 0 };

  const majorGPA = semesters
    ? calculateCategoryGPA(semesters, 'major', scale)
    : { gpa: 0, totalCredits: 0, earnedCredits: 0 };

  const generalGPA = semesters
    ? calculateCategoryGPA(semesters, 'general', scale)
    : { gpa: 0, totalCredits: 0, earnedCredits: 0 };

  // 현재 학기 선택 (첫 번째 학기 자동 선택)
  const currentSemester = currentSemesterId
    ? semesters?.find(s => s.id === currentSemesterId)
    : semesters?.[0];

  // 과목 추가
  const handleAddCourse = async (courseData: Omit<Course, 'id'>) => {
    if (!currentSemester) {
      alert('먼저 학기를 추가해주세요.');
      return;
    }

    const course: Course = {
      ...courseData,
      id: crypto.randomUUID()
    };

    await addCourseToSemester(currentSemester.id, course);
  };

  // 학기 추가
  const handleAddSemester = async (year: number, term: Term) => {
    const semester: Semester = {
      id: crypto.randomUUID(),
      name: `${year}-${term}학기`,
      year,
      term,
      courses: []
    };

    await addSemester(semester);
    setCurrentSemesterId(semester.id);
    setIsAddSemesterOpen(false);
  };

  // 학기 삭제
  const handleDeleteSemester = async (semesterId: string) => {
    if (!confirm('이 학기를 삭제하시겠습니까?')) return;
    await deleteSemester(semesterId);
    if (currentSemesterId === semesterId) {
      setCurrentSemesterId(null);
    }
  };

  // 과목 삭제
  const handleDeleteCourse = async (semesterId: string, courseId: string) => {
    if (!confirm('이 과목을 삭제하시겠습니까?')) return;
    await deleteCourseFromSemester(semesterId, courseId);
  };

  // 데이터 가져오기
  const handleImport = async (importedSemesters: Semester[]) => {
    await importDatabase(importedSemesters);
  };

  // 전체 데이터 삭제
  const handleClearAll = async () => {
    await clearAllData();
    setCurrentSemesterId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <GraduationCap className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">학점 계산기</h1>
                <p className="text-sm text-gray-600 mt-0.5">학기별 성적 관리 및 GPA 계산</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="scale-select" className="text-sm font-medium text-gray-700">학점 체계</Label>
              <Select value={scale} onValueChange={(v) => setScale(v as GPAScale)}>
                <SelectTrigger id="scale-select" className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4.5">4.5 만점</SelectItem>
                  <SelectItem value="4.3">4.3 만점</SelectItem>
                  <SelectItem value="4.0">4.0 만점</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-8">
          {/* GPA Display */}
          <GPADisplay
            cumulative={cumulativeGPA}
            major={majorGPA}
            general={generalGPA}
          />

          {/* GPA Chart */}
          {semesters && semesters.length > 0 && (
            <GPAChart semesters={semesters} scale={scale} />
          )}

          {/* Tabs */}
          <Tabs defaultValue="courses" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200 p-1">
              <TabsTrigger
                value="courses"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                과목 관리
              </TabsTrigger>
              <TabsTrigger
                value="simulator"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                목표 학점
              </TabsTrigger>
              <TabsTrigger
                value="data"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                데이터
              </TabsTrigger>
            </TabsList>

            {/* 과목 관리 탭 */}
            <TabsContent value="courses" className="space-y-6 mt-6">
              {/* 학기 선택 & 추가 */}
              <div className="flex items-center gap-3 flex-wrap p-4 bg-white rounded-lg border border-gray-200">
                {semesters && semesters.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium text-gray-700">학기 선택</Label>
                    <Select
                      value={currentSemester?.id || ''}
                      onValueChange={setCurrentSemesterId}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="학기 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {semesters.map(sem => (
                          <SelectItem key={sem.id} value={sem.id}>
                            {sem.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <AddSemesterDialog
                  open={isAddSemesterOpen}
                  onOpenChange={setIsAddSemesterOpen}
                  onAdd={handleAddSemester}
                />
              </div>

              {/* 과목 입력 */}
              {currentSemester && (
                <CourseInput onAddCourse={handleAddCourse} />
              )}

              {/* 학기 목록 */}
              <SemesterList
                semesters={semesters || []}
                scale={scale}
                onDeleteSemester={handleDeleteSemester}
                onDeleteCourse={handleDeleteCourse}
              />
            </TabsContent>

            {/* 목표 학점 탭 */}
            <TabsContent value="simulator" className="mt-6">
              <Simulator
                currentGPA={cumulativeGPA.gpa}
                currentCredits={cumulativeGPA.totalCredits}
              />
            </TabsContent>

            {/* 데이터 관리 탭 */}
            <TabsContent value="data" className="mt-6">
              <DataManager
                semesters={semesters || []}
                onImport={handleImport}
                onClearAll={handleClearAll}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm font-semibold text-gray-900">학점 계산기 by SeolCoding</p>
          <p className="mt-2 text-xs text-gray-600">데이터는 브라우저에만 저장됩니다. 정기적으로 백업하세요.</p>
        </div>
      </footer>
    </div>
  );
}

// 학기 추가 다이얼로그
interface AddSemesterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (year: number, term: Term) => void;
}

function AddSemesterDialog({ open, onOpenChange, onAdd }: AddSemesterDialogProps) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [term, setTerm] = useState<Term>(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(year, term);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          학기 추가
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">새 학기 추가</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="year" className="text-sm font-medium text-gray-700">연도</Label>
            <Input
              id="year"
              type="number"
              min="2000"
              max="2100"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="term" className="text-sm font-medium text-gray-700">학기</Label>
            <Select value={term.toString()} onValueChange={(v) => setTerm(Number(v) as Term)}>
              <SelectTrigger id="term" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1학기</SelectItem>
                <SelectItem value="2">2학기</SelectItem>
                <SelectItem value="3">계절학기</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            추가
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default App
