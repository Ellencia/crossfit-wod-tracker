export const MUSCLE_NAMES = {
  'trapezius':      '승모근',
  'upper-back':     '광배근',
  'lower-back':     '척추기립근',
  'chest':          '대흉근',
  'biceps':         '이두근',
  'triceps':        '삼두근',
  'forearm':        '전완근',
  'back-deltoids':  '후면 삼각근',
  'front-deltoids': '전면 삼각근',
  'abs':            '복근',
  'obliques':       '복사근',
  'adductor':       '내전근',
  'hamstring':      '햄스트링',
  'quadriceps':     '대퇴사두근',
  'abductors':      '외전근',
  'calves':         '종아리',
  'gluteal':        '둔근',
  'tibialis':       '전경골근',
};

export const CATEGORIES = ['전체', '올림픽 리프팅', '바벨', '체조', '맨몸', '유산소', '케틀벨/덤벨'];

// muscles: { muscleId: 'high' | 'medium' | 'low' }
export const EXERCISES = [
  // ── 올림픽 리프팅 ──────────────────────────────────────────
  {
    id: 'clean', name: 'Clean', nameKo: '클린', category: '올림픽 리프팅',
    muscles: { quadriceps:'high', gluteal:'high', hamstring:'high', trapezius:'high', 'upper-back':'high', 'lower-back':'high', calves:'medium', forearm:'medium', abs:'medium' },
  },
  {
    id: 'power_clean', name: 'Power Clean', nameKo: '파워 클린', category: '올림픽 리프팅',
    muscles: { quadriceps:'high', gluteal:'high', hamstring:'high', trapezius:'high', 'upper-back':'medium', 'lower-back':'high', calves:'high', forearm:'medium', abs:'low' },
  },
  {
    id: 'hang_clean', name: 'Hang Clean', nameKo: '행 클린', category: '올림픽 리프팅',
    muscles: { quadriceps:'high', gluteal:'high', hamstring:'high', trapezius:'high', 'upper-back':'medium', 'lower-back':'medium', forearm:'medium', abs:'medium' },
  },
  {
    id: 'hang_power_clean', name: 'Hang Power Clean', nameKo: '행 파워 클린', category: '올림픽 리프팅',
    muscles: { quadriceps:'high', gluteal:'high', hamstring:'high', trapezius:'high', 'lower-back':'medium', calves:'high', forearm:'medium' },
  },
  {
    id: 'clean_pull', name: 'Clean Pull', nameKo: '클린 풀', category: '올림픽 리프팅',
    muscles: { quadriceps:'high', gluteal:'high', hamstring:'high', 'lower-back':'high', trapezius:'high', calves:'medium', abs:'low' },
  },
  {
    id: 'snatch', name: 'Snatch', nameKo: '스내치', category: '올림픽 리프팅',
    muscles: { quadriceps:'high', gluteal:'high', hamstring:'high', trapezius:'high', 'upper-back':'medium', 'lower-back':'high', 'front-deltoids':'medium', 'back-deltoids':'medium', triceps:'medium', abs:'medium', calves:'medium' },
  },
  {
    id: 'power_snatch', name: 'Power Snatch', nameKo: '파워 스내치', category: '올림픽 리프팅',
    muscles: { quadriceps:'high', gluteal:'high', hamstring:'high', trapezius:'high', 'lower-back':'high', calves:'high', 'front-deltoids':'medium', triceps:'medium', abs:'low' },
  },
  {
    id: 'hang_snatch', name: 'Hang Snatch', nameKo: '행 스내치', category: '올림픽 리프팅',
    muscles: { quadriceps:'high', gluteal:'high', hamstring:'high', trapezius:'high', 'lower-back':'medium', 'front-deltoids':'medium', triceps:'medium', forearm:'medium' },
  },
  {
    id: 'snatch_pull', name: 'Snatch Pull', nameKo: '스내치 풀', category: '올림픽 리프팅',
    muscles: { quadriceps:'high', gluteal:'high', hamstring:'high', 'lower-back':'high', trapezius:'high', calves:'medium' },
  },
  {
    id: 'clean_and_jerk', name: 'Clean & Jerk', nameKo: '클린 앤 저크', category: '올림픽 리프팅',
    muscles: { quadriceps:'high', gluteal:'high', hamstring:'high', trapezius:'high', 'upper-back':'high', 'lower-back':'high', 'front-deltoids':'high', triceps:'high', abs:'medium', calves:'medium', forearm:'medium' },
  },
  {
    id: 'push_jerk', name: 'Push Jerk', nameKo: '푸시 저크', category: '올림픽 리프팅',
    muscles: { 'front-deltoids':'high', triceps:'high', quadriceps:'medium', gluteal:'medium', trapezius:'medium', abs:'medium', calves:'medium' },
  },
  {
    id: 'split_jerk', name: 'Split Jerk', nameKo: '스플릿 저크', category: '올림픽 리프팅',
    muscles: { 'front-deltoids':'high', triceps:'high', quadriceps:'high', gluteal:'medium', adductor:'medium', trapezius:'medium', abs:'medium' },
  },
  {
    id: 'overhead_squat', name: 'Overhead Squat', nameKo: '오버헤드 스쿼트', category: '올림픽 리프팅',
    muscles: { quadriceps:'high', gluteal:'high', hamstring:'medium', abs:'high', 'lower-back':'medium', 'front-deltoids':'medium', 'back-deltoids':'medium', triceps:'medium', trapezius:'medium' },
  },

  // ── 바벨 ───────────────────────────────────────────────────
  {
    id: 'back_squat', name: 'Back Squat', nameKo: '백 스쿼트', category: '바벨',
    muscles: { quadriceps:'high', gluteal:'high', hamstring:'medium', 'lower-back':'medium', abs:'medium', adductor:'medium', calves:'low' },
  },
  {
    id: 'front_squat', name: 'Front Squat', nameKo: '프론트 스쿼트', category: '바벨',
    muscles: { quadriceps:'high', gluteal:'high', hamstring:'medium', abs:'high', 'lower-back':'medium', adductor:'medium' },
  },
  {
    id: 'thruster', name: 'Thruster', nameKo: '스러스터', category: '바벨',
    muscles: { quadriceps:'high', gluteal:'high', hamstring:'medium', 'front-deltoids':'high', triceps:'high', abs:'medium', 'lower-back':'medium', trapezius:'low' },
  },
  {
    id: 'deadlift', name: 'Deadlift', nameKo: '데드리프트', category: '바벨',
    muscles: { gluteal:'high', hamstring:'high', quadriceps:'medium', 'lower-back':'high', 'upper-back':'medium', trapezius:'medium', forearm:'medium' },
  },
  {
    id: 'romanian_deadlift', name: 'Romanian Deadlift', nameKo: '루마니안 데드리프트', category: '바벨',
    muscles: { hamstring:'high', gluteal:'high', 'lower-back':'high', 'upper-back':'medium', forearm:'low' },
  },
  {
    id: 'sumo_deadlift', name: 'Sumo Deadlift', nameKo: '스모 데드리프트', category: '바벨',
    muscles: { gluteal:'high', adductor:'high', hamstring:'high', quadriceps:'medium', 'lower-back':'medium', 'upper-back':'medium' },
  },
  {
    id: 'push_press', name: 'Push Press', nameKo: '푸시 프레스', category: '올림픽 리프팅',
    muscles: { 'front-deltoids':'high', triceps:'high', quadriceps:'medium', gluteal:'medium', trapezius:'medium', abs:'low' },
  },
  {
    id: 'strict_press', name: 'Strict Press', nameKo: '스트릭 프레스', category: '바벨',
    muscles: { 'front-deltoids':'high', triceps:'high', trapezius:'medium', abs:'medium', 'upper-back':'low' },
  },
  {
    id: 'bench_press', name: 'Bench Press', nameKo: '벤치 프레스', category: '바벨',
    muscles: { chest:'high', triceps:'high', 'front-deltoids':'medium', 'back-deltoids':'low' },
  },
  {
    id: 'barbell_row', name: 'Barbell Row', nameKo: '바벨 로우', category: '바벨',
    muscles: { 'upper-back':'high', 'lower-back':'high', biceps:'high', 'back-deltoids':'medium', forearm:'medium' },
  },
  {
    id: 'pendlay_row', name: 'Pendlay Row', nameKo: '펜들레이 로우', category: '바벨',
    muscles: { 'upper-back':'high', 'lower-back':'high', biceps:'high', 'back-deltoids':'medium', forearm:'medium', trapezius:'medium' },
  },
  {
    id: 'good_morning', name: 'Good Morning', nameKo: '굿모닝', category: '바벨',
    muscles: { hamstring:'high', 'lower-back':'high', gluteal:'medium', abs:'medium' },
  },

  // ── 체조 ───────────────────────────────────────────────────
  {
    id: 'pullup', name: 'Pull-up', nameKo: '풀업', category: '체조',
    muscles: { 'upper-back':'high', biceps:'high', 'back-deltoids':'medium', forearm:'medium', abs:'low', 'lower-back':'low' },
  },
  {
    id: 'ctb_pullup', name: 'Chest-to-Bar Pull-up', nameKo: 'CTB 풀업', category: '체조',
    muscles: { 'upper-back':'high', biceps:'high', 'back-deltoids':'high', forearm:'medium', abs:'medium' },
  },
  {
    id: 'bar_muscle_up', name: 'Bar Muscle-up', nameKo: '바 머슬업', category: '체조',
    muscles: { 'upper-back':'high', biceps:'high', chest:'medium', triceps:'high', 'back-deltoids':'medium', abs:'medium', forearm:'medium' },
  },
  {
    id: 'ring_muscle_up', name: 'Ring Muscle-up', nameKo: '링 머슬업', category: '체조',
    muscles: { 'upper-back':'high', biceps:'high', chest:'high', triceps:'high', 'back-deltoids':'medium', abs:'medium', forearm:'high' },
  },
  {
    id: 'ring_dip', name: 'Ring Dip', nameKo: '링딥', category: '체조',
    muscles: { triceps:'high', chest:'high', 'front-deltoids':'medium', abs:'medium', forearm:'medium' },
  },
  {
    id: 'dip', name: 'Dip', nameKo: '딥', category: '체조',
    muscles: { triceps:'high', chest:'high', 'front-deltoids':'medium' },
  },
  {
    id: 'hspu', name: 'Handstand Push-up (HSPU)', nameKo: 'HSPU', category: '체조',
    muscles: { 'front-deltoids':'high', triceps:'high', trapezius:'high', 'upper-back':'medium', abs:'medium' },
  },
  {
    id: 'handstand_walk', name: 'Handstand Walk', nameKo: '핸드스탠드 워크', category: '체조',
    muscles: { 'front-deltoids':'high', triceps:'medium', trapezius:'medium', abs:'high', 'upper-back':'medium', forearm:'medium' },
  },
  {
    id: 'toes_to_bar', name: 'Toes-to-Bar (T2B)', nameKo: 'T2B', category: '체조',
    muscles: { abs:'high', obliques:'high', 'lower-back':'medium', forearm:'medium', 'upper-back':'low' },
  },
  {
    id: 'knees_to_elbow', name: 'Knees-to-Elbow (K2E)', nameKo: 'K2E', category: '체조',
    muscles: { abs:'high', obliques:'medium', forearm:'medium', 'upper-back':'low' },
  },
  {
    id: 'ring_row', name: 'Ring Row', nameKo: '링 로우', category: '체조',
    muscles: { 'upper-back':'high', biceps:'medium', 'back-deltoids':'medium', forearm:'medium' },
  },
  {
    id: 'rope_climb', name: 'Rope Climb', nameKo: '로프 클라임', category: '체조',
    muscles: { biceps:'high', 'upper-back':'high', forearm:'high', 'back-deltoids':'medium', abs:'medium' },
  },
  {
    id: 'ghd_situp', name: 'GHD Sit-up', nameKo: 'GHD 싯업', category: '체조',
    muscles: { abs:'high', quadriceps:'medium', 'lower-back':'medium' },
  },
  {
    id: 'back_extension', name: 'Back Extension', nameKo: '백 익스텐션', category: '체조',
    muscles: { 'lower-back':'high', gluteal:'medium', hamstring:'medium' },
  },
  {
    id: 'lsit', name: 'L-sit', nameKo: '엘싯', category: '체조',
    muscles: { abs:'high', triceps:'medium', forearm:'medium', quadriceps:'medium' },
  },

  // ── 맨몸 ───────────────────────────────────────────────────
  {
    id: 'pushup', name: 'Push-up', nameKo: '푸시업', category: '맨몸',
    muscles: { chest:'high', triceps:'high', 'front-deltoids':'medium', abs:'medium' },
  },
  {
    id: 'air_squat', name: 'Air Squat', nameKo: '에어 스쿼트', category: '맨몸',
    muscles: { quadriceps:'medium', gluteal:'medium', hamstring:'low', calves:'low' },
  },
  {
    id: 'pistol_squat', name: 'Pistol Squat', nameKo: '피스톨 스쿼트', category: '맨몸',
    muscles: { quadriceps:'high', gluteal:'high', hamstring:'medium', abs:'medium', calves:'medium' },
  },
  {
    id: 'box_jump', name: 'Box Jump', nameKo: '박스 점프', category: '맨몸',
    muscles: { quadriceps:'high', gluteal:'high', hamstring:'medium', calves:'high', abs:'low' },
  },
  {
    id: 'box_step_up', name: 'Box Step-up', nameKo: '박스 스텝업', category: '맨몸',
    muscles: { quadriceps:'high', gluteal:'high', hamstring:'medium' },
  },
  {
    id: 'box_jump_over', name: 'Box Jump Over', nameKo: '박스 점프 오버', category: '맨몸',
    muscles: { quadriceps:'high', gluteal:'high', hamstring:'medium', calves:'high', abs:'medium' },
  },
  {
    id: 'burpee', name: 'Burpee', nameKo: '버피', category: '맨몸',
    muscles: { chest:'medium', triceps:'medium', quadriceps:'medium', gluteal:'medium', abs:'medium', 'front-deltoids':'low' },
  },
  {
    id: 'situp', name: 'Sit-up', nameKo: '싯업', category: '맨몸',
    muscles: { abs:'high', obliques:'medium' },
  },
  {
    id: 'lunge', name: 'Lunge', nameKo: '런지', category: '맨몸',
    muscles: { quadriceps:'high', gluteal:'high', hamstring:'medium', adductor:'medium', calves:'low' },
  },
  {
    id: 'wall_ball', name: 'Wall Ball', nameKo: '월볼', category: '맨몸',
    muscles: { quadriceps:'high', gluteal:'high', hamstring:'medium', 'front-deltoids':'medium', triceps:'medium', abs:'medium' },
  },
  {
    id: 'wall_walk', name: 'Wall Walk', nameKo: '월워크', category: '맨몸',
    muscles: { 'front-deltoids':'high', triceps:'high', abs:'high', chest:'medium', 'upper-back':'medium' },
  },
  {
    id: 'double_under', name: 'Double Under', nameKo: '더블언더', category: '맨몸',
    muscles: { calves:'high', forearm:'medium', abs:'low', tibialis:'low' },
  },
  {
    id: 'jump_rope', name: 'Jump Rope', nameKo: '줄넘기', category: '맨몸',
    muscles: { calves:'medium', forearm:'low', abs:'low' },
  },
  {
    id: 'farmers_carry', name: "Farmer's Carry", nameKo: '파머스 캐리', category: '맨몸',
    muscles: { forearm:'high', trapezius:'high', abs:'medium', 'lower-back':'medium', quadriceps:'low' },
  },

  // ── 유산소 ─────────────────────────────────────────────────
  {
    id: 'running', name: 'Running', nameKo: '달리기', category: '유산소',
    muscles: { quadriceps:'medium', hamstring:'medium', gluteal:'medium', calves:'high', tibialis:'medium', abs:'low' },
  },
  {
    id: 'rowing', name: 'Rowing (Erg)', nameKo: '로잉', category: '유산소',
    muscles: { 'upper-back':'high', 'lower-back':'high', quadriceps:'high', gluteal:'medium', hamstring:'medium', biceps:'medium', forearm:'medium', abs:'medium' },
  },
  {
    id: 'assault_bike', name: 'Assault Bike / Echo Bike', nameKo: '어설트 바이크', category: '유산소',
    muscles: { quadriceps:'high', hamstring:'high', gluteal:'medium', calves:'medium', 'front-deltoids':'medium', triceps:'medium', 'upper-back':'medium' },
  },
  {
    id: 'ski_erg', name: 'Ski Erg', nameKo: '스키 에르그', category: '유산소',
    muscles: { 'upper-back':'high', 'back-deltoids':'high', abs:'high', 'lower-back':'medium', triceps:'medium', biceps:'medium', obliques:'medium' },
  },

  // ── 케틀벨 / 덤벨 ──────────────────────────────────────────
  {
    id: 'kb_swing', name: 'Kettlebell Swing', nameKo: 'KB 스윙', category: '케틀벨/덤벨',
    muscles: { gluteal:'high', hamstring:'high', 'lower-back':'high', abs:'medium', 'upper-back':'medium', forearm:'medium', quadriceps:'low' },
  },
  {
    id: 'kb_clean', name: 'Kettlebell Clean', nameKo: 'KB 클린', category: '케틀벨/덤벨',
    muscles: { gluteal:'high', hamstring:'high', 'lower-back':'medium', 'upper-back':'medium', forearm:'high', biceps:'medium' },
  },
  {
    id: 'kb_snatch', name: 'Kettlebell Snatch', nameKo: 'KB 스내치', category: '케틀벨/덤벨',
    muscles: { gluteal:'high', hamstring:'high', 'lower-back':'medium', 'front-deltoids':'high', 'upper-back':'medium', forearm:'high', abs:'medium' },
  },
  {
    id: 'turkish_getup', name: 'Turkish Get-up', nameKo: '터키시 겟업', category: '케틀벨/덤벨',
    muscles: { abs:'high', obliques:'high', gluteal:'medium', 'front-deltoids':'high', quadriceps:'medium', 'lower-back':'medium' },
  },
  {
    id: 'kb_press', name: 'Kettlebell Press', nameKo: 'KB 프레스', category: '케틀벨/덤벨',
    muscles: { 'front-deltoids':'high', triceps:'high', abs:'medium', trapezius:'medium' },
  },
  {
    id: 'db_snatch', name: 'Dumbbell Snatch', nameKo: 'DB 스내치', category: '케틀벨/덤벨',
    muscles: { gluteal:'high', hamstring:'high', 'front-deltoids':'high', 'lower-back':'medium', 'upper-back':'medium', forearm:'high' },
  },
  {
    id: 'db_thruster', name: 'Dumbbell Thruster', nameKo: 'DB 스러스터', category: '케틀벨/덤벨',
    muscles: { quadriceps:'high', gluteal:'high', hamstring:'medium', 'front-deltoids':'high', triceps:'high', abs:'medium' },
  },
  {
    id: 'db_clean_jerk', name: 'Dumbbell Clean & Jerk', nameKo: 'DB 클린 앤 저크', category: '케틀벨/덤벨',
    muscles: { quadriceps:'high', gluteal:'high', hamstring:'high', 'front-deltoids':'high', triceps:'high', 'lower-back':'medium', 'upper-back':'medium' },
  },
  {
    id: 'devils_press', name: "Devil's Press", nameKo: '데빌스 프레스', category: '케틀벨/덤벨',
    muscles: { gluteal:'high', hamstring:'high', chest:'medium', 'front-deltoids':'high', triceps:'medium', abs:'medium', 'lower-back':'medium' },
  },
];

const INTENSITY_RANK = { high: 3, medium: 2, low: 1 };

export function combineExercises(exercises) {
  const combined = {};

  exercises.forEach(ex => {
    Object.entries(ex.muscles).forEach(([muscleId, intensity]) => {
      if (!combined[muscleId] || INTENSITY_RANK[intensity] > INTENSITY_RANK[combined[muscleId]]) {
        combined[muscleId] = intensity;
      }
    });
  });

  return Object.entries(combined).map(([muscleId, intensity]) => ({
    name: MUSCLE_NAMES[muscleId] || muscleId,
    muscleIds: [muscleId],
    intensity,
  }));
}
