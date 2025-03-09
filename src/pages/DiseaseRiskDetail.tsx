import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import { ArrowLeft } from 'lucide-react';

// Define disease data
const diseaseData = [
  {
    id: 1,
    name: "二型糖尿病",
    risk: 0.73,
    introduction: "二型糖尿病是一种常见的代谢性疾病，特征是血糖水平长期升高，主要由胰岛素抵抗和相对胰岛素不足引起。这种疾病通常与生活方式因素如肥胖、缺乏运动和不健康饮食密切相关。长期高血糖可导致多种严重并发症，包括心血管疾病、神经损伤、肾脏疾病、视网膜病变等。二型糖尿病发病率随年龄增长而增加，但近年来在年轻人群中的发病率也在上升。该病症初期可能没有明显症状，发现时往往已有并发症，因此定期体检尤为重要。",
    prevention: "维持健康体重是预防二型糖尿病的关键措施。定期进行中等强度的有氧运动（如快走、游泳）每周至少150分钟，并结合力量训练。饮食上应减少精制碳水化合物和添加糖的摄入，选择全谷物、豆类等复合碳水化合物，增加蔬菜水果摄入。控制总热量摄入，保持合理的饮食结构。定期监测血压和血糖水平，特别是有家族史的人群。避免长期过度压力，保持充足睡眠。必要时在医生指导下使用降糖药物进行干预治疗。建立健康生活习惯，坚持健康的生活方式对预防和控制二型糖尿病至关重要。"
  },
  {
    id: 2,
    name: "高血压",
    risk: 0.61,
    introduction: "高血压是一种常见的慢性疾病，表现为动脉压力持续升高，可导致心脏、脑部和其他器官的损伤。也称为\"无声杀手\"，因为早期往往没有明显症状。正常血压应低于120/80mmHg，而持续高于140/90mmHg则被诊断为高血压。高血压可分为原发性（约占90%）和继发性两种，原发性高血压病因复杂，与遗传、环境、饮食、生活习惯等多因素相关。长期高血压会增加冠心病、脑卒中、心力衰竭、肾功能衰竭等疾病风险，是全球主要死亡原因之一。随着年龄增长，动脉弹性下降，高血压发病率也随之上升。",
    prevention: "减少钠摄入是预防高血压的重要措施，成人每日盐摄入量应控制在5克以下，注意隐藏盐的摄入。增加新鲜水果、蔬菜、全谷物和低脂乳制品摄入，遵循DASH饮食原则。限制酒精消费，男性每日不超过25克酒精，女性不超过15克。保持活跃的生活方式，每周进行至少150分钟中等强度有氧运动，如快走、游泳或骑自行车。避免吸烟，积极管理压力，保持健康体重（BMI指数在18.5-24之间）。定期监测血压，尤其是有高血压家族史的人群。合理安排作息时间，保证充足睡眠。必要时在医生指导下服用降压药物并定期随访。"
  },
  {
    id: 3,
    name: "肾结石",
    risk: 0.55,
    introduction: "肾结石是尿液中矿物质和盐形成的固体物质，在尿路系统中形成结晶体，引起剧烈疼痛。结石大小从沙粒大小到几厘米不等，可阻塞尿液流动并导致感染。常见症状包括侧腹剧烈疼痛（肾绞痛）、血尿、恶心呕吐和排尿异常等。肾结石形成原因多样，包括脱水、饮食习惯不当、某些医疗条件和药物等。根据成分可分为钙结石（最常见，约80%）、草酸结石、尿酸结石和感染性结石等。肾结石具有较高复发率，约50%的患者在5-10年内会再次形成结石。肾结石发病率与地域、气候、饮食习惯和遗传因素相关。",
    prevention: "多喝水是预防肾结石最重要的措施，每日饮水量应达到2-2.5升，保证尿液颜色淡黄。减少高草酸食物摄入，如菠菜、甜菜、坚果、巧克力、茶等。控制高盐饮食，每日盐摄入量不超过5克。适量补充钙质（推荐从食物而非补充剂获取），每日1000-1200mg，有助于结合草酸减少其吸收。减少动物蛋白质摄入，尤其是红肉和海鲜，控制嘌呤摄入量。增加柑橘类水果摄入，如柠檬、橙子等含柠檬酸丰富的水果有助于抑制钙结石形成。避免某些药物如补充剂的过量使用。保持健康体重，肥胖是肾结石的危险因素。定期体检，监测尿液成分和pH值。对于复发性结石患者，应根据结石成分进行个体化饮食指导。"
  },
  {
    id: 4,
    name: "高血糖",
    risk: 0.43,
    introduction: "高血糖是血液中葡萄糖水平过高的状态，可能是糖尿病前期或糖尿病的症状之一。正常空腹血糖应低于5.6mmol/L，餐后2小时血糖应低于7.8mmol/L。持续高于这些值但又未达到糖尿病诊断标准的状态称为糖尿病前期（空腹血糖6.1-7.0mmol/L或糖耐量试验2小时血糖7.8-11.1mmol/L）。高血糖可由多种因素引起，包括胰岛素分泌不足、胰岛素抵抗、过度饮食（特别是高糖高碳水饮食）、缺乏运动、压力、某些药物如糖皮质激素等。早期高血糖可能无明显症状，但持续高血糖会导致多尿、多饮、多食、体重下降等典型症状，长期可引发心血管疾病、肾病、视网膜病变和神经病变等并发症。",
    prevention: "健康均衡饮食是预防高血糖的基础，应控制总热量摄入，减少简单碳水化合物（如白米白面、精制糖）摄入，选择低GI食物如全谷物、豆类。每餐应包含适量优质蛋白质（如鱼类、瘦肉、豆制品）和健康脂肪（如橄榄油、坚果）。保持规律适量运动，每周至少150分钟中等强度有氧运动，如快走、游泳，并结合力量训练。保持健康体重，腰围男性应小于90cm，女性应小于85cm。限制精制糖和含糖饮料摄入，选择天然水果而非果汁。增加膳食纤维摄入（每日25-30克），有助于减缓糖分吸收。规律作息，保证充足睡眠，减少熬夜。管理压力，避免情绪波动对血糖的影响。定期监测血糖水平，尤其是有糖尿病家族史或超重人群。若有糖尿病前期，应积极干预以防止发展为糖尿病。"
  },
  {
    id: 5,
    name: "肠易激综合征",
    risk: 0.31,
    introduction: "肠易激综合征(IBS)是一种常见的功能性肠道障碍，表现为腹痛、腹胀和排便习惯改变（如腹泻、便秘或两者交替），无明显器质性病变。IBS是一种慢性疾病，症状可能持续数月或数年，时轻时重。虽然不会导致肠道永久性损伤或增加大肠癌风险，但可显著影响生活质量。其确切病因尚不明确，可能与肠道运动功能异常、内脏高敏感性、脑肠轴调节异常、肠道菌群失调、饮食因素、精神心理因素等多方面相关。女性患病率高于男性，约占总人口的10-15%。根据主要症状可分为腹泻型、便秘型、混合型和未定型。诊断主要基于罗马IV标准和排除器质性疾病。",
    prevention: "识别并避免个人触发食物是管理IBS的关键，常见触发物包括高FODMAP食物（如某些水果、乳制品、豆类、小麦等）、咖啡因、酒精、辛辣食物和高脂肪食物。建议采用排除饮食法逐一测试并记录食物日记。积极管理压力和焦虑，可尝试冥想、瑜伽、深呼吸练习等放松技术。保持规律进餐时间和适量进食，避免暴饮暴食或长时间不进食。增加溶解性纤维（如燕麦、车前子壳）摄入，同时限制不溶性纤维（如全麦面包、坚果）摄入。保持水分充足，每日饮水2升以上。适量运动有助于促进肠道蠕动，改善胃肠功能。考虑益生菌补充，特别是乳酸杆菌和双歧杆菌。某些情况下可能需要药物治疗，如抗痉挛药、抗腹泻药或轻泻药等。心理治疗如认知行为疗法对缓解症状也有帮助。建立良好的排便习惯，定时如厕，不忽视排便信号。"
  },
  {
    id: 6,
    name: "浅表性胃炎",
    risk: 0.28,
    introduction: "浅表性胃炎是胃粘膜的炎症，仅限于胃黏膜表层，是最常见的胃炎类型。可由多种因素引起，包括幽门螺杆菌感染（最常见原因）、非甾体抗炎药（如阿司匹林、布洛芬）长期使用、过量饮酒、吸烟、精神压力过大、自身免疫反应等。症状包括上腹不适、恶心、轻微疼痛、腹胀、嗳气、反酸等，但也可能完全无症状。浅表性胃炎可为急性或慢性，慢性浅表性胃炎如不及时治疗，可能发展为萎缩性胃炎，增加胃癌风险。诊断主要通过胃镜检查和组织病理学分析。与十二指肠溃疡和功能性消化不良在症状上有所重叠，需鉴别诊断。流行病学研究显示，该疾病发病率随年龄增长而上升，且与地区、饮食习惯密切相关。",
    prevention: "避免刺激性食物和饮料是预防浅表性胃炎的重要措施，包括辛辣食物、酸性食物、过热或过冷食物、碳酸饮料和咖啡因。限制非甾体抗炎药(NSAIDs)使用，必须使用时可在医生指导下同时服用质子泵抑制剂保护胃黏膜。保持规律三餐，避免暴饮暴食或长时间空腹。细嚼慢咽，减少对胃部的机械刺激。戒烟限酒，酒精和烟草对胃黏膜有直接刺激作用。积极管理压力，慢性压力可通过神经内分泌机制影响胃酸分泌和胃黏膜屏障功能。幽门螺杆菌检测和根除治疗，特别是有家族胃癌史的人群。保持健康生活方式，包括规律运动、充足睡眠和均衡饮食。增加富含抗氧化物质的食物摄入，如新鲜水果蔬菜。有胃部不适症状时及时就医，避免自行用药。定期胃镜检查，尤其是高危人群和有持续症状者。"
  },
  {
    id: 7,
    name: "偏头痛",
    risk: 0.16,
    introduction: "偏头痛是一种常见的神经血管性疾病，特征是反复发作的中重度头痛，常伴有恶心、呕吐和对光声敏感。头痛通常为搏动性，多为单侧，持续4-72小时不等。约三分之一患者在头痛前会经历先兆症状，如视觉闪光、暗点、感觉异常等。偏头痛有明显的遗传倾向，女性发病率是男性的3倍，与雌激素水平波动相关。可由多种因素触发，包括压力、睡眠不足或过多、某些食物（如巧克力、奶酪、红酒）、气候变化、强光、噪音等。基于症状和发作特点，可分为无先兆偏头痛和有先兆偏头痛两种主要类型。虽然确切病理机制尚未完全阐明，但与三叉神经血管系统激活、大脑皮层扩散性抑制和神经递质（如5-羟色胺）失衡等密切相关。",
    prevention: "识别并避免个人触发因素是预防偏头痛的重要策略，可通过头痛日记记录发作与可能触发物之间的关联，常见触发物包括特定食物饮料（如含酪胺食物、MSG、酒精、巧克力）、环境因素（如强光、噪音、气味、气压变化）和生理因素（如压力、睡眠不足）。保持规律作息十分重要，包括固定睡眠时间、规律进餐时间，避免过度疲劳和睡眠不足。适量有规律的有氧运动（如散步、游泳、骑自行车）每周3-5次，每次30分钟以上，有助于减少偏头痛发作频率。避免过度用眼和长时间使用电子设备，使用护眼设置，每小时休息片刻。积极管理压力，学习放松技巧如深呼吸、渐进性肌肉放松、冥想等。保持水分充足，每日饮水2升以上，避免脱水。对于女性，可能需要与医生讨论激素管理策略，特别是与月经相关的偏头痛。针对频繁发作者，医生可能建议预防性药物治疗。保持均衡饮食，避免长时间空腹。某些膳食补充剂如镁、核黄素、辅酶Q10在某些患者中可能有预防作用。"
  },
  {
    id: 8,
    name: "前列腺炎",
    risk: 0.11,
    introduction: "前列腺炎是前列腺的炎症，可引起排尿困难、盆腔疼痛和性功能障碍，是50岁以下男性最常见的泌尿系统疾病之一。根据病因和临床特点可分为四类：急性细菌性前列腺炎、慢性细菌性前列腺炎、慢性盆腔疼痛综合征（最常见，约占90%）和无症状性炎症性前列腺炎。症状多样，可包括排尿疼痛、尿频、尿急、尿流变细、尿不尽感、会阴或下腹部不适、射精疼痛、性功能障碍等。病因复杂，可能与细菌感染、尿液反流、盆底肌肉功能障碍、神经免疫因素、精神心理因素等相关。诊断基于症状评估、体格检查、实验室检查和影像学检查。长期或反复发作的前列腺炎可影响患者生活质量和心理健康，甚至导致抑郁和焦虑。不同类型的前列腺炎治疗方法各异，细菌性前列腺炎需抗生素治疗，而慢性盆腔疼痛综合征则需多模式综合治疗。",
    prevention: "定期排尿和避免憋尿是预防前列腺炎的重要措施，应养成每3-4小时排尿一次的习惯，完全排空膀胱，避免尿液滞留。避免长时间久坐，特别是在硬座椅上，可使用气垫或软垫减少压力，每小时起身活动片刻。保持适量规律运动，特别是有氧运动和骨盆底肌肉锻炼（如凯格尔运动），每周至少5次，每次30分钟以上。避免或限制酒精、咖啡因、辛辣食物和柑橘类食物摄入，这些可能刺激前列腺和尿道。保持充分水分摄入，每日至少2升水，但避免在睡前大量饮水。保持规律性生活，避免长期禁欲或过度频繁的性活动。预防性传播疾病，使用安全套并减少多个性伴侣。保持个人卫生，特别是会阴部区域，性活动前后清洁。避免长时间骑自行车，必须骑行时使用合适的坐垫。管理压力和焦虑，这些可加重前列腺炎症状。保持健康体重，肥胖与前列腺炎风险增加相关。50岁以上男性应定期进行前列腺检查，包括直肠指检和PSA检测。"
  },
  {
    id: 9,
    name: "胆囊炎",
    risk: 0.04,
    introduction: "胆囊炎是胆囊的炎症，通常由胆结石导致胆囊管阻塞引起，也可由细菌感染、胆囊血液供应不足或自身免疫反应导致。主要表现为右上腹部持续性疼痛（可放射至右肩背部）、发热、恶心、呕吐和腹部触痛。急性胆囊炎起病急，多在进食高脂肪餐后发作；慢性胆囊炎则症状较轻但反复发作。胆囊炎患者中约95%与胆结石相关（结石性胆囊炎），5%无结石（非结石性胆囊炎）。危险因素包括女性（尤其是育龄期）、40岁以上、肥胖、高脂饮食、快速减重、妊娠、某些药物（如口服避孕药）使用等。如不及时治疗，可能导致胆囊坏疽、穿孔、脓肿形成等严重并发症。诊断依靠症状、体格检查、实验室检查（如白细胞计数、肝功能）和影像学检查（超声是首选方法）。治疗包括抗生素、疼痛管理和胆囊切除术，后者是结石性胆囊炎的根治方法。",
    prevention: "健康均衡饮食是预防胆囊炎的基础，应减少高脂肪食物（如油炸食品、肥肉）摄入，控制总脂肪摄入量不超过总热量的30%。保持健康体重非常重要，BMI应维持在18.5-24之间，但应避免快速减重（如节食、禁食），因为这会增加胆结石形成风险。限制高胆固醇食物如动物内脏、蛋黄等，每日胆固醇摄入控制在300mg以下。增加膳食纤维摄入，每日25-30g，可选择全谷物、豆类、新鲜蔬果。规律进餐，避免长时间空腹和暴饮暴食。保持规律运动，每周至少150分钟中等强度有氧运动，有助于维持健康体重和促进胆汁流动。充分水分摄入，每日2-2.5升，有助于稀释胆汁中的胆固醇。限制饮酒，过量饮酒会增加胆结石和胆囊疾病风险。女性应谨慎使用含雌激素药物如口服避孕药，必要时与医生讨论替代方案。有胆囊疾病家族史或已知胆结石者应定期超声检查。对于无症状胆结石患者，应评估是否需要预防性胆囊切除。"
  },
  {
    id: 10,
    name: "肝硬化",
    risk: 0.02,
    introduction: "肝硬化是慢性肝脏疾病的终末期表现，特征是肝组织广泛纤维化和结节形成，导致肝脏结构异常和功能下降。是一种不可逆的病理改变，但早期诊断和干预可减缓疾病进展。主要病因包括长期酒精滥用（酒精性肝病，占40%）、病毒性肝炎（主要是乙型和丙型肝炎，占40%）、非酒精性脂肪性肝病（占10-15%）、自身免疫性肝炎、遗传代谢性疾病（如血色素沉着症、Wilson病）和药物性肝损伤等。早期肝硬化可无明显症状，随着病情进展可出现乏力、食欲下降、体重减轻、腹胀、黄疸、瘙痒、蜘蛛痣等表现。晚期可并发门脉高压、食管胃底静脉曲张破裂出血、腹水、肝性脑病和肝细胞癌等严重并发症。诊断依靠病史、体格检查、实验室检查、影像学检查和肝脏活检（金标准）。治疗主要针对病因、减缓疾病进展和处理并发症，严重者可能需要肝移植。肝硬化是全球重要死亡原因之一，晚期5年生存率不足50%。",
    prevention: "限制酒精摄入是预防肝硬化的关键措施。男性每日酒精摄入不应超过30克（约2标准杯），女性不超过20克（约1.5标准杯），重度饮酒者应在医生指导下戒酒。避免不必要的药物使用，特别是已知有肝毒性的药物，服药前应咨询医生或药师，按说明使用，避免自行增减剂量。接种乙型肝炎疫苗，特别是高危人群如医护人员、多个性伴侣者和注射毒品使用者。预防丙型肝炎感染，避免共用注射器、个人卫生用品（如剃须刀、牙刷），选择正规机构进行纹身、穿耳等。保持安全性行为，使用安全套降低性传播疾病风险。维持健康饮食和体重，控制总热量摄入，减少高糖高脂食物，增加水果蔬菜摄入，肥胖可导致非酒精性脂肪肝，进而发展为肝硬化。定期体检和肝功能检查，尤其是高危人群。已诊断肝病患者应严格遵循医嘱治疗，定期随访，避免未经医生许可使用保健品和中草药。避免接触肝毒性物质，如某些化学溶剂、杀虫剂等。乙肝和丙肝患者应考虑抗病毒治疗，减少发展为肝硬化的风险。"
  }
];

// Card colors for different positions
const cardColors = [
  "bg-blue-900 text-white", // First card (main focus)
  "bg-blue-900 text-white", // Second card
  "bg-blue-900 text-white", // Third card
  "bg-blue-900 text-white", // Fourth card
  "bg-blue-900 text-white", // Fifth card
  "bg-blue-900 text-white", // Sixth card
  "bg-blue-900 text-white", // Seventh card
  "bg-blue-900 text-white", // Eighth card
  "bg-blue-900 text-white", // Ninth card
  "bg-blue-900 text-white", // Tenth card
];

const DiseaseRiskDetail: React.FC = () => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [startY, setStartY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [currentOffset, setCurrentOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  // 添加状态记录当前展开的卡片ID
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);
  
  // 新增引用，用于获取窗口高度
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Handle back navigation
  const handleBack = () => {
    navigate(-1);
  };
  
  // 处理卡片点击，展开详情
  const handleCardClick = (id: number) => {
    // 如果已经展开了这张卡片，则关闭它
    if (expandedCardId === id) {
      setExpandedCardId(null);
    } else {
      // 否则展开这张卡片
      setExpandedCardId(id);
    }
  };
  
  // Touch event handlers for card swiping
  const handleTouchStart = (e: React.TouchEvent) => {
    // 如果有展开的卡片，点击时不启动滑动
    if (expandedCardId !== null) return;
    
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;
    setCurrentOffset(diff);
  };
  
  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    const threshold = 50; // Minimum distance to trigger card change
    
    if (currentOffset > threshold && activeIndex > 0) {
      // Swipe down - show previous card
      setActiveIndex(activeIndex - 1);
    } else if (currentOffset < -threshold && activeIndex < diseaseData.length - 1) {
      // Swipe up - show next card
      setActiveIndex(activeIndex + 1);
    }
    
    setIsDragging(false);
    setCurrentOffset(0);
  };
  
  // 计算卡片高度，使其占据屏幕高度的3/4
  const cardHeight = windowHeight * 0.75;
  
  // Calculate card positions and styles
  const getCardStyle = (index: number) => {
    // 如果当前有展开的卡片，且不是当前卡片，则隐藏其他卡片
    if (expandedCardId !== null && diseaseData[index].id !== expandedCardId) {
      return {
        transform: 'translateY(100vh) scale(0.8)',
        opacity: 0,
        zIndex: 0,
        display: 'none',
        height: `${cardHeight}px`
      };
    }
    
    // 如果当前卡片被展开，则全屏显示
    if (expandedCardId === diseaseData[index].id) {
      return {
        transform: 'translateY(0) scale(1)',
        opacity: 1,
        zIndex: 30,
        height: '100vh', // 全屏显示
        top: 0,
        borderRadius: 0
      };
    }
    
    const basePosition = index - activeIndex;
    const position = basePosition + (isDragging ? currentOffset / 100 : 0);
    
    // 顶部卡片的额外偏移量（使所有卡片位置下移）
    const topOffset = 40; // 增加顶部偏移量，使卡片整体下移
    
    // Different transformations based on position
    if (position < -2) {
      // Cards way above the stack - hide them
      return {
        transform: `translateY(-200%) scale(0.85)`,
        opacity: 0,
        zIndex: 10 - index,
        display: 'none',
        height: `${cardHeight}px`
      };
    } else if (position < -1) {
      // Card just above the top of stack
      return {
        transform: `translateY(calc(-120% + ${topOffset}px)) scale(0.85)`,
        opacity: 0.3,
        zIndex: 10 - index,
        height: `${cardHeight}px`
      };
    } else if (position < 0) {
      // Card at top of stack
      return {
        transform: `translateY(calc(${position * 60}px + ${topOffset}px)) scale(${0.95 + position * 0.05})`,
        opacity: 1 + position * 0.3,
        zIndex: 10 - index,
        height: `${cardHeight}px`
      };
    } else if (position === 0) {
      // Active card
      return {
        transform: `translateY(${topOffset}px) scale(1)`,
        opacity: 1,
        zIndex: 20,
        height: `${cardHeight}px`
      };
    } else if (position < 4) {
      // Cards below active card
      return {
        transform: `translateY(calc(${position * 60}px + ${topOffset}px)) scale(${1 - position * 0.05})`,
        opacity: 1 - position * 0.2,
        zIndex: 10 - position,
        height: `${cardHeight}px`
      };
    } else {
      // Cards way below - hide them
      return {
        transform: `translateY(calc(240px + ${topOffset}px)) scale(0.75)`,
        opacity: 0,
        zIndex: 1,
        display: 'none',
        height: `${cardHeight}px`
      };
    }
  };
  
  // 渲染卡片内容，根据是否展开显示不同内容
  const renderCardContent = (disease: typeof diseaseData[0], index: number) => {
    const isExpanded = expandedCardId === disease.id;
    
    return (
      <>
        {/* Card Header with Disease Name and Number */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold">{disease.name}</h2>
          {!isExpanded && (
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border-2 ${index === activeIndex ? 'text-white border-white' : 'text-white/70 border-white/70'}`}>
              {disease.id}
            </div>
          )}
          {isExpanded && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setExpandedCardId(null);
              }}
              className="p-1 rounded-full bg-white text-blue-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Risk Value */}
        <div className="mb-4">
          <p className="text-sm font-medium text-white">风险值</p>
          <div className="w-full bg-blue-950 rounded-full h-2 my-1">
            <div 
              className={`h-2 rounded-full ${disease.risk > 0.5 ? 'bg-red-500' : disease.risk > 0.3 ? 'bg-yellow-500' : 'bg-green-500'}`} 
              style={{ width: `${disease.risk * 100}%` }}
            ></div>
          </div>
          <p className={`text-right ${disease.risk > 0.5 ? 'text-red-300' : disease.risk > 0.3 ? 'text-yellow-300' : 'text-green-300'} font-bold`}>
            {(disease.risk * 100).toFixed(2)}%
          </p>
        </div>
        
        {/* Disease Information */}
        <div className={`transition-all duration-300 ${isExpanded ? 'overflow-y-auto' : 'overflow-hidden'}`} 
             style={isExpanded ? {maxHeight: 'calc(100vh - 220px)'} : {maxHeight: 'calc(100% - 160px)'}}>
          {/* Disease Introduction */}
          <div className="mb-4">
            <h3 className="text-md font-semibold text-white">疾病简介</h3>
            <p className={`text-sm mt-1 text-white/90 ${isExpanded ? '' : 'line-clamp-6'}`}>
              {disease.introduction}
            </p>
          </div>
          
          {/* Prevention Strategy */}
          <div className="mb-3">
            <h3 className="text-md font-semibold text-white">预防策略</h3>
            <p className={`text-sm mt-1 text-white/90 ${isExpanded ? '' : 'line-clamp-8'}`}>
              {disease.prevention}
            </p>
          </div>
        </div>
        
        {/* Bottom Indicator - only show on non-expanded cards */}
        {!isExpanded && (
          <div className="w-16 h-1 bg-white/50 mx-auto rounded-full mt-3 absolute bottom-4 left-0 right-0"></div>
        )}
      </>
    );
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* 只有在没有展开卡片时显示状态栏和头部 */}
      {expandedCardId === null && <StatusBar />}
      
      {/* Header - only show when no card is expanded */}
      {expandedCardId === null && (
        <div className="w-full flex items-center justify-center relative pt-12">
          <button 
            className="absolute left-4 p-2 z-30" 
            onClick={handleBack}
          >
            <ArrowLeft className="text-white" size={24} />
          </button>
          <h1 className="text-xl font-medium">TOP 10风险疾病与建议</h1>
        </div>
      )}
      
      {/* Card Container */}
      <div 
        ref={containerRef}
        className={`flex-1 overflow-hidden relative px-4 pb-2 ${expandedCardId !== null ? 'pt-0' : 'pt-1'}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {diseaseData.map((disease, index) => (
          <div
            key={disease.id}
            className={`absolute w-full p-5 rounded-3xl transition-all duration-300 shadow-lg overflow-hidden ${expandedCardId === disease.id ? 'bg-blue-900 text-white' : cardColors[index % cardColors.length]}`}
            style={{
              ...getCardStyle(index),
              left: 0,
              right: 0,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
            onClick={() => handleCardClick(disease.id)}
          >
            {renderCardContent(disease, index)}
          </div>
        ))}
      </div>
      
      {/* Bottom Navigation - only show when no card is expanded */}
      {expandedCardId === null && (
        <div className="w-full px-5 py-3 bg-black">
          <div className="w-full flex justify-center space-x-1">
            {diseaseData.map((_, index) => (
              <div 
                key={index} 
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === activeIndex ? 'w-6 bg-blue-500' : 'w-2 bg-gray-500'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiseaseRiskDetail;
