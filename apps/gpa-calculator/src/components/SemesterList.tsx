import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@mini-apps/ui';
import { Trash2, BookOpen } from 'lucide-react';
import type { Semester, Course, GPAScale } from '../types';
import { calculateSemesterGPA } from '../lib/gpa';

interface SemesterListProps {
  semesters: Semester[];
  scale: GPAScale;
  onDeleteSemester: (semesterId: string) => void;
  onDeleteCourse: (semesterId: string, courseId: string) => void;
}

export function SemesterList({ semesters, scale, onDeleteSemester, onDeleteCourse }: SemesterListProps) {
  if (semesters.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-500">
          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>등록된 학기가 없습니다.</p>
          <p className="text-sm mt-2">새 학기를 추가하고 과목을 등록해보세요.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {semesters.map((semester) => {
        const result = calculateSemesterGPA(semester.courses, scale);

        return (
          <Card key={semester.id} className="border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-gray-900">{semester.name}</CardTitle>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                    학기 GPA: {result.gpa.toFixed(2)}
                  </Badge>
                  <Badge variant="outline" className="border-gray-300 text-gray-700">
                    이수: {result.earnedCredits}학점
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteSemester(semester.id)}
                className="hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {semester.courses.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  등록된 과목이 없습니다.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-3 px-2 font-semibold text-gray-700">과목명</th>
                        <th className="text-center py-3 px-2 font-semibold text-gray-700">학점</th>
                        <th className="text-center py-3 px-2 font-semibold text-gray-700">성적</th>
                        <th className="text-center py-3 px-2 font-semibold text-gray-700">구분</th>
                        <th className="text-center py-3 px-2 font-semibold text-gray-700">P/F</th>
                        <th className="text-center py-3 px-2 font-semibold text-gray-700"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {semester.courses.map((course) => (
                        <CourseRow
                          key={course.id}
                          course={course}
                          onDelete={() => onDeleteCourse(semester.id, course.id)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

interface CourseRowProps {
  course: Course;
  onDelete: () => void;
}

function CourseRow({ course, onDelete }: CourseRowProps) {
  const getCategoryText = (category: string) => {
    if (category === 'major') return '전공';
    if (category === 'general') return '교양';
    if (category === 'teaching') return '교직';
    return category;
  };

  const getGradeBadgeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-blue-100 text-blue-700 hover:bg-blue-200';
    if (grade.startsWith('B')) return 'bg-green-100 text-green-700 hover:bg-green-200';
    if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200';
    return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
  };

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="py-3 px-2 font-medium text-gray-900">{course.name}</td>
      <td className="text-center py-3 px-2 text-gray-700">{course.credit}</td>
      <td className="text-center py-3 px-2">
        <Badge variant="secondary" className={getGradeBadgeColor(course.grade)}>
          {course.grade}
        </Badge>
      </td>
      <td className="text-center py-3 px-2 text-xs text-gray-600">
        {getCategoryText(course.category)}
      </td>
      <td className="text-center py-3 px-2 text-xs text-gray-600">
        {course.isPassFail ? 'Y' : 'N'}
      </td>
      <td className="text-center py-3 px-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </td>
    </tr>
  );
}
