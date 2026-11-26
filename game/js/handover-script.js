'use strict';
window.HandoverScript=(()=>{
const INTRO_SCRIPT = [
  {
    id: "scene_01",
    speaker: "전임 대표 (녹음 메시지)",
    role: "SYSTEM // LEGACY_LOG_2186.01.11",
    title: "인계서의 첫 줄",
    lines: [
      "이 메시지를 재생하고 있다는 건, 네가 오르빗 캐피탈의 새 대표로 취임했다는 뜻이겠지.",
      "아스트라 시스템 섹터 07의 9개 행성은 이미 거대 기업들이 항로와 시장을 틀어쥐고 있어.",
      "우리에게 남은 건 낡은 수송선 한 척과 버티기용 자금뿐이야. 낭비할 시간 없어."
    ],
    highlightTarget: null,
    actionHint: "다음으로 넘어가 인계 내용을 확인하세요.",
    choices: [
      { label: "인계서 계속 듣기", nextId: "scene_02" },
      { label: "스토리 스킵하고 바로 시작", nextId: "tutorial_01", skipIntro: true }
    ]
  },
  {
    id: "scene_02",
    speaker: "AI 관제 비서 (AURA)",
    role: "COMMAND CENTER // OPS_AI",
    title: "현황 브리핑",
    lines: [
      "대표님 취임을 환영합니다. 현재 시각 2186년 1월 11일, 오르빗 캐피탈은 독립 우주 기업으로 등록되어 있습니다.",
      "보유 함선 1척, 자사 거점 1곳으로 운영이 가능하지만 일일 유지비를 감당하려면 조속한 수익 창출이 필요합니다.",
      "지금부터 관제실의 핵심 시스템을 순차적으로 안내해 드리겠습니다."
    ],
    highlightTarget: "#command-center-header",
    actionHint: "관제실 상단 날짜와 배속 제어 바를 확인하세요.",
    choices: [
      { label: "튜토리얼 시작하기", nextId: "tutorial_01" }
    ]
  }
];

const TUTORIAL_SCRIPT = [
  {
    id: "tutorial_01",
    step: 1,
    totalSteps: 5,
    speaker: "AI 관제 비서 (AURA)",
    role: "TUTORIAL 1/5 // ORBITAL MAP",
    title: "궤도 무역 지도 확인",
    lines: [
      "좌측의 '궤도 무역 지도'를 열어보세요. 섹터 07의 9개 행성 위치와 거점 상태를 한눈에 볼 수 있습니다.",
      "자사 거점 주변의 미개척 또는 인접 행성을 선택하면 어떤 물자가 싸고 어디서 비싸게 팔리는지 비교할 수 있습니다."
    ],
    highlightTarget: "#orbital-trade-map",
    requiredAction: "OPEN_ORBITAL_MAP_OR_SELECT_PLANET",
    actionHint: "궤도 무역 지도에서 자사 거점과 거래할 인접 행성을 클릭하세요.",
    reward: {
      cash: 5000,
      message: "초기 물류 보조금 +5,000 Cr 지급"
    },
    nextId: "tutorial_02"
  },
  {
    id: "tutorial_02",
    step: 2,
    totalSteps: 5,
    speaker: "AI 관제 비서 (AURA)",
    role: "TUTORIAL 2/5 // FLEET & CARGO",
    title: "첫 화물 적재 및 출항",
    lines: [
      "시세 차익이 나는 품목을 확인했다면 '함대 현황'으로 이동해 수송선에 화물을 실으세요.",
      "왕복 운항 시간과 예상 순이익을 먼저 계산해 두면 손실 항로를 피할 수 있습니다."
    ],
    highlightTarget: "#fleet-status-panel",
    requiredAction: "DISPATCH_FIRST_SHIP",
    actionHint: "수송선에 화물을 적재하고 목표 행성으로 출항시키세요.",
    reward: {
      cash: 3000,
      message: "첫 항로 개설 보너스 +3,000 Cr 지급"
    },
    nextId: "tutorial_03"
  },
  {
    id: "tutorial_03",
    step: 3,
    totalSteps: 5,
    speaker: "AI 관제 비서 (AURA)",
    role: "TUTORIAL 3/5 // TIME CONTROL",
    title: "시간 배속 전환 및 정산",
    lines: [
      "항선은 실시간 시간 흐름에 따라 이동합니다. 1× 속도가 느리게 느껴진다면 상단 배속 버튼을 2× 이상으로 올려보세요.",
      "운항이 완료되고 하루가 지나면 일일 정산이 반영됩니다."
    ],
    highlightTarget: "#time-speed-controls",
    requiredAction: "CHANGE_TIME_SPEED_ABOVE_1X",
    actionHint: "시간 배속을 2× 이상으로 변경해 운항과 일일 흐름을 진행하세요.",
    reward: {
      reputation: 10,
      message: "운영 속도 최적화 달성 (신뢰도 +10)"
    },
    nextId: "tutorial_04"
  },
  {
    id: "tutorial_04",
    step: 4,
    totalSteps: 5,
    speaker: "AI 관제 비서 (AURA)",
    role: "TUTORIAL 4/5 // FINANCE & LOGS",
    title: "일일 손익과 운영 기록 점검",
    lines: [
      "돈을 버는 것만큼 어디서 새는지 파악하는 것도 중요합니다. '일일 손익(재무제표)'과 '운영 기록'을 열어보세요.",
      "매출, 함선 유지비, 순이익 추이를 확인하면 다음 확장 타이밍을 정확히 잡을 수 있습니다."
    ],
    highlightTarget: "#daily-pnl-panel",
    requiredAction: "OPEN_PNL_OR_LOGS",
    actionHint: "일일 손익(재무제표) 또는 운영 기록 메뉴를 열어 내역을 확인하세요.",
    reward: {
      cash: 2000,
      message: "재무 감사 완료 지원금 +2,000 Cr 지급"
    },
    nextId: "tutorial_05"
  },
  {
    id: "tutorial_05",
    step: 5,
    totalSteps: 5,
    speaker: "AI 관제 비서 (AURA)",
    role: "TUTORIAL 5/5 // GALACTIC EXCHANGE",
    title: "은하 증권 시장 첫 거래",
    lines: [
      "마지막으로 '은하 증권 시장(거래소)'을 확인해 보세요. 섹터 내 주요 기업의 주가가 실시간으로 움직입니다.",
      "여유 자금으로 저가 종목 1주를 매수해 보며 자본 시장의 흐름을 익혀보세요. 이후에는 '연구소' 확장과 거점 확보가 핵심입니다."
    ],
    highlightTarget: "#galactic-exchange-panel",
    requiredAction: "BUY_FIRST_STOCK_SHARE",
    actionHint: "은하 증권 시장에서 원하는 종목 1주를 매수해 튜토리얼을 완료하세요.",
    reward: {
      cash: 5000,
      title: "정식 CEO 인가",
      message: "튜토리얼 완료! 정식 CEO 인가 및 +5,000 Cr 지급"
    },
    nextId: "completed"
  }
];

const ONBOARDING_CHECKLIST = [
  {
    id: "mission_first_trade",
    title: "첫 교역 대금 회수",
    description: "수송선을 출항시키고 화물 판매 수익을 정산받으세요.",
    targetCondition: "completedTrades >= 1",
    rewardText: "+10,000 Cr"
  },
  {
    id: "mission_net_worth_2x",
    title: "초기 자본 2배 달성",
    description: "무역과 증권 거래를 활용해 총자산을 시작 기준의 2배로 끌어올리세요.",
    targetCondition: "netWorth >= initialNetWorth * 2",
    rewardText: "연구 가속 포인트 +1"
  },
  {
    id: "mission_second_outpost",
    title: "두 번째 거점 확보",
    description: "다른 행성에 자사 거점을 건설해 물류 범위를 넓히세요.",
    targetCondition: "ownedPlanets >= 2",
    rewardText: "항로 유지비 5% 할인"
  },
  {
    id: "mission_first_research",
    title: "첫 함대·물류 기술 연구",
    description: "연구소에서 항속, 적재량, 또는 거래 수수료 관련 기술을 해금하세요.",
    targetCondition: "unlockedTechCount >= 1",
    rewardText: "운영 기록 보너스 해금"
  }
];

const HANDOVER_GUIDE_DATA = {
  emergencyLoan: {
    title: "긴급 운영 자금 대출",
    summary: "현금이 바닥나 운항이나 유지비 지불이 막혔을 때 사용하는 비상 자금 라인입니다.",
    rules: [
      "보유 현금이 설정된 기준 이하일 때 활성화됩니다.",
      "일정 이자가 발생하므로 흑자 항로를 확보한 뒤 조기 상환하는 것이 유리합니다."
    ]
  },
  saveBackup: {
    title: "세이브 백업 및 복구",
    summary: "브라우저 로컬 저장소 외에 JSON 데이터로 진행 상황을 보관할 수 있습니다.",
    rules: [
      "기기 변경이나 브라우저 캐시 초기화 전에 백업 데이터를 저장해 두세요.",
      "계정 로그인 시 게스트 데이터와 분리된 회사 슬롯으로 관리됩니다."
    ]
  }
};
return {intro:INTRO_SCRIPT,steps:TUTORIAL_SCRIPT,missions:ONBOARDING_CHECKLIST,guide:HANDOVER_GUIDE_DATA};
})();
