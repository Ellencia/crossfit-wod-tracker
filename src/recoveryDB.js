// 근육별 회복 방법 DB
// high intensity 근육 → 상세, medium → 간략 표시
export const RECOVERY = {
  quadriceps: {
    name: '대퇴사두근',
    stretch: '런지 자세로 앞무릎 90° 유지, 뒷발 발목을 잡아 허벅지 앞쪽을 30초 이상 스트레칭',
    foamRoller: '엎드려 허벅지 앞쪽에 롤러를 대고, 무릎 위부터 골반 아래까지 천천히 롤링 (1~2분)',
    massageGun: '허벅지 앞쪽 근위부→원위부 방향, 중간 강도로 60~90초',
  },
  hamstring: {
    name: '햄스트링',
    stretch: '바닥에 앉아 다리를 펴고 발끝을 당기며 상체를 천천히 앞으로 숙이기 (30초)',
    foamRoller: '앉은 자세로 허벅지 뒤쪽에 롤러를 대고 체중을 실어 천천히 이동 (1~2분)',
    massageGun: '허벅지 뒤쪽 중앙부를 위아래로, 무릎 뒤 오금은 피해서 적용',
  },
  gluteal: {
    name: '둔근',
    stretch: '누운 자세에서 한쪽 무릎을 가슴 쪽으로 당기거나 피전 스트레칭 (30초씩 양측)',
    foamRoller: '앉은 자세로 한쪽 엉덩이에 롤러를 대고 체중을 실어 원을 그리듯 롤링',
    massageGun: '엉덩이 중앙부를 중간~강 강도로 60~90초, 골반 뼈 근처는 피하기',
  },
  'lower-back': {
    name: '척추기립근',
    stretch: '무릎을 가슴에 끌어안는 자세로 허리를 이완 (차일드 포즈 30초)',
    foamRoller: '등 아래쪽에 롤러를 대고 좌우로 무게 이동하며 롤링, 허리뼈(요추) 직접 압박은 피하기',
    massageGun: '척추 양옆 기립근에만 적용, 척추뼈 위는 피하기. 약한 강도로 위아래 이동',
  },
  'upper-back': {
    name: '광배근',
    stretch: '문틀이나 랙을 잡고 몸을 뒤로 기울여 옆구리·등 늘리기 (30초씩)',
    foamRoller: '등 위쪽에 롤러를 가로로 대고 팔을 머리 위로 뻗어 흉추 가동성 확보 (1분)',
    massageGun: '겨드랑이 아래 옆구리부터 허리 방향으로, 중간 강도로 60초',
  },
  trapezius: {
    name: '승모근',
    stretch: '한 손을 등 뒤로, 반대 손으로 머리를 옆으로 당겨 목~어깨 스트레칭 (20초씩)',
    foamRoller: '등 위쪽 가로 방향으로 롤러를 대고 흉추 마디마디를 풀어주기',
    massageGun: '승모근 상부(어깨~목)를 약~중 강도로 좌우 이동, 경추 근처는 약하게',
  },
  'front-deltoids': {
    name: '전면 삼각근',
    stretch: '팔을 등 뒤로 모아 가슴을 열어주는 스트레칭, 또는 문틀에 팔을 대고 앞으로 기울이기 (30초)',
    foamRoller: '어깨 전면에 폼롤러 적용은 어려우므로 테니스볼을 대고 벽에 기대어 압박',
    massageGun: '어깨 앞쪽 삼각근 전면부를 약 강도로 30~60초',
  },
  'back-deltoids': {
    name: '후면 삼각근',
    stretch: '팔을 반대쪽 어깨 방향으로 당겨 후면 삼각근 스트레칭 (20초씩)',
    foamRoller: '팔을 앞으로 뻗고 어깨 뒤쪽에 롤러를 대어 옆으로 누워 롤링',
    massageGun: '어깨 뒤쪽을 약~중 강도로 원을 그리듯 적용',
  },
  triceps: {
    name: '삼두근',
    stretch: '팔을 머리 위로 들어 팔꿈치를 구부리고 반대 손으로 팔꿈치를 당기기 (20초씩)',
    foamRoller: '팔 뒤쪽에 롤러를 대고 팔꿈치~어깨 방향으로 천천히 이동',
    massageGun: '팔꿈치 위 삼두근 중앙부를 약 강도로 위아래 이동, 팔꿈치 관절은 피하기',
  },
  biceps: {
    name: '이두근',
    stretch: '팔을 뒤로 펴고 손바닥이 위를 향하도록 회전시켜 이두근 스트레칭 (20초)',
    foamRoller: '엎드려 팔 앞쪽에 롤러를 대고 가볍게 롤링',
    massageGun: '상완 앞쪽을 약 강도로 60초, 팔꿈치 안쪽 관절은 피하기',
  },
  forearm: {
    name: '전완근',
    stretch: '팔을 앞으로 뻗어 손목을 위아래로 꺾어 전완 굴근·신근 스트레칭 (20초씩)',
    foamRoller: '전완을 롤러 위에 올리고 가볍게 체중을 실어 롤링',
    massageGun: '전완 전체를 약 강도로 위아래 방향으로 60초',
  },
  abs: {
    name: '복근',
    stretch: '코브라 자세로 엎드려 팔을 펴고 복부를 늘리기 (20~30초)',
    foamRoller: '복부 직접 롤링은 장기 압박 우려로 비권장, 흉추 이완으로 간접 완화',
    massageGun: '복부 직접 사용 비권장, 주변 옆구리 근육에만 약 강도로 적용',
  },
  obliques: {
    name: '복사근',
    stretch: '서서 한 팔을 머리 위로 뻗고 반대 방향으로 상체를 옆으로 기울이기 (20초씩)',
    foamRoller: '옆으로 누워 옆구리에 롤러를 대고 위아래로 천천히 롤링',
    massageGun: '옆구리를 약 강도로 위아래 방향으로 30~60초',
  },
  calves: {
    name: '종아리',
    stretch: '발뒤꿈치를 바닥에 붙이고 벽에 기대어 종아리 스트레칭 (30초씩, 무릎 펴고/구부려 각각)',
    foamRoller: '앉아서 종아리 아래에 롤러를 대고 체중을 실어 발목부터 무릎 아래까지 롤링',
    massageGun: '종아리 중앙부를 중간 강도로 위아래 60~90초, 아킬레스건 부위는 약하게',
  },
  adductor: {
    name: '내전근',
    stretch: '바닥에 앉아 발바닥을 맞대는 나비 자세로 무릎을 눌러 스트레칭 (30초)',
    foamRoller: '엎드려 허벅지 안쪽에 롤러를 대고 서혜부~무릎 방향으로 롤링',
    massageGun: '허벅지 안쪽을 약~중 강도로, 서혜부(사타구니) 근처는 피하기',
  },
  abductors: {
    name: '외전근',
    stretch: '다리를 꼬아 앉아 무릎을 반대 방향으로 당기거나, IT밴드 스트레칭',
    foamRoller: '옆으로 누워 허벅지 옆면(IT밴드)에 롤러를 대고 골반~무릎까지 롤링',
    massageGun: '허벅지 바깥쪽을 중간 강도로 위아래 방향으로 60초',
  },
  tibialis: {
    name: '전경골근',
    stretch: '무릎을 꿇고 앉아 발등이 바닥에 닿도록 체중을 실어 정강이 앞쪽 스트레칭 (20초)',
    foamRoller: '정강이 앞쪽에 롤러를 대고 가볍게 롤링 (뼈 위는 피하기)',
    massageGun: '정강이 뼈 바깥쪽 근육에만 약 강도로 적용',
  },
  chest: {
    name: '대흉근',
    stretch: '문틀에 팔을 대고 앞으로 기울여 가슴 전체를 열어주기 (30초)',
    foamRoller: '세로로 롤러를 등 뒤에 대고 누워 팔을 양쪽으로 벌려 가슴 이완',
    massageGun: '가슴 근육을 약~중 강도로, 유두 및 흉골 주위는 피하기',
  },
};

export function getRecoveryAdvice(muscles) {
  const intensityRank = { high: 3, medium: 2, low: 1 };

  return muscles
    .filter(m => m.intensity !== 'low') // 저강도는 생략
    .flatMap(m => m.muscleIds)
    .filter((id, i, arr) => arr.indexOf(id) === i) // 중복 제거
    .map(id => ({ id, muscle: muscles.find(m => m.muscleIds.includes(id)), info: RECOVERY[id] }))
    .filter(({ info }) => info)
    .sort((a, b) => intensityRank[b.muscle?.intensity] - intensityRank[a.muscle?.intensity]);
}
