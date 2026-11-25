'use strict';
window.Registry=(()=>{
  const additions=[
    {id:'courier',art:'luxCourier',kind:'소형 비행선',name:'우체비',price:42000,origin:'탈로스 우편창 · 1인승 연락정',story:'옛 우편함 자리에 작은 여행 가방을 끼우는 기체입니다. 교대 종 대신 노란 꼬리등을 세 번 깜박여 출항을 알립니다.'},
    {id:'skimmer',art:'luxSkimmer',kind:'소형 비행선',name:'비취가오리',price:158000,origin:'네레이드 수면공방 · 2인승 활공정',story:'낮고 넓은 날개 아래 수면 고도계가 달려 있습니다. 한때 조개 양식장을 돌던 조종사들이 우주항에 맞춰 접이식 날개를 달았습니다.'},
    {id:'mapper',art:'luxMapper',kind:'소형 비행선',name:'금실자오선',price:310000,origin:'오리온 측량원 · 4인승 측량선',story:'양옆의 금빛 측정판에 같은 별이 맺히면 두 관측수가 각자의 시각을 적습니다. 수첩을 포개면 그날 지나온 길이 한 줄로 남습니다.'},
    {id:'liner',art:'luxLiner',kind:'소형 비행선',name:'은백야 특급',price:640000,origin:'라이라 은세공 조선소 · 8인승 살롱선',story:'창을 따라 이어진 식당차와 피아노가 놓인 마지막 객실까지, 사라진 궤도 특급열차의 살롱을 통째로 선체에 옮겼습니다.'},
    {id:'tea',art:'luxTea',kind:'특산품',name:'청무차 초물 세트',price:8400,origin:'네레이드 차 농원 · 첫 수확 기념본',story:'해무가 가장 먼저 걷히는 언덕의 찻잎을 여섯 겹으로 덖었습니다. 잎을 말린 날짜와 선적한 배 이름이 차통 바닥에 함께 찍혀 있습니다.'},
    {id:'clock',art:'luxClock',kind:'공예',name:'쌍추 선실시계',price:39500,origin:'탈로스 시계 골목 · 황동 탁상시계',story:'조선공이 배가 기울어도 서로 균형을 이루게 두 추를 달았습니다. 유리창 너머로 기항지 시간과 본항 시간이 나란히 흐릅니다.'},
    {id:'perfume',art:'luxScent',kind:'특산품',name:'빙화 조향병',price:14200,origin:'에이르 조향소 · 결정 유리',story:'밤새 얼음꽃을 통과한 바람을 응축해 짙은 보랏빛 병에 담았습니다. 마개에는 그해 마지막 서리가 내린 날이 새겨졌습니다.'},
    {id:'comb',art:'luxComb',kind:'장신구',name:'일곱 물결 머리빗',price:23800,origin:'네레이드 은실 공방 · 산호와 은',story:'빗살 위로 일곱 개의 붉은 산호를 이어 붙였습니다. 항구에서는 먼 항해를 떠나는 이에게 이 빗을 선물합니다.'},
    {id:'tapestry',art:'luxWeave',kind:'직조화',name:'붉은 환승로',price:74000,origin:'베이라 직조 길드 · 손베틀 견직',story:'환승로에서 하루 동안 관측한 신호기를 날실로 옮겼습니다. 가장 긴 붉은 줄은 폭풍 때문에 닫혀 있던 부두입니다.'},
    {id:'etching',art:'luxEtch',kind:'동판화',name:'낡은 도크의 빗소리',price:18500,origin:'오리온 구항 판방 · 동판 인쇄',story:'덧문에 튄 빗방울마다 바늘로 동판을 긁었습니다. 어두운 잉크 사이로 길게 남은 세 줄이 마지막 정기편의 등불입니다.'},
    {id:'compass',art:'luxCompass',kind:'아티팩트',name:'귀항을 잊은 나침반',price:115000,origin:'인양선 여울 · 동면실 유품',story:'바늘은 항구 대신 오래전 폐기한 등대 좌표만 가리킵니다. 뒷면의 긁힌 숫자는 마지막 귀항 허가서와 일치합니다.'},
    {id:'mask',art:'luxMask',kind:'아티팩트',name:'무언극장의 백자 가면',price:185000,origin:'폐쇄 궤도극장 · 봉인 회수품',story:'입이 없는 가면 안쪽에 배우들의 대사가 점자로 새겨져 있습니다. 극장의 좌석 배치도와 겹치면 빈자리 하나가 드러납니다.'},
    {id:'seed',art:'luxSeed',kind:'아티팩트',name:'정지 정원의 씨방',price:285000,origin:'에이르 동결선 · 희귀 표본',story:'씨방 안의 세 잎은 빛이 닿기 한순간 전의 모양으로 멈췄습니다. 발굴대는 뿌리째 투명 보존관에 봉인했습니다.'},
    {id:'bell',art:'luxBell',kind:'아티팩트',name:'제0부두의 잠수종',price:410000,origin:'자오선 구항 · 수몰 갑문 인양품',story:'존재한 적 없는 제0부두의 문장이 종 표면에 남아 있습니다. 잠수부의 일지에는 인양 전날까지 이 종이 교대 시각을 울렸다고 적혀 있습니다.'}
  ];
  const grades=['연안급','순항급','원정급','대항해급'];
  const ships={
    courier:[1,'1인승 연락정',67],skiff:[1,'1인승 경주정',74],
    skimmer:[2,'2인승 활공정',85],yacht:[2,'2인승 유람정',91],
    observer:[3,'3인승 관측선',86],mapper:[3,'4인승 측량선',96],
    twin:[4,'6인승 태양 범선',105],liner:[4,'8인승 살롱선',113]
  };
  const routes=['lyra','nereid','orion','veyra','eir','thalos'];
  Object.assign(ships,Collection.ships);
  const ports=id=>ships[id][0]===4?[...routes,'mira','serein','calyx']:routes.slice(0,ships[id][0]+2);
  const gradeName=id=>['Ⅰ','Ⅱ','Ⅲ','Ⅳ'][ships[id][0]-1]+' · '+grades[ships[id][0]-1];
  return {additions:additions.concat(Collection.items),grades,ships,ports,gradeName};
})();
