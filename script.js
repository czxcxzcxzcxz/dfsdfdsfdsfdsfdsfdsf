const $ = (s) => document.querySelector(s);
const store = JSON.parse(localStorage.aetherAgents || '{}');
let user = null;
let step = 0;
let area = 0;

const tutorial = [
  { zone: 'briefing', player: [34, 58], target: 'yuna', action: 'Meet handler', text: 'Yuna Bond 003: Welcome, recruit. I am Yuna Bond, codename 003—original Aether field lead, not affiliated with any official real-world agency.' },
  { zone: 'entrance', player: [8, 67], target: 'sensor', action: 'Tap ID card', text: 'At the HQ entrance, authenticate non-biometrically: tap your ID card on the blue entrance sensor. No fingerprints, face scans, or eye scans are needed.' },
  { zone: 'mission', player: [39, 58], target: 'mission-table', action: 'Sit for briefing', text: 'This is the mission room. Sit at the table and accept briefings through the floating HUD screen whenever you want a casual assignment.' },
  { zone: 'armory', player: [55, 61], target: 'armory', action: 'Equip trainer', text: 'Take this training pistol. Use it only in simulated hostile encounters against fictional, non-graphic targets.' },
  { zone: 'garage', player: [79, 67], target: 'motorcycle', action: 'Set GPS', text: 'Prepare your motorcycle, set GPS coordinates in the AR visor, take a prop cigarette from the vehicle console, and follow calm GPS advice to the museum.' },
  { zone: 'museum', player: [61, 57], target: 'document', action: 'Secure document', text: 'Tutorial mission: quietly obtain a private document about the museum operational style and employee info. A tourist is your obstacle; distract them politely.' },
  { zone: 'museum', player: [52, 57], target: 'magenta', action: 'Coordinate partner', text: 'Bring Dae Park, our magenta-suited partner. He can distract civilians while you handle arcade-style enemy shooting drills.' },
  { zone: 'free', player: [34, 58], target: 'exit', action: 'Unlock free roam', text: 'Great work. You can go anywhere at this point. Goodbye, agent—and keep the tone friendly.' },
];

function save() { localStorage.aetherAgents = JSON.stringify(store); }
function show(id) { ['auth', 'customize', 'game'].forEach((x) => $('#' + x).classList.toggle('hidden', x !== id)); }
function formLook() { return Object.fromEntries(new FormData($('#customForm'))); }
function outfitClass(outfit = '') {
  if (outfit.includes('Tuxedo') && !outfit.includes('wetsuit')) return 'tuxedo';
  if (outfit.includes('Tailored')) return 'tailored';
  if (outfit.includes('Metallic')) return 'metallic';
  return 'hybrid';
}
function applyLook(el, data = user || formLook()) {
  el.className = `${el.id === 'player' ? 'player' : 'avatar'} ${outfitClass(data.outfit)} ${data.visor ? 'visor' : ''} hair-${(data.hair || 'Sleek low bun').toLowerCase().split(' ')[0]} gender-${(data.gender || 'woman').toLowerCase()}`;
  el.querySelector('span').textContent = el.id === 'player' ? (data.displayName || 'You') : '00?';
}
function updatePreview() {
  const data = formLook();
  data.visor = $('#customForm').visor.checked;
  applyLook($('#avatar'), data);
  $('#avatarCaption').textContent = `${data.displayName} preview: ${data.outfit}, ${data.hair}, ${data.visor ? 'with' : 'without'} AR sunglasses.`;
}

$('#createForm').onsubmit = (e) => { e.preventDefault(); const d = Object.fromEntries(new FormData(e.target)); store[d.username] = { ...d, rank: 'New Agent', credits: 250 }; user = store[d.username]; save(); show('customize'); updatePreview(); };
$('#loginForm').onsubmit = (e) => { e.preventDefault(); const d = Object.fromEntries(new FormData(e.target)); if (store[d.username]?.password === d.password) { user = store[d.username]; startGame(); } else $('#authMessage').textContent = 'Account not found or password mismatch.'; };
$('#customForm').oninput = updatePreview;
$('#customForm').onsubmit = (e) => { e.preventDefault(); Object.assign(user, formLook(), { visor: e.target.visor.checked }); save(); startGame(); };

function startGame() { show('game'); $('#agentName').textContent = user.displayName || user.fullName; $('#rank').textContent = user.rank; $('#credits').textContent = user.credits; applyLook($('#player'), user); step = 0; renderStep(); chat('System', 'Online feature connected to the Aether demo shard.'); }
function renderStep() {
  const t = tutorial[step] || { zone: 'free', player: [34, 58], target: '', action: 'Free roam', text: 'Free roam unlocked: explore, talk, collect gear, or start the friendly combat mini-game.' };
  $('#dialogue').textContent = t.text;
  $('#stepAction').textContent = t.action;
  $('#stage').className = `stage ${t.zone}`;
  $('#stage').dataset.focus = t.target;
  $('#player').style.left = `${t.player[0]}%`;
  $('#player').style.top = `${t.player[1]}%`;
  document.querySelectorAll('.hotspot,.npc').forEach((el) => el.classList.toggle('active', el.classList.contains(t.target)));
  $('#worldCaption').textContent = `Current interaction: ${t.action}. Visual focus: ${t.target || 'open world'}.`;
  if (step >= tutorial.length) { user.rank = 'Ace Agent'; $('#rank').textContent = 'Ace Agent'; save(); }
}
$('#stepAction').onclick = () => { chat('Tutorial', `Completed: ${tutorial[step]?.action || 'Free roam'}.`); step++; renderStep(); };
$('#nextStep').onclick = () => { step++; renderStep(); };
$('#freeRoam').onclick = () => { step = tutorial.length; renderStep(); };
$('#logout').onclick = () => { user = null; show('auth'); };

document.querySelectorAll('[data-action]').forEach((b) => b.onclick = () => { const a = b.dataset.action; if (a === 'explore') { const areas = ['HQ atrium', 'harbor promenade', 'museum lobby', 'cafe arcade', 'marina garage']; area = (area + 1) % areas.length; $('#stage').className = `stage free area-${area}`; chat('World', `You travel to ${areas[area]} in 2.5D parallax view.`); } if (a === 'combat') { $('#stage').className = 'stage combat'; chat('Mini-game', 'Sparring starts: you face Yuna Bond 003, Dae Park, and Ren Sato 008 in a non-graphic arcade duel.'); } if (a === 'loot') { const gear = ['compact camera gadget', 'electric motorcycle', 'foam training launcher', 'AR lock mapper']; $('#weapon').textContent = gear[Math.floor(Math.random() * gear.length)]; user.credits += 75; $('#credits').textContent = user.credits; save(); chat('Inventory', `Obtained ${$('#weapon').textContent} and 75 credits.`); } });
document.querySelectorAll('[data-talk]').forEach((b) => b.onclick = () => ({ yuna: chat('Yuna Bond 003', 'The hybrid tux-wetsuit is for land-and-water fieldwork; red stripes mark shoulders and leg sides only.'), dae: chat('Dae Park', 'I handle polite distractions. Tourists love a good museum cafe recommendation.'), ren: chat('Ren Sato 008', 'Red suit ready. The franchise has standalone missions, not one giant arc.') }[b.dataset.talk]));
function chat(who, msg) { const line = document.createElement('div'); line.className = 'chat-line'; line.innerHTML = `<strong>${who}:</strong> ${msg}`; $('#chatLog').prepend(line); }
setInterval(() => $('#onlineCount').textContent = `${120 + Math.floor(Math.random() * 30)} agents online`, 2500);
updatePreview();
