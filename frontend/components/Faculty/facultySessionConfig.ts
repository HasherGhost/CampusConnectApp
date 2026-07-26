export const YEAR_OPTIONS = [
  { label: "First Year", value: 1 },
  { label: "Second Year", value: 2 },
  { label: "Third Year", value: 3 },
  { label: "Fourth Year", value: 4 },
] as const;

export const DEPARTMENT_OPTIONS = [
  { label: "Computer Science", value: 1 },
] as const;

export const SUBJECT_OPTIONS = [
  { label: "Mathematics", value: 4 },
  { label: "Physics", value: 3 },
  { label: "Chemistry", value: 5 },
  { label: "Computer Science", value: 6 },
  { label: "Electronics", value: 7 },
  { label: "Mechanics", value: 8 },
] as const;

export const SECTION_OPTIONS = [
  {
    label: "Section A",
    value: 1,
    divisionId: 1,
    division: "A",
  },
  {
    label: "Section B",
    value: 2,
    divisionId: 2,
    division: "B",
  },
  {
    label: "Section D",
    value: 3,
    divisionId: 3,
    division: "D",
  },
  {
    label: "Section E",
    value: 4,
    divisionId: 4,
    division: "E",
  },
  {
    label: "Section F",
    value: 5,
    divisionId: 5,
    division: "F",
  },
  {
    label: "Section G",
    value: 6,
    divisionId: 6,
    division: "G",
  },
  {
    label: "Section C",
    value: 8,
    divisionId: 8,
    division: "C",
  },
] as const;

// export const SECTION_OPTIONS = [
//   { label: "Section F", division: "F", divisionId: "5" },
//   { label: "Section B", division: "B", divisionId: "B" },
//   { label: "Section C", division: "C", divisionId: "C" },
//   { label: "Section D", division: "D", divisionId: "D" },
// ] as const;

export const SEMESTER_OPTIONS: Record<string, { label: string; value: number }[]> = {
  "First Year": [
    { label: "Semester 1", value: 1 },
    { label: "Semester 2", value: 2 },
  ],
  "Second Year": [
    { label: "Semester 3", value: 3 },
    { label: "Semester 4", value: 4 },
  ],
  "Third Year": [
    { label: "Semester 5", value: 5 },
    { label: "Semester 6", value: 6 },
  ],
  "Fourth Year": [
    { label: "Semester 7", value: 7 },
    { label: "Semester 8", value: 8 },
  ],
};
