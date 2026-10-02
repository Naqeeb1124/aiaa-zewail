/**
 * The American University in Cairo — undergraduate programs.
 *
 * Curated from AUC's academic program finder. Minors and the graduate-led
 * combined degrees were dropped, and the long "with Specializations in …"
 * tails were trimmed: a student's major is the program, not the track inside
 * it. Two judgement calls worth knowing about:
 *   • The Political Science / International Human Rights Law dual degree is
 *     kept, because students enter it as undergraduates (labelled BA/MA).
 *   • The Master of Organizational Leadership option is dropped; it is a
 *     graduate program, not a bachelor's.
 *
 * Keep this list as the single source of truth for the major picker and any
 * future exports. When AUC adds a program, add it here.
 */
export const AUC_DOMAIN = 'aucegypt.edu';
export const AUC_NAME = 'The American University in Cairo';

export const AUC_UNDERGRAD_PROGRAMS: string[] = [
    'Accounting',
    'Actuarial Science',
    'Anthropology',
    'Arabic Studies',
    'Architecture',
    'Biology (Nancy Hopkins Program)',
    'Business and Entrepreneurship',
    'Business in Finance',
    'Business in Marketing',
    'Chemistry',
    'Computer Engineering',
    'Computer Science',
    'Construction Engineering',
    'Data Science',
    'Economics',
    'Egyptology',
    'Electronics and Communications Engineering',
    'English and Comparative Literature',
    'Film',
    'Graphic Design',
    'History',
    'Integrated Marketing Communication',
    'Management of Information and Communication Technology (MICT)',
    'Mathematics',
    'Mechanical Engineering',
    'Middle East Studies',
    'Multimedia Communication and Journalism',
    'Music',
    'Petroleum Engineering',
    'Philosophy',
    'Physics',
    'Political Science',
    'Political Science (Honors Program)',
    'Political Science & International Human Rights Law (Dual BA/MA)',
    'Psychology',
    'Sociology',
    'Theatre',
    'Visual Arts',
];

/** True for `@aucegypt.edu` accounts (case- and whitespace-insensitive). */
export const isAucEmail = (email?: string | null): boolean =>
    (email || '').trim().toLowerCase().endsWith(`@${AUC_DOMAIN}`);
