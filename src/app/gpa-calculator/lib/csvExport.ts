import Papa from 'papaparse';
import type { Semester, CourseCategory, Grade, Term } from '../types';

interface CSVRow {
  학기: string;
  과목명: string;
  학점: number;
  성적: string;
  구분: string;
  'Pass/Fail': string;
}

/**
 * CSV 내보내기
 */
export function exportToCSV(semesters: Semester[]): void {
  const rows: CSVRow[] = semesters.flatMap(sem =>
    sem.courses.map(course => ({
      학기: sem.name,
      과목명: course.name,
      학점: course.credit,
      성적: course.grade,
      구분: course.category === 'major' ? '전공' :
            course.category === 'general' ? '교양' : '교직',
      'Pass/Fail': course.isPassFail ? 'Y' : 'N'
    }))
  );

  const csv = Papa.unparse(rows, {
    quotes: true,
    delimiter: ',',
    header: true
  });

  // UTF-8 BOM 추가 (엑셀 한글 호환)
  const blob = new Blob(['\uFEFF' + csv], {
    type: 'text/csv;charset=utf-8;'
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `학점데이터_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * CSV 가져오기
 */
export function importFromCSV(file: File): Promise<Semester[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<CSVRow>(file, {
      header: true,
      encoding: 'UTF-8',
      complete: (results) => {
        try {
          const semesters = groupBySemester(results.data);
          resolve(semesters);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => reject(error)
    });
  });
}

/**
 * CSV 데이터를 학기별로 그룹화
 */
function groupBySemester(rows: CSVRow[]): Semester[] {
  const semesterMap = new Map<string, Semester>();

  rows.forEach(row => {
    if (!row.학기 || !row.과목명) return;

    if (!semesterMap.has(row.학기)) {
      const [year, term] = parseSemesterName(row.학기);
      semesterMap.set(row.학기, {
        id: crypto.randomUUID(),
        name: row.학기,
        year,
        term,
        courses: []
      });
    }

    const semester = semesterMap.get(row.학기)!;
    semester.courses.push({
      id: crypto.randomUUID(),
      name: row.과목명,
      credit: Number(row.학점),
      grade: row.성적 as Grade,
      category: parseCourseCategory(row.구분),
      isPassFail: row['Pass/Fail'] === 'Y'
    });
  });

  return Array.from(semesterMap.values());
}

/**
 * "2024-1학기" → [2024, 1]
 */
function parseSemesterName(name: string): [number, Term] {
  const match = name.match(/(\d{4})-(\d)/);
  if (!match) throw new Error(`Invalid semester name: ${name}`);
  return [parseInt(match[1]), parseInt(match[2]) as Term];
}

/**
 * 과목 구분 문자열 파싱
 */
function parseCourseCategory(categoryStr: string): CourseCategory {
  if (categoryStr === '전공') return 'major';
  if (categoryStr === '교양') return 'general';
  if (categoryStr === '교직') return 'teaching';
  return 'general'; // 기본값
}

/**
 * JSON 형식으로 내보내기 (백업용)
 */
export function exportToJSON(semesters: Semester[]): void {
  const json = JSON.stringify(semesters, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `학점데이터_${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * JSON 형식으로 가져오기 (복원용)
 */
export function importFromJSON(file: File): Promise<Semester[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const semesters = JSON.parse(json) as Semester[];
        resolve(semesters);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
