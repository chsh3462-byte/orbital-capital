'use strict';
window.GameData = (() => {
  const planets = [
    {id:'nereid',name:'네레이드',code:'NER-02',sprite:'planetTeal',owner:'player',price:42000,x:.23,y:.32},
    {id:'veyra',name:'베이라',code:'VEY-04',sprite:'planetRust',owner:'HEL',price:55000,x:.72,y:.21},
    {id:'lyra',name:'라이라',code:'LYR-07',sprite:'planetRing',owner:null,price:38000,x:.79,y:.65},
    {id:'orion',name:'오리온',code:'ORI-03',sprite:'planetPurple',owner:'NVA',price:64000,x:.31,y:.77},
    {id:'thalos',name:'탈로스',code:'THA-06',sprite:'planetBlue',owner:'AXM',price:49000,x:.12,y:.59},
    {id:'eir',name:'에이르',code:'EIR-09',sprite:'planetIce',owner:null,price:26000,x:.58,y:.85},
    {id:'mira',name:'미라',code:'MIR-11',sprite:'planetAmber',owner:'LUX',price:61000,x:.46,y:.18},
    {id:'serein',name:'세린',code:'SER-12',sprite:'planetPearl',owner:'SEL',price:59000,x:.89,y:.39},
    {id:'calyx',name:'칼릭스',code:'CAL-13',sprite:'planetMoss',owner:null,price:46000,x:.43,y:.61}
  ];
  const rivals = [
    {id:'HEL',volatility:.068,name:'헬리오스 물류',en:'Helios Logistics',color:'#ffae68',icon:'sun',price:1620,weight:32},
    {id:'NVA',volatility:.068,name:'노바 다이내믹스',en:'Nova Dynamics',color:'#b491ff',icon:'nova',price:2380,weight:28},
    {id:'AXM',volatility:.029,name:'액시엄 테크',en:'Axiom Tech',color:'#63b3ff',icon:'layers',price:1940,weight:22},
    {id:'TOW',volatility:.019,name:'자오선 예항',en:'Meridian Towing',color:'#a9ccaa',icon:'route',price:980,weight:9,ships:1,specialty:'항만 예인 · 연안 화물선 1척'},
    {id:'POL',volatility:.036,name:'극광 냉장해운',en:'Polar Cold Freight',color:'#92c8ff',icon:'box',price:1380,weight:12,ships:2,specialty:'저온 특산물 운송 · 냉장 화물선 2척'},
    {id:'LUX',volatility:.036,name:'미라 등광유리',en:'Mira Beacon Glass',color:'#e7c380',icon:'sun',price:1730,weight:12,specialty:'미라 조명유리 공단'},
    {id:'SEL',volatility:.019,name:'세린 염광조합',en:'Serein Salterns',color:'#abceda',icon:'layers',price:1180,weight:10,specialty:'세린 결정염 생산 기지'},
    {id:'ARC',volatility:.029,name:'변경 호송해운',en:'Arc Convoy',color:'#9cd7ab',icon:'shield',price:2130,weight:14,ships:2,specialty:'변경 항로 운송 · 화물선 2척'}
  ];
  planets.push(
    {id:'sable',name:'사블',galaxy:'vesper',code:'VES-01',sprite:'planetRust',owner:null,price:92000,x:.24,y:.30},
  const techs = [
    {id:'warp',name:'워프 추진기',desc:'레벨당 항로 회전율 +18%',cost:18500,icon:'rocket'},
    {id:'cargo',name:'양자 화물칸',desc:'레벨당 운송 단가 +22%',cost:22000,icon:'box'},
    {id:'core',name:'자동 정제 코어',desc:'레벨당 시설 매출 +25%',cost:24000,icon:'cpu'},
    {id:'ai',name:'AI 항법',desc:'레벨당 자동 운항선 1척 추가',cost:27500,icon:'network'},
    {id:'shield',name:'위상 방어막',desc:'레벨당 운항 사고 손실 25% 경감',cost:15000,icon:'shield'}
  ];
  const campaigns = [
    {id:'holo',name:'홀로넷 배너',cost:8500,days:8,boost:.20,rep:4,icon:'ad'},
    {id:'radio',name:'아공간 라디오',cost:14500,days:12,boost:.26,rep:7,icon:'stock'},
    {id:'expo',name:'은하 박람회',cost:26000,days:16,boost:.33,rep:10,icon:'credits'}
  ];
  const facilities = [
    {id:'spaceport',name:'우주 공항',cost:30000,income:1200},
    {id:'refinery',name:'궤도 정제소',cost:46000,income:1750},
    {id:'resort',name:'성간 리조트',cost:72000,income:2250},
    {id:'lab',name:'양자 연구소',cost:110000,income:2950}
  ];
  const events = [
    {id:'boom',name:'물류 호황',desc:'운송 매출 +35%',days:4,mult:1.35},
    {id:'breakthrough',name:'신기술 발표',desc:'시설 매출 +30%',days:5,mult:1.3},
    {id:'risk',name:'소행성대 운항 경보',desc:'운송 매출의 40% 손실 · 방어막으로 경감',days:3,mult:.4}
  ];
  return {planets,rivals,techs,campaigns,facilities,events};
})();
