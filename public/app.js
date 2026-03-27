import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAIjSdX9MX3COYjn1GLuJygJznUmxePfXI",
  authDomain: "athlete-blueprint-b5bf8.firebaseapp.com",
  projectId: "athlete-blueprint-b5bf8",
  storageBucket: "athlete-blueprint-b5bf8.firebasestorage.app",
  messagingSenderId: "968094219399",
  appId: "1:968094219399:web:103834cac970b2c6838c22"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Global state cache to hold your cloud data locally
window.appState = {};
const USER_DOC = "user_progress_1";

// ─── DATA ────────────────────────────────────────────────────────────────────
const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

const TIMELINE = [
  { id:'t1', time:'6:30 AM', cat:'sleep', title:'Wake up — no phone for 15 min', sub:'2 glasses of water. Step outside for natural light.', sci:'Cortisol peaks at wake. Sunlight anchors your circadian clock via ipRGC retinal cells. This single habit is the most powerful sleep-quality intervention known.' },
  { id:'t2', time:'6:40 AM', cat:'food', title:'Pre-run fuel (light)', sub:'1 banana or 2 dates + small glass of milk. No fat.', sci:'Simple carbs absorb in 15-20 min. Fat and fibre delay gastric emptying and cause cramps during running. Keep fat at zero pre-run.' },
  { id:'t3', time:'6:55 AM', cat:'run', title:'Dynamic warm-up — 5 min', sub:'Leg swings, high knees, butt kicks, ankle circles, hip rotations.', sci:'Dynamic warm-up raises muscle temperature by 1-2°C, increases neural firing rate, and reduces injury risk by ~54% vs cold static stretching.' },
  { id:'t4', time:'7:00 AM', cat:'run', title:'Morning Run', sub:'Mon/Fri: 20-25 min easy intervals. Wed: 25 min tempo. Sat: 30-35 min long slow run. Tue/Thu/Sun: Rest.', sci:'Zone 2 running improves mitochondrial biogenesis and fat oxidation. Morning cortisol peak improves alertness. Run at conversational pace — 5-6 words between breaths.' },
  { id:'t5', time:'7:35 AM', cat:'food', title:'Post-run recovery drink', sub:'Nimbu paani: water + lemon + rock salt + jeera + 1 tsp jaggery. Then shower.', sci:'GLUT-4 transporters are maximally active 30 min post-exercise. Carbohydrate restores glycogen 2-3x faster in this window. The anabolic window is real and measurable.' },
  { id:'t6', time:'8:00 AM', cat:'food', title:'Full breakfast', sub:'3 eggs + 1 glass milk + 2 rotis/upma + seasonal fruit + 1 tsp ghee. (Veg days: besan chilla or dalia)', sci:'Protein at breakfast (25-30g) activates muscle protein synthesis for 3-4 hrs via mTOR. Leucine content in eggs (~1.1g per egg) is the anabolic switch.' },
  { id:'t7', time:'8:30 AM', cat:'work', title:'Deep work block 1', sub:'Most demanding tasks: studying, writing, analysis. No social media until 11 AM.', sci:'Norepinephrine and dopamine elevated post-exercise for 2-4 hrs. Combined with cortisol, this creates the highest focus window of the day. This is a measurable neurochemical peak.' },
  { id:'t8', time:'11:00 AM', cat:'food', title:'Mid-morning snack', sub:'Sattu sherbet OR roasted peanuts + 1 apple OR makhana.', sci:'Sattu GI index ~28 vs white rice at 72. Prevents the pre-lunch glucose crash that degrades focus, mood, and reaction time.' },
  { id:'t9', time:'11:15 AM', cat:'work', title:'Deep work block 2', sub:'Administrative tasks, reading, creative work, emails. Moderate difficulty.', sci:'Attention sustains well until lunch if blood glucose is stable. Good window for structured tasks and communications.' },
  { id:'t10', time:'1:00 PM', cat:'food', title:'Lunch', sub:'Dal + rice or roti + sabzi + chicken/fish (or paneer/rajma on veg days) + curd + salad.', sci:'Dal + grain gives a complete amino acid profile. Curd probiotics reduce GI inflammation and improve protein absorption efficiency by up to 15%.' },
  { id:'t11', time:'1:45 PM', cat:'recovery', title:'Nap — 10 to 20 min ONLY', sub:'Set alarm. Do not exceed 25 min or you enter deep sleep.', sci:'NASA-studied naps of 10-20 min improve alertness by 54% and performance by 34%. Beyond 25 min you cross into N2 sleep causing sleep inertia.' },
  { id:'t12', time:'2:15 PM', cat:'work', title:'Work block 3', sub:'Routine tasks, meetings, calls, revision. Not ideal for deep creative work.', sci:'Post-lunch dip resolves after nap. Body temperature is rising toward afternoon peak. Good for structured tasks and meetings.' },
  { id:'t13', time:'4:30 PM', cat:'food', title:'Pre-workout fuel', sub:'2 rotis with peanut butter OR banana + chivda. 250 ml water.', sci:'Consumed 90 min before training: maximises muscle glycogen. Peanut butter arginine converts to nitric oxide, improving muscle vasodilation.' },
  { id:'t14', time:'6:00 PM', cat:'strength', title:'Strength / Calisthenics — 1 hour', sub:'Upper/lower/full body per weekly plan. See Week tab for daily breakdown.', sci:'Body temperature peaks 4-7 PM. Muscle power output is up to 8% higher than morning. Testosterone peaks in late afternoon. Your strongest physiological state.' },
  { id:'t15', time:'7:10 PM', cat:'food', title:'Post-workout protein window', sub:'1 glass milk immediately. Dinner within 60 min.', sci:'Muscle protein synthesis is highest 1-2 hrs post-strength session. Leucine-containing protein (milk, dal, paneer) triggers mTORC1 signalling for repair and growth.' },
  { id:'t16', time:'8:00 PM', cat:'food', title:'Dinner', sub:'2 rotis + dal or paneer or soya + sabzi + salad with lemon. Moderate portion.', sci:'Casein in paneer and dal digests over 6-7 hrs, feeding muscles through the night during growth hormone secretion. Keep dinner lighter than lunch.' },
  { id:'t17', time:'8:45 PM', cat:'recovery', title:'Light stretching — 10-12 min', sub:'Hip flexors, hamstrings, chest opener, shoulder cross-body. No screens.', sci:'Static stretching post-workout reduces DOMS by increasing blood flow to connective tissue. Parasympathetic activation lowers cortisol for better sleep onset.' },
  { id:'t18', time:'9:00 PM', cat:'work', title:'Light reading / tomorrow planning', sub:'Review tomorrow\'s schedule. Dim lights. 5 min journaling optional.', sci:'Dimming lights triggers melatonin secretion. Blue light suppresses melatonin by up to 85%. Planning tomorrow reduces pre-sleep cognitive arousal — a documented cause of insomnia.' },
  { id:'t19', time:'9:45 PM', cat:'food', title:'Haldi milk + soaked almonds', sub:'Warm milk + haldi + pinch kali mirch + 4-5 walnuts or almonds.', sci:'Milk tryptophan converts to melatonin. Piperine (kali mirch) increases curcumin bioavailability by 2000%. Casein provides slow-release amino acids for 6-7 hrs overnight.' },
  { id:'t20', time:'10:00 PM', cat:'sleep', title:'Sleep', sub:'Phone away. Room cool 18-22°C. Same time every night including weekends.', sci:'SWS before midnight captures peak slow-wave sleep cycles. Up to 70% of daily growth hormone is released in the first 2 SWS cycles. 7.5-8 hrs = 5 complete 90-min cycles.' },
];

const WEEK_PLAN = {
  Monday: {
    run: [{ name:'Dynamic warm-up', sets:'5 min' }, { name:'Easy run — 3 min jog / 2 min walk × 4', sets:'20-25 min' }],
    strength: [{ name:'Pull-ups (full ROM)', sets:'4 × max' }, { name:'Push-ups slow tempo 3-1-1', sets:'4 × 12' }, { name:'Pike push-ups', sets:'3 × 8' }, { name:'Inverted rows', sets:'3 × 12' }, { name:'Tricep dips', sets:'3 × 10' }, { name:'Diamond push-ups', sets:'3 × 8' }],
  },
  Tuesday: {
    strength: [{ name:'Bodyweight squats (full depth)', sets:'4 × 15' }, { name:'Reverse lunges each leg', sets:'3 × 12' }, { name:'Single-leg glute bridge', sets:'3 × 12' }, { name:'Jump squats', sets:'3 × 8' }, { name:'Hollow body hold', sets:'3 × 35 sec' }, { name:'Bicycle crunches (slow)', sets:'3 × 20' }, { name:'Plank with shoulder tap', sets:'3 × 40 sec' }, { name:'Hanging knee raises', sets:'3 × 12' }],
  },
  Wednesday: {
    run: [{ name:'Dynamic warm-up', sets:'5 min' }, { name:'Tempo run (slightly uncomfortable)', sets:'25 min' }, { name:'Cool-down walk', sets:'5 min' }],
    strength: [{ name:'Plank', sets:'3 × 45 sec' }, { name:'Leg raises', sets:'3 × 12' }],
  },
  Thursday: {
    strength: [{ name:'Wide-grip pull-ups', sets:'4 × max' }, { name:'Decline push-ups (feet elevated)', sets:'4 × 10' }, { name:'Archer push-ups', sets:'3 × 6 each' }, { name:'Chin-ups (supinated grip)', sets:'3 × max' }, { name:'Dips (chest lean)', sets:'3 × 10' }, { name:'Superman hold', sets:'3 × 30 sec' }],
  },
  Friday: {
    run: [{ name:'Dynamic warm-up', sets:'5 min' }, { name:'Easy run — intervals', sets:'20-25 min' }],
    strength: [{ name:'Burpees (full range)', sets:'4 × 8' }, { name:'Pull-ups', sets:'3 × max' }, { name:'Jump squats', sets:'3 × 10' }, { name:'Push-ups to downward dog', sets:'3 × 10' }, { name:'Mountain climbers', sets:'3 × 20' }, { name:'Side plank + hip dip', sets:'3 × 30 sec' }],
  },
  Saturday: {
    run: [{ name:'Dynamic warm-up', sets:'5 min' }, { name:'Long slow run — ZONE 2 only', sets:'30-35 min' }, { name:'Walk cool-down', sets:'5-8 min' }, { name:'Full static stretch', sets:'10 min' }],
  },
  Sunday: {
    rest: [{ name:'Complete rest — light walk optional', sets:'15-20 min max' }, { name:'8 hrs sleep target', sets:'Non-negotiable' }],
  },
};

const MEALS_NONVEG = [
  { time:'6:40 AM', name:'Pre-run fuel', items:'1 banana or 2-3 dates + 150 ml milk', macros:'~200 kcal · Carbs 35g · Protein 5g', sci:'Simple carbs only — absorbs in 15-20 min. Avoid fat and fibre pre-run.' },
  { time:'7:35 AM', name:'Recovery drink', items:'Nimbu paani: water + lemon + rock salt + jeera + 1 tsp jaggery', macros:'~50 kcal · Electrolytes', sci:'GLUT-4 transporters maximally active. Restores sodium and potassium lost in sweat.' },
  { time:'8:00 AM', name:'Breakfast', items:'3 whole eggs scrambled/boiled + 1 glass full-fat milk + 2 rotis or 1 cup upma/poha + 1 seasonal fruit + 1 tsp ghee', macros:'~620 kcal · Protein 35g · Carbs 60g · Fat 20g', sci:'Eggs contain ~1.1g leucine each — the anabolic switch that triggers mTOR muscle synthesis. Leucine is the rate-limiting factor for MPS.' },
  { time:'11:00 AM', name:'Mid-morning snack', items:'Option A: Sattu sherbet (2 tbsp sattu + water + lemon + rock salt + jeera) · Option B: Roasted peanuts + apple · Option C: Makhana', macros:'~200 kcal · Protein 8-12g', sci:'Sattu GI index ~28. Prevents the pre-lunch glucose crash that degrades focus and mood.' },
  { time:'1:00 PM', name:'Lunch', items:'150g chicken curry or fish curry + 1.5 cups rice or 3 rotis + 1 bowl dal + 1 bowl sabzi + 1 katori curd + salad', macros:'~850 kcal · Protein 55g · Carbs 85g', sci:'Dal + rice/roti = complementary amino acid profile. Curd probiotics improve protein absorption efficiency by up to 15%.' },
  { time:'4:30 PM', name:'Pre-workout fuel', items:'2 rotis with 1 tbsp peanut butter OR banana + chivda + 250 ml water', macros:'~350 kcal · Protein 10g · Carbs 45g', sci:'90 min before training: maximises glycogen. Peanut butter arginine → nitric oxide → better muscle vasodilation.' },
  { time:'8:00 PM', name:'Dinner', items:'2 whole wheat rotis + 1 bowl dal + 100g chicken/fish OR paneer bhurji + sabzi + salad with lemon', macros:'~700 kcal · Protein 38g · Carbs 60g', sci:'Casein in dal digests over 6-7 hrs, feeding muscles through the night during growth hormone secretion.' },
  { time:'9:45 PM', name:'Bedtime ritual', items:'1 glass warm milk + ½ tsp haldi + pinch kali mirch + pinch dalchini + 4-5 soaked walnuts/almonds', macros:'~180 kcal · Casein 8g · Anti-inflammatory', sci:'Piperine increases curcumin bioavailability by 2000%. Walnuts are the only plant source of DHA omega-3. Milk tryptophan → melatonin.' },
];

const MEALS_VEG = [
  { time:'6:40 AM', name:'Pre-run fuel', items:'1 banana or 2-3 dates + 150 ml milk', macros:'~200 kcal · Carbs 35g · Protein 5g', sci:'Simple carbs only — absorbs in 15-20 min. No fat or fibre pre-run.' },
  { time:'7:35 AM', name:'Recovery drink', items:'Nimbu paani: water + lemon + rock salt + jeera + 1 tsp jaggery', macros:'~50 kcal · Electrolytes', sci:'GLUT-4 transporters maximally active post-exercise. Restores sweat electrolyte losses.' },
  { time:'8:00 AM', name:'Breakfast (veg day)', items:'4 besan chilla (onion, green chilli, coriander) + 1 glass milk + 1 fruit + 4-5 soaked almonds · OR dalia with jaggery + milk + fruit', macros:'~560 kcal · Protein 28g · Carbs 65g', sci:'Besan (chickpea flour) is rich in branched-chain amino acids. Soaked almonds improve bioavailability of Vitamin E and magnesium — both critical for muscle function.' },
  { time:'11:00 AM', name:'Mid-morning snack', items:'Sattu sherbet OR roasted peanuts + apple OR makhana', macros:'~200 kcal · Protein 8-12g', sci:'Sattu GI index ~28. Prevents the pre-lunch glucose crash that degrades focus and mood.' },
  { time:'1:00 PM', name:'Lunch (veg day)', items:'1 bowl rajma or chole (generous) + 100g paneer sabzi or palak paneer + 1.5 cups rice or 3 rotis + handful sprouts + curd + salad', macros:'~800 kcal · Protein 47g · Carbs 80g', sci:'Rajma + rice achieves a complete amino acid profile equivalent to meat. Paneer casein digests slowly, sustaining amino acid delivery for hours.' },
  { time:'4:30 PM', name:'Pre-workout fuel', items:'2 rotis with peanut butter OR banana + chivda + 250 ml water', macros:'~350 kcal · Protein 10g · Carbs 45g', sci:'90 min before training: maximises glycogen. Peanut butter arginine → nitric oxide → better muscle vasodilation.' },
  { time:'8:00 PM', name:'Dinner (veg day)', items:'2 rotis + 1 bowl panchmel dal + 100g paneer bhurji or soya chunk curry + sabzi + salad', macros:'~700 kcal · Protein 38g · Carbs 60g', sci:'Soya chunks are 52% protein by dry weight — the highest plant protein available. Dal casein feeds muscles overnight.' },
  { time:'9:45 PM', name:'Bedtime ritual', items:'1 glass warm milk + ½ tsp haldi + pinch kali mirch + pinch dalchini + 4-5 soaked walnuts/almonds', macros:'~180 kcal · Casein 8g · Anti-inflammatory', sci:'Piperine increases curcumin bioavailability by 2000%. Walnuts: only plant source of DHA omega-3. Casein slow-release amino acids for 6-7 hrs.' },
];

const SCIENCE_DATA = [
  { section: 'Circadian Biology', cards: [
    { title: '6:30 AM cortisol peak', body: 'Cortisol is at its natural daily peak on waking — this is not harmful, it is designed to mobilise energy. Morning exercise amplifies and then cleanly resolves this peak, leading to low-cortisol calm by mid-morning. This is why you feel focused and calm after a morning run.' },
    { title: 'Morning sunlight exposure', body: '10-15 min of sunlight within 30 min of waking sets your circadian clock via intrinsically photosensitive retinal ganglion cells (ipRGCs). This produces a cortisol/melatonin offset 14-16 hrs later — meaning better sleep at 10 PM. It is the single most powerful free sleep-quality intervention known to science.' },
    { title: '4-7 PM peak performance window', body: 'Core body temperature peaks in late afternoon. Muscle power output, reaction time, coordination, and cardiovascular efficiency are all highest between 4 and 7 PM. Strength training here produces measurably better hypertrophy outcomes than morning training by up to 8% — this is why the calisthenics block is placed at 6 PM.' },
    { title: '10 PM sleep timing', body: 'Circadian slow-wave sleep (SWS) density is highest in the first half of the night. Most growth hormone (up to 70% of the daily total) is released in the first 2 SWS cycles — typically 10 PM to 1 AM. Missing these cycles significantly impairs muscle repair and fat oxidation. This is why consistent sleep timing is non-negotiable.' },
  ]},
  { section: 'Nutrition Science', cards: [
    { title: 'The 30-min post-run window', body: 'GLUT-4 transporters on muscle cell membranes are maximally expressed after aerobic exercise. Glucose uptake is 2-3x higher in this window without requiring insulin. This is the one time fast-absorbing carbs are ideal — hence the banana/nimbu paani immediately after your run.' },
    { title: 'Protein distribution matters', body: 'Muscle protein synthesis (MPS) is maximised by spreading protein across 4-5 meals (~30-40g each) rather than loading it at one meal. The plan achieves this across breakfast, lunch, pre-workout snack, dinner, and bedtime milk. Even if one meal is smaller, the distribution signal still occurs.' },
    { title: 'Sattu: the underrated superfood', body: 'Roasted Bengal gram flour has a glycaemic index of ~28 (white rice = 72). It contains 20-22g protein per 100g, is inexpensive, and requires no refrigeration. It is one of the most scientifically well-suited sports foods available in Indian households and is vastly underutilised.' },
    { title: 'Haldi milk bioavailability', body: 'Curcumin alone has ~1% oral bioavailability. Piperine (black pepper) inhibits the CYP3A4 enzyme that metabolises curcumin — increasing absorption by 2000%. Milk fat improves lipid-soluble curcumin absorption further. The traditional bedtime recipe is pharmacologically sound.' },
  ]},
  { section: 'Boxer Physique Mechanism', cards: [
    { title: 'Why calisthenics works for this goal', body: 'Boxers train with bodyweight because it builds relative strength — power per unit of bodyweight, not absolute strength. At 79 kg and 6\'4", adding excess mass slows you down. Calisthenics develops the neurological efficiency, tendon strength, and functional mobility that defines the physique.' },
    { title: 'V-taper: the latissimus dorsi', body: 'The latissimus dorsi is the muscle that creates shoulder-to-hip width ratio. Wide-grip pull-ups, Australian pull-ups, and inverted rows are the primary stimuli. The lat is chronically underdeveloped because beginners pull with hands instead of driving elbows to hips — focus on this cue every rep.' },
    { title: 'Core vs abs: the deep truth', body: 'Visible abs come from low body fat (below ~12%). The tight boxer midsection seen under clothing comes from the transverse abdominis (deep core). Hollow body holds and anti-rotation exercises train this. Sit-ups do not. The hollow body hold is the single most important core exercise in this program.' },
    { title: 'Zone 2 running and physique', body: 'Zone 2 running (conversational pace, ~115-135 bpm for you) improves insulin sensitivity — more nutrients go to muscle cells rather than fat cells. It does not cause muscle loss at this mileage unless you are severely undereating, which the diet plan prevents. Run slow to look athletic.' },
  ]},
  { section: 'Recovery Science', cards: [
    { title: 'Sleep is the actual adaptation', body: 'Training is a stimulus; sleep is the response. Muscle protein synthesis, GH release, motor memory consolidation, and inflammatory resolution all happen during sleep — not during the workout. 6 hrs vs 8 hrs of sleep produces measurably smaller muscles and higher injury risk over 8-12 weeks.' },
    { title: 'The deload week (every 4th week)', body: 'Reduce total training volume by 30-40% every 4th week. This is not laziness — it is when supercompensation occurs. Muscles that were stressed and then given a recovery surplus come back stronger than if continuously overloaded. Your Week 4 gains happen in Week 4 rest.' },
    { title: 'DOMS management', body: 'Delayed onset muscle soreness peaks 24-48 hrs post-session and is caused by eccentric muscle damage (the lowering phase of movement). Slowing the lowering phase (3 sec negative) produces more hypertrophy but also more DOMS. Manage with light movement, haldi milk, and adequate sleep rather than complete rest.' },
  ]},
];

// ─── STATE ───────────────────────────────────────────────────────────────────
async function saveState(s) {
  window.appState = s;
  // This pushes your new progress to your Firebase database
  await setDoc(doc(db, "users", USER_DOC), s);
}

function getState() {
  // This pulls from the local cache so the app stays fast
  return window.appState || {};
}

// Initial Cloud Load: Fetches your history when you open the app
// Around Line 112
async function initCloudData() {
  const docSnap = await getDoc(doc(db, "users", USER_DOC));
  if (docSnap.exists()) { 
    const data = docSnap.data();
    window.appState = data;
    // Load custom plan if Gemini generated one previously
    if (data.customPlan) {
      Object.assign(WEEK_PLAN, data.customPlan);
    }
  } else {
    window.appState = {};
  }
  renderToday();
  renderWeek();
  renderStats();
}

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function getCompletedToday() {
  const s = getState();
  return s[getTodayKey()] || {};
}

function setTaskDone(id, done) {
  const s = getState();
  const k = getTodayKey();
  if (!s[k]) s[k] = {};
  s[k][id] = done;
  saveState(s); // Triggers the save to Firebase
}

// Run the cloud fetch immediately when the app loads
initCloudData();
// Weekly checklist
function getWeekKey() {
  const d = new Date();
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return `week_${monday.getFullYear()}-${monday.getMonth()}-${monday.getDate()}`;
}
function getWeeklyDone() {
  const s = getState();
  return s[getWeekKey()] || {};
}
function setWeekTaskDone(day, idx, done) {
  const s = getState();
  const k = getWeekKey();
  if (!s[k]) s[k] = {};
  const key = `${day}_${idx}`;
  s[k][key] = done;
  saveState(s);
}

// Streak
function updateStreak() {
  const s = getState();
  const today = getTodayKey();
  const todayDone = s[today] || {};
  const totalToday = Object.values(todayDone).filter(Boolean).length;
  const totalTasks = TIMELINE.length;
  const pct = totalToday / totalTasks;
  
  if (!s.streakData) s.streakData = { current: 0, best: 0, lastActiveDay: null };
  
  if (pct >= 0.5 && s.streakData.lastActiveDay !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`;
    if (s.streakData.lastActiveDay === yKey || s.streakData.lastActiveDay === null) {
      s.streakData.current++;
    } else {
      s.streakData.current = 1;
    }
    s.streakData.lastActiveDay = today;
    if (s.streakData.current > s.streakData.best) s.streakData.best = s.streakData.current;
    saveState(s);
  }
  return s.streakData;
}

// ─── RENDER TODAY ─────────────────────────────────────────────────────────────
function renderToday() {
  const page = document.getElementById('page-today');
  const done = getCompletedToday();
  const completedCount = Object.values(done).filter(Boolean).length;
  const total = TIMELINE.length;
  const pct = Math.round((completedCount / total) * 100);
  const streak = updateStreak();
  const dayName = DAYS[new Date().getDay()];
  const dateStr = new Date().toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });

  const catColors = { run:'run', strength:'strength', food:'food', recovery:'recovery', work:'work', sleep:'sleep' };
  const catCounts = {};
  TIMELINE.forEach(t => {
    if (done[t.id]) catCounts[t.cat] = (catCounts[t.cat]||0)+1;
  });
  const totalCats = {};
  TIMELINE.forEach(t => totalCats[t.cat] = (totalCats[t.cat]||0)+1);

  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (pct / 100) * circumference;

  let html = `
  <div class="hdr">
    <div class="hdr-top">
      <div>
        <div class="hdr-label">Today · ${dayName}</div>
        <div class="hdr-title">Daily Blueprint</div>
        <div class="hdr-date">${dateStr}</div>
      </div>
      <div class="streak-badge">
        <div>
          <div class="streak-num">${streak.current}</div>
          <div class="streak-lbl">day streak</div>
        </div>
      </div>
    </div>
  </div>

  <div class="prog-section">
    <div class="ring-wrap">
      <svg width="90" height="90" viewBox="0 0 90 90">
        <circle class="ring-bg" cx="45" cy="45" r="36"/>
        <circle class="ring-fg" cx="45" cy="45" r="36"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="${offset}"/>
      </svg>
      <div class="ring-center">
        <div class="ring-pct">${pct}%</div>
        <div class="ring-done">${completedCount}/${total}</div>
      </div>
    </div>
    <div class="prog-info">
      <div class="prog-title">${pct===100?'Day Complete! 🏆':pct>=50?'Good progress!':'Keep going!'}</div>
      <div class="prog-sub">${total - completedCount} tasks remaining today. Tap each task to mark complete.</div>
      <div class="prog-cats">
        ${Object.entries(totalCats).map(([cat, tot]) => {
          const c = catCounts[cat]||0;
          return `<span class="cat-pill c-${catColors[cat]} bg-${catColors[cat]}">${cat} ${c}/${tot}</span>`;
        }).join('')}
      </div>
    </div>
  </div>

  <div class="sec-hdr">
    <div class="sec-title">Task Checklist</div>
    <div class="sec-count">${completedCount} done</div>
  </div>

  <div class="tl-list" id="tlList">`;

  TIMELINE.forEach(task => {
    const isDone = !!done[task.id];
    const cc = catColors[task.cat];
    html += `
    <div class="tl-item ${isDone?'done-item':''}" id="item_${task.id}">
      <div class="tl-main">
        <div class="tl-check ${isDone?'checked':''}" onclick="toggleTask('${task.id}')">
          <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
            <path d="M1 5l3.5 3.5L12 1" stroke="#0a0a0f" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="tl-dot c-${cc}" style="background:var(--${cc})"></div>
        <div class="tl-content">
          <div class="tl-time">${task.time}</div>
          <div class="tl-title">${task.title}</div>
          <div class="tl-sub">${task.sub}</div>
        </div>
        <div class="tl-expand" onclick="toggleSci('${task.id}')">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M4 6l4 4 4-4"/>
          </svg>
        </div>
      </div>
      <div class="tl-sci" id="sci_${task.id}">
        <div class="sci-box">
          <div class="sci-lbl">WHY THIS WORKS</div>
          <div class="sci-txt">${task.sci}</div>
        </div>
      </div>
    </div>`;
  });

  html += `</div>`;
  page.innerHTML = html;
}

function toggleTask(id) {
  const done = getCompletedToday();
  const newDone = !done[id];
  setTaskDone(id, newDone);
  
  const item = document.getElementById(`item_${id}`);
  const check = item.querySelector('.tl-check');
  const title = item.querySelector('.tl-title');
  
  if (newDone) {
    item.classList.add('done-item');
    check.classList.add('checked');
    showToast('Task complete! 💪');
  } else {
    item.classList.remove('done-item');
    check.classList.remove('checked');
  }
  
  updateProgressRing();
  updateStreak();
}

function toggleSci(id) {
  const sci = document.getElementById(`sci_${id}`);
  const btn = sci.previousElementSibling.querySelector('.tl-expand');
  sci.classList.toggle('open');
  btn.classList.toggle('open');
}

function updateProgressRing() {
  const done = getCompletedToday();
  const completedCount = Object.values(done).filter(Boolean).length;
  const total = TIMELINE.length;
  const pct = Math.round((completedCount / total) * 100);
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (pct / 100) * circumference;
  
  const ring = document.querySelector('.ring-fg');
  const pctEl = document.querySelector('.ring-pct');
  const doneEl = document.querySelector('.ring-done');
  const titleEl = document.querySelector('.prog-title');
  const subEl = document.querySelector('.prog-sub');
  const countEl = document.querySelector('.sec-count');
  
  if (ring) {
    ring.style.strokeDashoffset = offset;
    pctEl.textContent = pct + '%';
    doneEl.textContent = `${completedCount}/${total}`;
    titleEl.textContent = pct===100?'Day Complete! 🏆':pct>=50?'Good progress!':'Keep going!';
    subEl.textContent = `${total - completedCount} tasks remaining today. Tap each task to mark complete.`;
    countEl.textContent = `${completedCount} done`;
  }
  
  // Update cat pills
  const catColors = { run:'run', strength:'strength', food:'food', recovery:'recovery', work:'work', sleep:'sleep' };
  const catCounts = {};
  TIMELINE.forEach(t => { if (done[t.id]) catCounts[t.cat] = (catCounts[t.cat]||0)+1; });
  const totalCats = {};
  TIMELINE.forEach(t => totalCats[t.cat] = (totalCats[t.cat]||0)+1);
  const pills = document.querySelectorAll('.cat-pill');
  let i = 0;
  Object.entries(totalCats).forEach(([cat, tot]) => {
    if (pills[i]) pills[i].textContent = `${cat} ${catCounts[cat]||0}/${tot}`;
    i++;
  });
}

// ─── RENDER WEEK ──────────────────────────────────────────────────────────────
function renderWeek() {
  const page = document.getElementById('page-week');
  const today = DAYS[new Date().getDay()];
  const weekDone = getWeeklyDone();

  let html = `
  <div class="hdr">
    <div class="hdr-top">
      <div>
        <div class="hdr-label">Weekly Plan</div>
        <div class="hdr-title">Training Schedule</div>
      </div>
    </div>
  </div>
  <div class="week-grid">`;

  const dayOrder = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  dayOrder.forEach(day => {
    const plan = WEEK_PLAN[day];
    const isToday = day === today;
    let allTasks = [];
    if (plan.run) plan.run.forEach((t,i) => allTasks.push({...t, type:'run', idx: `run_${i}`}));
    if (plan.strength) plan.strength.forEach((t,i) => allTasks.push({...t, type:'strength', idx: `str_${i}`}));
    if (plan.rest) plan.rest.forEach((t,i) => allTasks.push({...t, type:'rest', idx: `rest_${i}`}));
    
    const doneCount = allTasks.filter(t => weekDone[`${day}_${t.idx}`]).length;
    const hasBoth = plan.run && plan.strength;
    
    html += `
    <div class="day-card">
      <div class="day-hdr" onclick="toggleDay('${day}')">
        <div class="${isToday?'day-today':'day-name'}">${day}${isToday?' ·':''}</div>
        <div class="day-badges">`;
    
    if (plan.run) html += `<span class="day-badge c-run bg-run">Run</span>`;
    if (plan.strength) html += `<span class="day-badge c-strength bg-strength">Strength</span>`;
    if (plan.rest) html += `<span class="day-badge" style="color:var(--text3);background:var(--bg3)">Rest</span>`;
    
    html += `
          <span class="day-prog">${doneCount}/${allTasks.length}</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" id="arr_${day}" style="color:var(--text3);transition:transform .2s;">
            <path d="M4 6l4 4 4-4"/>
          </svg>
        </div>
      </div>
      <div class="day-body" id="body_${day}">`;
    
    allTasks.forEach(task => {
      const isDone = !!weekDone[`${day}_${task.idx}`];
      const cc = task.type === 'run' ? 'run' : task.type === 'strength' ? 'strength' : 'sleep';
      html += `
        <div class="we-task" onclick="toggleWeekTask('${day}','${task.idx}')">
          <div class="we-task-check ${isDone?'checked':''}" id="wc_${day}_${task.idx}">
            ${isDone?`<svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4.5l3 3L10 1" stroke="#0a0a0f" stroke-width="2" stroke-linecap="round"/></svg>`:''}
          </div>
          <div class="we-task-txt ${isDone?'checked':''}">${task.name}</div>
          <div class="we-task-sets">${task.sets}</div>
        </div>`;
    });
    
    html += `</div></div>`;
    
    if (isToday) {
      // Auto-open today
      setTimeout(() => {
        const body = document.getElementById(`body_${day}`);
        const arr = document.getElementById(`arr_${day}`);
        if (body) { body.classList.add('open'); arr.style.transform = 'rotate(180deg)'; }
      }, 50);
    }
  });

  html += `</div>`;
  page.innerHTML = html;
}

function toggleDay(day) {
  const body = document.getElementById(`body_${day}`);
  const arr = document.getElementById(`arr_${day}`);
  body.classList.toggle('open');
  arr.style.transform = body.classList.contains('open') ? 'rotate(180deg)' : '';
}

function toggleWeekTask(day, idx) {
  const weekDone = getWeeklyDone();
  const key = `${day}_${idx}`;
  const newVal = !weekDone[key];
  setWeekTaskDone(day, idx, newVal);
  
  const check = document.getElementById(`wc_${day}_${idx}`);
  const txt = check.nextElementSibling;
  
  if (newVal) {
    check.classList.add('checked');
    check.innerHTML = `<svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4.5l3 3L10 1" stroke="#0a0a0f" stroke-width="2" stroke-linecap="round"/></svg>`;
    txt.classList.add('checked');
    showToast('Set complete! 🔥');
  } else {
    check.classList.remove('checked');
    check.innerHTML = '';
    txt.classList.remove('checked');
  }
  
  // Update count
  const plan = WEEK_PLAN[day];
  let allIdxs = [];
  if (plan.run) plan.run.forEach((_,i) => allIdxs.push(`run_${i}`));
  if (plan.strength) plan.strength.forEach((_,i) => allIdxs.push(`str_${i}`));
  if (plan.rest) plan.rest.forEach((_,i) => allIdxs.push(`rest_${i}`));
  const s = getState(); const k = getWeekKey(); const wd = s[k]||{};
  const dc = allIdxs.filter(i => wd[`${day}_${i}`]).length;
  const progEl = document.querySelector(`#body_${day}`).previousElementSibling.querySelector('.day-prog');
  if (progEl) progEl.textContent = `${dc}/${allIdxs.length}`;
}

// ─── RENDER DIET ──────────────────────────────────────────────────────────────
function renderDiet() {
  const page = document.getElementById('page-diet');
  const today = DAYS[new Date().getDay()];
  const isVeg = today === 'Tuesday' || today === 'Thursday';
  
  let html = `
  <div class="hdr">
    <div class="hdr-top">
      <div>
        <div class="hdr-label">Nutrition</div>
        <div class="hdr-title">Meal Plan</div>
        <div class="hdr-date">~2500-2700 kcal · 140-160g protein</div>
      </div>
    </div>
  </div>
  <div class="diet-toggle">
    <div class="diet-btn ${!isVeg?'active':''}" id="btnNonveg" onclick="showDietMode(false)">Non-Veg Days<br><span style="font-size:9px;color:var(--text3)">Mon/Wed/Fri/Sat/Sun</span></div>
    <div class="diet-btn ${isVeg?'active':''}" id="btnVeg" onclick="showDietMode(true)">Veg Only Days<br><span style="font-size:9px;color:var(--text3)">Tue / Thu</span></div>
  </div>
  <div class="meal-list" id="mealList">`;
  
  const meals = isVeg ? MEALS_VEG : MEALS_NONVEG;
  meals.forEach(m => {
    html += `
    <div class="meal-card">
      <div class="meal-top">
        <div class="meal-time-badge">${m.time}</div>
        <div class="meal-name">${m.name}</div>
        <div class="meal-desc">${m.items}</div>
        <div class="meal-macros">${m.macros.split('·').map(s=>`<span class="macro-tag">${s.trim()}</span>`).join('')}</div>
      </div>
      <div class="meal-sci">
        <div class="meal-sci-inner"><strong style="color:var(--accent);font-size:10px;font-family:'DM Mono',monospace;letter-spacing:.06em;">WHY</strong><br>${m.sci}</div>
      </div>
    </div>`;
  });
  
  html += `</div>`;
  page.innerHTML = html;
}

function showDietMode(isVeg) {
  document.getElementById('btnNonveg').classList.toggle('active', !isVeg);
  document.getElementById('btnVeg').classList.toggle('active', isVeg);
  const meals = isVeg ? MEALS_VEG : MEALS_NONVEG;
  const list = document.getElementById('mealList');
  list.innerHTML = meals.map(m => `
    <div class="meal-card">
      <div class="meal-top">
        <div class="meal-time-badge">${m.time}</div>
        <div class="meal-name">${m.name}</div>
        <div class="meal-desc">${m.items}</div>
        <div class="meal-macros">${m.macros.split('·').map(s=>`<span class="macro-tag">${s.trim()}</span>`).join('')}</div>
      </div>
      <div class="meal-sci">
        <div class="meal-sci-inner"><strong style="color:var(--accent);font-size:10px;font-family:'DM Mono',monospace;letter-spacing:.06em;">WHY</strong><br>${m.sci}</div>
      </div>
    </div>`).join('');
}

// ─── RENDER SCIENCE ───────────────────────────────────────────────────────────
function renderScience() {
  const page = document.getElementById('page-science');
  let html = `
  <div class="hdr">
    <div class="hdr-top">
      <div>
        <div class="hdr-label">Evidence-Based</div>
        <div class="hdr-title">The Science</div>
      </div>
    </div>
  </div>`;
  
  SCIENCE_DATA.forEach(sec => {
    html += `<div class="sci-section"><div class="sci-section-title">${sec.section}</div><div class="sci-cards">`;
    sec.cards.forEach(card => {
      html += `<div class="sci-card"><div class="sci-card-title">${card.title}</div><div class="sci-card-body">${card.body}</div></div>`;
    });
    html += `</div></div>`;
  });
  
  page.innerHTML = html;
}

// ─── RENDER STATS ─────────────────────────────────────────────────────────────
function renderStats() {
  const page = document.getElementById('page-stats');
  const streak = updateStreak();
  const s = getState();
  
  // Count total completed across all days
  let totalCompleted = 0;
  let daysActive = 0;
  Object.entries(s).forEach(([k,v]) => {
    if (k !== 'streakData' && !k.startsWith('week_') && typeof v === 'object') {
      const dayDone = Object.values(v).filter(Boolean).length;
      if (dayDone > 0) { daysActive++; totalCompleted += dayDone; }
    }
  });
  
  const today = DAYS[new Date().getDay()];
  const todayDone = Object.values(getCompletedToday()).filter(Boolean).length;
  const pct = Math.round((todayDone / TIMELINE.length) * 100);

  page.innerHTML = `
  <div class="hdr">
    <div class="hdr-top">
      <div>
        <div class="hdr-label">Athlete Profile</div>
        <div class="hdr-title">My Progress</div>
      </div>
    </div>
  </div>

  <div style="padding: 20px 20px 0;">
    <div class="profile-card">
      <div class="profile-row">
        <div class="avatar">AB</div>
        <div class="profile-info">
          <div class="profile-name">Athlete Blueprint</div>
          <div class="profile-stats">6'4" · 79 kg · Novice Runner</div>
        </div>
      </div>
      <div class="profile-tags">
        <span class="profile-tag c-run bg-run">Zone 2 Running</span>
        <span class="profile-tag c-strength bg-strength">Calisthenics</span>
        <span class="profile-tag c-accent bg-accent">Boxer Physique</span>
      </div>
    </div>
  </div>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-val c-accent">${streak.current}</div>
      <div class="stat-lbl">Day streak</div>
      <div class="stat-sub">best: ${streak.best} days</div>
    </div>
    <div class="stat-card">
      <div class="stat-val c-run">${pct}%</div>
      <div class="stat-lbl">Today complete</div>
      <div class="stat-sub">${todayDone}/${TIMELINE.length} tasks</div>
    </div>
    <div class="stat-card">
      <div class="stat-val c-strength">${daysActive}</div>
      <div class="stat-lbl">Active days</div>
      <div class="stat-sub">since start</div>
    </div>
    <div class="stat-card">
      <div class="stat-val c-food">${totalCompleted}</div>
      <div class="stat-lbl">Tasks done</div>
      <div class="stat-sub">all time</div>
    </div>
  </div>

  <div class="sec-hdr" style="margin-top:8px;"><div class="sec-title">Program Info</div></div>

  <div class="action-row">
    <div class="action-btn">
      <div class="action-btn-icon bg-run"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--run)" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg></div>
      <div class="action-btn-txt">
        <div class="action-btn-title">Week 1-4 · Base Building</div>
        <div class="action-btn-sub">Walk/jog intervals · Calisthenics foundation</div>
      </div>
    </div>
    <div class="action-btn">
      <div class="action-btn-icon bg-strength"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--strength)" stroke-width="2" stroke-linecap="round"><path d="M6 4v6a6 6 0 0 0 12 0V4M6 20h12"/></svg></div>
      <div class="action-btn-txt">
        <div class="action-btn-title">Target physique: Boxer build</div>
        <div class="action-btn-sub">Relative strength · Lean muscle · V-taper</div>
      </div>
    </div>
    <div class="action-btn">
      <div class="action-btn-icon" style="background:rgba(255,50,50,0.1);">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e05" stroke-width="2" stroke-linecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>
      </div>
      <div class="action-btn-txt" onclick="openModal()">
        <div class="action-btn-title" style="color:#e05;">Reset today's tasks</div>
        <div class="action-btn-sub">Uncheck all tasks for today</div>
      </div>
    </div>
  </div>

  <div class="sec-hdr"><div class="sec-title">Deload Reminder</div></div>
  <div style="padding: 0 20px 100px;">
    <div class="sci-card">
      <div class="sci-card-title">Every 4th week: reduce volume by 30-40%</div>
      <div class="sci-card-body">This is when supercompensation occurs. Keep the same schedule but do fewer sets and shorter runs. Your strength gains happen during the deload week, not despite it.</div>
    </div>
  </div>`;
}

// ─── TAB NAVIGATION ───────────────────────────────────────────────────────────
const TABS = ['today','week','diet','science','stats'];
let currentTab = 'today';

function switchTab(tab, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`page-${tab}`).classList.add('active');
  btn.classList.add('active');
  currentTab = tab;
  
  if (tab === 'today') renderToday();
  if (tab === 'week') renderWeek();
  if (tab === 'diet') renderDiet();
  if (tab === 'science') renderScience();
  if (tab === 'stats') renderStats();
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2000);
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
function openModal() { document.getElementById('resetModal').classList.add('open'); }
function closeModal() { document.getElementById('resetModal').classList.remove('open'); }
function confirmReset() {
  const s = getState();
  delete s[getTodayKey()];
  saveState(s);
  closeModal();
  showToast('Today reset!');
  renderToday();
  renderStats();
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
renderToday();
// Attach functions to the window so HTML onclicks work
window.switchTab = (tab, btn) => switchTab(tab, btn);
window.toggleTask = (id) => toggleTask(id);
window.toggleSci = (id) => toggleSci(id);
window.toggleDay = (day) => toggleDay(day);
window.toggleWeekTask = (day, idx) => toggleWeekTask(day, idx);
window.showDietMode = (isVeg) => showDietMode(isVeg);
window.openModal = () => openModal();
window.closeModal = () => closeModal();
window.confirmReset = () => confirmReset();

// The AI Coach Function
window.generateAIPlan = async function() {
  const btnTxt = document.getElementById('ai-btn-text');
  if (!btnTxt) return;
  
  const height = document.getElementById('ai-height').value;
  const weight = document.getElementById('ai-weight').value;
  const goals = document.getElementById('ai-goals').value;

  if (!height || !weight || !goals) {
    showToast("Please fill in all fields");
    return;
  }

  btnTxt.textContent = "Asking Gemini...";
  
  try {
    const response = await fetch('http://localhost:3000/api/generate-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ height, weight, goals })
    });
    
    if (!response.ok) throw new Error("Server error");
    const newPlan = await response.json();
    
    // Update local plan, save to cloud, and refresh UI
    Object.assign(WEEK_PLAN, newPlan);
    const currentState = getState();
    currentState.customPlan = newPlan;
    await saveState(currentState);
    
    showToast("New Plan Generated! 🔥");
    switchTab('week', document.querySelector('[data-tab="week"]'));
  } catch (error) {
    showToast("Error: Ensure server is running");
    console.error("AI Generation Error:", error);
  } finally {
    btnTxt.textContent = "Generate My Plan";
  }
};