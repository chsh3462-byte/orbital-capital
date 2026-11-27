'use strict';
window.HandoverScript=(()=>{
// Keep both saved scene IDs from the original handover until the dock visit ends.
const INTRO_SCRIPT = ['scene_01','scene_02'].map(id=>({
  id, title:'변방의 생존자', choices:[{nextId:'tutorial_01'}]
}));

const TUTORIAL_SCRIPT = [
  {
    id: "tutorial_01",
    step: 1,
    totalSteps: 5,
    speaker: "AI 관제 비서 (AURA)",
    role: "TUTORIAL 1/5 // ORBITAL MAP",
    title: "궤도 무역 지도 확인",
    lines: [
      "운송장 첫 칸은 네레이드예요. 지도에서 우리 항구를 누르면 해무 찻잎이 특산품으로 뜰 거예요.",
      "현지 거래장에서 라이라의 매각가도 비교해 보세요. 이안 씨에게 얼마까지 주고 사도 되는지 알려 줄 수 있어요."
    ],
    highlightTarget: "#orbital-trade-map",
    requiredAction: "OPEN_ORBITAL_MAP_OR_SELECT_PLANET",
    actionHint: "궤도 무역 지도에서 자사 거점과 거래할 인접 행성을 클릭하세요.",
    reward: {
      message: "행성 거래 정보를 확인했습니다."
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
      "이안 씨가 운송장을 보내왔어요. 네레이드 찻잎을 라이라에 팔기로 했죠? 몇 상자 실을지 함께 정해 봐요.",
      "항로를 지정하면 다음 결산에 짐을 싣습니다. 취소하기 전까지 같은 항로를 돌 테니 예상 손익도 한번 봐 주세요."
    ],
    highlightTarget: "#fleet-status-panel",
    requiredAction: "DISPATCH_FIRST_SHIP",
    actionHint: "수송선에 화물을 적재하고 목표 행성으로 출항시키세요.",
    reward: {
      message: "첫 운송선이 출항했습니다."
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
      "부두에서 신호가 왔어요. 배가 나갔습니다. 위쪽 배속 버튼을 눌러 부두 시계를 조금 빨리 돌려 볼까요?",
      "지정 항로의 매각 대금은 화물이 도착하는 날 장부에 들어와요."
    ],
    highlightTarget: "#time-speed-controls",
    requiredAction: "CHANGE_TIME_SPEED_ABOVE_1X",
    actionHint: "시간 배속을 2× 이상으로 변경해 운항과 일일 흐름을 진행하세요.",
    reward: {
      reputation: 10,
      message: "배속 실습 완료 · 신뢰도 +10"
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
      "전임자가 장부 모서리에 밑줄을 두 번 그어 뒀네요. ‘선장에게 매출을 읽어 주기 전에 유지비를 뺄 것.’",
      "오늘 재무제표를 열어 매출과 순이익을 나란히 보세요. 어느 배가 언제 움직였는지는 운영 기록에 있어요."
    ],
    highlightTarget: "#daily-pnl-panel",
    requiredAction: "OPEN_PNL_OR_LOGS",
    actionHint: "일일 손익(재무제표) 또는 운영 기록 메뉴를 열어 내역을 확인하세요.",
    reward: {
      message: "일일 장부를 확인했습니다."
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
      "저쪽에 예인선 보이죠? 자오선 예항 소속이에요. 항구에서 매일 마주치는 회사도 거래소에선 한 주씩 살 수 있어요.",
      "마음에 드는 회사를 골라 한 주 사 보세요. 체결되면 대표 인계 수첩에 마지막 도장을 찍어 드릴게요."
    ],
    highlightTarget: "#galactic-exchange-panel",
    requiredAction: "BUY_FIRST_STOCK_SHARE",
    actionHint: "은하 증권 시장에서 원하는 종목 1주를 매수해 튜토리얼을 완료하세요.",
    reward: {
      title: "정식 CEO 인가",
      message: "첫 근무를 마쳤습니다. 정식 CEO 인가"
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
