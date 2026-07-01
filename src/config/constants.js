// Full copy configurations and constants for Dr. Sam Reefath Radiology Academy

export const BRAND_NAME = 'Dr. Sam Reefath Radiology Academy';
export const CONTACT_EMAIL = 'info@samreefathradiology.com';
export const CONTACT_PHONE = '+1 (800) 555-XRAY';
export const CONTACT_ADDRESS = '100 Medical Center Parkway, Imaging Wing Suite A, New York, NY';

export const NAVIGATION_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Courses', href: '#courses' },
  { label: 'Faculty', href: '#faculty' },
  { label: 'Resources', href: '#resources' },
  { label: 'About Us', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

export const WHY_CHOOSE_US = [
  {
    title: 'Expert Faculty',
    description: 'Learn directly from board-certified, actively practicing radiology consultants and educators.',
    icon: 'faculty'
  },
  {
    title: 'Exam Focused Learning',
    description: 'Highly calibrated courses mapped perfectly to current MDRD, DNB, DMRD, and FRCR exam formats.',
    icon: 'exam'
  },
  {
    title: 'Case-Based Discussions',
    description: 'Develop clinical reasoning by exploring thousands of authentic diagnostic scan worksheets.',
    icon: 'cases'
  },
  {
    title: 'Flexible Learning',
    description: 'Access high-quality live interactive webinars or watch on-demand recordings from any device.',
    icon: 'flexible'
  },
  {
    title: 'Performance Tracking',
    description: 'Review detailed mock analytics, heatmaps, and diagnostic metrics to target weak areas.',
    icon: 'clinical'
  },
  {
    title: 'Clinical Experience',
    description: 'Bridging the gap between exam syllabus theory and actual daily clinical reporting workflow.',
    icon: 'clinical'
  },
  {
    title: 'Accredited Programs',
    description: 'Accredited certificates of completion to boost your professional residency resume.',
    icon: 'global'
  },
  {
    title: 'Global Access',
    description: 'Join a vibrant international community of radiology residents, fellows, and practicing doctors.',
    icon: 'global'
  }
];

export const FEATURED_COURSES = [
  {
    id: 'frcr-1',
    title: 'FRCR Part 1 Preparation',
    description: 'Comprehensive mastery of clinical physics and anatomy. Includes mock exams and interactive hot seats.',
    duration: '12 Weeks Program',
    imageType: 'physics',
    price: '$349',
    rating: 4.9
  },
  {
    id: 'frcr-2a',
    title: 'FRCR Part 2A Comprehensive',
    description: 'Deep dive into systemic radiology. Advanced modular questions matching the RCR guidelines.',
    duration: '16 Weeks Program',
    imageType: 'systemic',
    price: '$499',
    rating: 4.8
  },
  {
    id: 'frcr-2b',
    title: 'FRCR Part 2B Masterclass',
    description: 'Rapid reporting, long cases, and intense mock viva-voce exams with real-time advisor feedback.',
    duration: '8 Weeks Intensive',
    imageType: 'viva',
    price: '$599',
    rating: 5.0
  },
  {
    id: 'dnb-mdrd',
    title: 'DNB / MDRD Board Preparation',
    description: 'Tailored specifically for local board postgraduates. High-yield theory summaries and clinical cases.',
    duration: '24 Weeks Comprehensive',
    imageType: 'board',
    price: '$449',
    rating: 4.9
  },
  {
    id: 'anatomy-mod',
    title: 'Anatomy Specialty Module',
    description: 'Detailed imaging anatomy of the brain, spine, chest, abdomen, pelvis, and musculoskeletal systems.',
    duration: '6 Weeks Focused',
    imageType: 'anatomy',
    price: '$199',
    rating: 4.7
  },
  {
    id: 'pathology-lib',
    title: 'Pathology Interactive Library',
    description: 'Correlating diagnostic signs with pathophysiological schemas. Over 1,200 curated cases.',
    duration: 'Self-Paced Library',
    imageType: 'pathology',
    price: '$299',
    rating: 4.9
  }
];

export const LIVE_CLASSES_FEATURES = [
  {
    title: 'Zoom Live Classes',
    description: 'Join real-time webinars with interactive board mock discussions and clinical case hot seats.'
  },
  {
    title: 'Recorded Sessions',
    description: 'Never miss a class. High-definition cloud archives accessible immediately after the live broadcast.'
  },
  {
    title: 'Flexible Timing',
    description: 'Multiple batch timings scheduled to accommodate global students working active residency shifts.'
  },
  {
    title: 'Expert Faculty Sessions',
    description: 'Special guest lectures by leading subspecialist radiodiagnosis consultants and examiners.'
  }
];

export const CASE_STUDIES = [
  {
    title: 'Brain MRI Cases',
    description: 'Advanced neuroimaging cases focusing on stroke patterns, tumor staging, and demyelinating plaques.',
    imageType: 'brain-mri',
    caseCount: '180+ Scans'
  },
  {
    title: 'CT Scan Directory',
    description: 'High-speed multidetector CT diagnostics, body imaging, acute trauma pathways, and CT angiographies.',
    imageType: 'ct-scan',
    caseCount: '250+ Scans'
  },
  {
    title: 'Ultrasound masterclass',
    description: 'Point-of-care ultrasound, Doppler hemodynamics, obstetrics, and high-resolution MSK reporting guidelines.',
    imageType: 'ultrasound',
    caseCount: '120+ Scans'
  },
  {
    title: 'Diagnostic Cases',
    description: 'Classic signs in chest X-rays, abdominal plain films, and mammography screening interpretations.',
    imageType: 'general-diag',
    caseCount: '300+ Scans'
  },
  {
    title: 'Interactive PACS Learning',
    description: 'Access full DICOM image stacks using our proprietary web-based PACS simulator overlay tools.',
    imageType: 'pacs-learning',
    caseCount: '50+ DICOM Stacks'
  }
];

export const FACULTY_MEMBERS = [
  {
    name: 'Dr. Sam Reefath',
    role: 'Founder & Chief Radiodiagnosis Mentor',
    specialization: 'Neuroradiology & Body Imaging Specialist',
    experience: '15+ Years Clinical & Academic Experience',
    bio: 'Pioneer in clinical radiology prep with over a decade of experience guiding thousands of residents to secure top ranks globally.'
  },
  {
    name: 'Dr. Sarah Jenkins',
    role: 'Senior Academic Consultant',
    specialization: 'Pediatric Radiology & Musculoskeletal Imaging',
    experience: '12+ Years Clinical Practice',
    bio: 'Former FRCR examiner dedicated to clarifying core physics, anatomy parameters, and rapid-reporting strategies.'
  },
  {
    name: 'Prof. Marcus Vance',
    role: 'Lead Physics Instructor',
    specialization: 'Medical Imaging Physics & Dosimetry',
    experience: '20+ Years Research & Teaching',
    bio: 'Author of prominent radiology physics digests, specializing in simplifying complex electromagnetic and nuclear magnetic theories.'
  }
];

export const STUDENT_TESTIMONIALS = [
  {
    name: 'Dr. Amit Patel',
    role: 'FRCR Part 2B Graduate (Gold Medalist)',
    quote: 'The case-based live viva-voce webinars were identical to the real board exams. The mentors detailed exactly how to structure reports under high stress.',
    rating: 5,
    location: 'London, UK'
  },
  {
    name: 'Dr. Clara Thorne',
    role: 'Diagnostic Radiology Resident',
    quote: 'Having the high-definition recording library was a lifesaver. I could review complex neuroradiology scans right before my clinical reporting shifts.',
    rating: 5,
    location: 'Melbourne, Australia'
  },
  {
    name: 'Dr. Kareem Al-Farsi',
    role: 'DNB Radiology Consultant',
    quote: 'The Pathology Interactive Library helped me clear my theory exams with flying colors. Highly recommended for any serious radiology postgraduate.',
    rating: 5,
    location: 'Dubai, UAE'
  }
];

export const LEARNING_FEATURES = [
  {
    title: 'Daily MCQs',
    description: 'High-yield multiple choice questions with detailed explanation keys sent to your inbox.',
    icon: 'mcq'
  },
  {
    title: 'Anatomy Viewer',
    description: 'Explore high-resolution tagged cross-sectional MRI & CT slices to master normal variants.',
    icon: 'viewer'
  },
  {
    title: 'Pathology Library',
    description: 'A massive curated repository of pathognomonic diagnostic radiology signs and differentials.',
    icon: 'path'
  },
  {
    title: 'Interactive Flashcards',
    description: 'Anki-style active recall cards covering physics, radio-anatomy, and syndromic pathologies.',
    icon: 'cards'
  },
  {
    title: 'Mock Exams',
    description: 'Simulated exam environments with ticking timers to match actual RCR and board conditions.',
    icon: 'mocks'
  },
  {
    title: 'Progress Tracking',
    description: 'Detailed heatmaps, mock score analytics, and study time telemetry to review focus areas.',
    icon: 'tracking'
  },
  {
    title: 'Reporting Templates',
    description: 'Structured report formats matching ACR guidelines to draft consistent, professional reads.',
    icon: 'reports'
  },
  {
    title: 'Protocol Guidelines',
    description: 'Standard CT/MRI protocols for optimal scanning sequences across clinical scenarios.',
    icon: 'protocols'
  }
];

export const ACADEMY_STATISTICS = [
  { count: '10,000+', label: 'Students Enrolled' },
  { count: '24+', label: 'Premium Courses' },
  { count: '15+', label: 'Faculty & Mentors' },
  { count: '5,000+', label: 'Case Studies' },
  { count: '98.4%', label: 'Success Rate' }
];

export const FAQS = [
  {
    question: 'How are the live viva-voce mock sessions conducted?',
    answer: 'Our live mock sessions are held weekly via private high-bandwidth Zoom integrations. Students are invited to the "hot seat" where they analyze un-labeled scans under exam-standard timers while a mentor provides real-time structured critiques.'
  },
  {
    question: 'Can I access the course resources on my mobile phone?',
    answer: 'Absolutely. The entire Sam Reefath Academy platform is built on modern mobile-first responsive architecture. You can study, review interactive case stacks, and practice flashcards on any iOS, Android, or tablet device.'
  },
  {
    question: 'What is the duration of access for the Pathology Library?',
    answer: 'Enrollment in any premium course includes 12 months of full, unlimited access to the entire Pathology Library. Self-paced standalone library subscriptions can also be renewed annually.'
  },
  {
    question: 'Are there group discounts available for radiology departments?',
    answer: 'Yes, we partner with university medical centers, clinical departments, and radiology societies globally. Reach out through our contact form to discuss custom institutional seats.'
  }
];
