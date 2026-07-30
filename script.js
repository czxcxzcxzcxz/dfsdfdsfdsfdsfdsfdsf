const $ = (s) => document.querySelector(s);
const store = JSON.parse(localStorage.aetherAgents || '{}');
let user = null;
let step = 0;
let area = 'briefing';
let avatarPos = { x: 45, y: 64 };

const locations = {
  briefing: { name: 'Aether HQ Briefing Suite', bg: 'briefing', spawn: [45, 64], people: [{ id: 'yuna', name: 'Yuna Bond 003', cls: 'yuna', x: 24, y: 48 }], items: [{ id: 'holo-map', name: 'City holo-map', cls: 'holo', x: 54, y: 42 }] },
  entrance: { name: 'Aether HQ Glass Entrance', bg: 'entrance', spawn: [20, 67], people: [], items: [{ id: 'sensor', name: 'Blue ID card sensor', cls: 'sensor', x: 12, y: 58 }, { id: 'door', name: 'Frosted security door', cls: 'door', x: 44, y: 33 }] },
  mission: { name: 'Mission Room', bg: 'mission', spawn: [42, 66], people: [{ id: 'yuna', name: 'Yuna Bond 003', cls: 'yuna', x: 18, y: 48 }], items: [{ id: 'mission-table', name: 'Seated mission HUD', cls: 'mission-table', x: 44, y: 48 }] },
  armory: { name: 'Training Armory', bg: 'armory', spawn: [45, 66], people: [], items: [{ id: 'trainer', name: 'Foam training pistol rack', cls: 'trainer', x: 50, y: 48 }, { id: 'targets', name: 'Soft target wall', cls: 'targets', x: 72, y: 38 }] },
  garage: { name: 'Marina Garage', bg: 'garage', spawn: [58, 67], people: [], items: [{ id: 'motorcycle', name: 'Electric motorcycle', cls: 'motorcycle', x: 72, y: 57 }, { id: 'gps', name: 'AR GPS waypoint', cls: 'gps', x: 38, y: 38 }, { id: 'prop-cigarette', name: 'Console prop cigarette', cls: 'prop-cigarette', x: 63, y: 45 }] },
  museum: { name: 'Museum Operations Office', bg: 'museum', spawn: [36, 67], people: [{ id: 'tourist', name: 'Curious tourist', cls: 'tourist-person', x: 62, y: 55 }, { id: 'dae', name: 'Dae Park', cls: 'magenta', x: 20, y: 55 }], items: [{ id: 'document', name: 'Operations document', cls: 'document', x: 77, y: 43 }, { id: 'display-case', name: 'Quiet display case', cls: 'display-case', x: 44, y: 42 }] },
  plaza: { name: 'Harbor Plaza Free Roam', bg: 'free', spawn: [45, 64], people: [{ id: 'ren', name: 'Ren Sato 008', cls: 'red', x: 70, y: 52 }, { id: 'dae', name: 'Dae Park', cls: 'magenta', x: 28, y: 55 }, { id: 'yuna', name: 'Yuna Bond 003', cls: 'yuna', x: 50, y: 44 }], items: [{ id: 'kiosk', name: 'Mission kiosk', cls: 'kiosk', x: 18, y: 38 }, { id: 'garage-link', name: 'Garage tram', cls: 'garage-link', x: 82, y: 62 }] },
};
const tutorial = [
  { loc: 'briefing', focus: 'yuna', action: 'Meet Yuna', text: 'Yuna Bond 003 welcomes you inside the briefing suite and confirms this is an original Aether field program.' },
  { loc: 'entrance', focus: 'sensor', action: 'Tap ID card', text: 'At the glass entrance, tap the blue card sensor for non-biometric authentication. No face, eye, or fingerprint scan is used.' },
  { loc: 'mission', focus: 'mission-table', action: 'Open briefing HUD', text: 'In the mission room, sit at the table and read your assignment through the floating HUD.' },
  { loc: 'armory', focus: 'trainer', action: 'Equip trainer', text: 'In the training armory, collect a foam training pistol for non-graphic arcade encounters.' },
  { loc: 'garage', focus: 'motorcycle', action: 'Prep motorcycle', text: 'In the marina garage, prepare the motorcycle, set AR GPS coordinates, and pick up the console prop cigarette.' },
  { loc: 'museum', focus: 'document', action: 'Secure document', text: 'Inside the museum operations office, obtain the operations document while the tourist blocks the direct path.' },
  { loc: 'museum', focus: 'dae', action: 'Ask Dae to distract', text: 'Coordinate with Dae Park so he politely distracts the tourist while you finish the tutorial drill.' },
  { loc: 'plaza', focus: 'kiosk', action: 'Enter free roam', text: 'Tutorial complete. Harbor Plaza is open: walk anywhere, talk to agents, collect gear, and choose casual missions.' },
];

function save() { localStorage.aetherAgents = JSON.stringify(store); }
function show(id) { ['auth', 'customize', 'game'].forEach((x) => $('#' + x).classList.toggle('hidden', x !== id)); }
function formLook() { return Object.fromEntries(new FormData($('#customForm'))); }
function outfitClass(outfit = '') { if (outfit.includes('Tuxedo') && !outfit.includes('wetsuit')) return 'tuxedo'; if (outfit.includes('Tailored')) return 'tailored'; if (outfit.includes('Metallic')) return 'metallic'; return 'hybrid'; }
function applyLook(el, data = user || formLook()) { el.className = `${el.id === 'player' ? 'player' : 'avatar'} ${outfitClass(data.outfit)} ${data.visor ? 'visor' : ''} hair-${(data.hair || 'Sleek low bun').toLowerCase().split(' ')[0]}`; el.querySelector('span').textContent = el.id === 'player' ? (data.displayName || 'You') : '00?'; }
function updatePreview() { const data = formLook(); data.visor = $('#customForm').visor.checked; applyLook($('#avatar'), data); $('#avatarCaption').textContent = `${data.displayName} preview: ${data.outfit}, ${data.hair}, ${data.visor ? 'with' : 'without'} AR sunglasses.`; }
function setLocation(id, focus = '') {
  area = id; const loc = locations[id]; avatarPos = { x: loc.spawn[0], y: loc.spawn[1] };
  $('#stage').className = `stage ${loc.bg}`; $('#locationName').textContent = loc.name; $('#stageEntities').innerHTML = '';
  [...loc.items, ...loc.people].forEach((e) => { const node = document.createElement('div'); node.className = `${loc.people.includes(e) ? 'person npc' : 'item'} ${e.cls} ${e.id === focus ? 'active' : ''}`; node.style.left = `${e.x}%`; node.style.top = `${e.y}%`; node.dataset.id = e.id; node.innerHTML = `<span>${e.name}</span>`; node.onclick = () => interact(e.id); $('#stageEntities').append(node); });
  movePlayer(0, 0); $('#worldCaption').textContent = `${loc.name}: use WASD, arrow keys, or the move buttons to walk freely.`;
}
function movePlayer(dx, dy) { avatarPos.x = Math.max(3, Math.min(88, avatarPos.x + dx)); avatarPos.y = Math.max(30, Math.min(76, avatarPos.y + dy)); $('#player').style.left = `${avatarPos.x}%`; $('#player').style.top = `${avatarPos.y}%`; }
function interact(id) { const loc = locations[area]; const found = [...loc.items, ...loc.people].find((e) => e.id === id); if (found) chat('Nearby', `You interact with ${found.name} in ${loc.name}.`); }
function renderStep() { const t = tutorial[step] || tutorial.at(-1); $('#dialogue').textContent = t.text; $('#stepAction').textContent = t.action; setLocation(t.loc, t.focus); $('#worldCaption').textContent = `Tutorial focus: ${t.action}. Walk to or click the highlighted ${t.focus.replace('-', ' ')}.`; if (step >= tutorial.length) { user.rank = 'Ace Agent'; $('#rank').textContent = 'Ace Agent'; save(); } }
function startGame() { show('game'); $('#agentName').textContent = user.displayName || user.fullName; $('#rank').textContent = user.rank; $('#credits').textContent = user.credits; applyLook($('#player'), user); step = 0; renderStep(); chat('System', 'Online feature connected to the Aether demo shard.'); }

$('#createForm').onsubmit = (e) => { e.preventDefault(); const d = Object.fromEntries(new FormData(e.target)); store[d.username] = { ...d, rank: 'New Agent', credits: 250 }; user = store[d.username]; save(); show('customize'); updatePreview(); };
$('#loginForm').onsubmit = (e) => { e.preventDefault(); const d = Object.fromEntries(new FormData(e.target)); if (store[d.username]?.password === d.password) { user = store[d.username]; startGame(); } else $('#authMessage').textContent = 'Account not found or password mismatch.'; };
$('#customForm').oninput = updatePreview;
$('#customForm').onsubmit = (e) => { e.preventDefault(); Object.assign(user, formLook(), { visor: e.target.visor.checked }); save(); startGame(); };
$('#stepAction').onclick = () => { chat('Tutorial', `Completed: ${tutorial[step]?.action || 'Free roam'}.`); step++; renderStep(); };
$('#nextStep').onclick = () => { step++; renderStep(); };
$('#freeRoam').onclick = () => { step = tutorial.length; renderStep(); };
$('#logout').onclick = () => { user = null; show('auth'); };
document.querySelectorAll('[data-move]').forEach((b) => b.onclick = () => { const [dx, dy] = b.dataset.move.split(',').map(Number); movePlayer(dx, dy); });
window.addEventListener('keydown', (e) => { const k = e.key.toLowerCase(); if (['arrowup', 'w'].includes(k)) movePlayer(0, -4); if (['arrowdown', 's'].includes(k)) movePlayer(0, 4); if (['arrowleft', 'a'].includes(k)) movePlayer(-4, 0); if (['arrowright', 'd'].includes(k)) movePlayer(4, 0); });
document.querySelectorAll('[data-action]').forEach((b) => b.onclick = () => { const a = b.dataset.action; if (a === 'explore') { const ids = Object.keys(locations); setLocation(ids[(ids.indexOf(area) + 1) % ids.length]); } if (a === 'combat') { setLocation('plaza', 'ren'); chat('Mini-game', 'Ren Sato 008 starts a friendly non-graphic sparring drill in the plaza.'); } if (a === 'loot') { const gear = ['compact camera gadget', 'electric motorcycle', 'foam training launcher', 'AR lock mapper']; $('#weapon').textContent = gear[Math.floor(Math.random() * gear.length)]; user.credits += 75; $('#credits').textContent = user.credits; save(); chat('Inventory', `Obtained ${$('#weapon').textContent} and 75 credits.`); } });
document.querySelectorAll('[data-talk]').forEach((b) => b.onclick = () => ({ yuna: chat('Yuna Bond 003', 'Meet me in the briefing suite when you want another calm assignment.'), dae: chat('Dae Park', 'I can distract civilians in the museum office without escalating anything.'), ren: chat('Ren Sato 008', 'Find me in Harbor Plaza for standalone sparring missions.') }[b.dataset.talk]));
function chat(who, msg) { const line = document.createElement('div'); line.className = 'chat-line'; line.innerHTML = `<strong>${who}:</strong> ${msg}`; $('#chatLog').prepend(line); }
setInterval(() => $('#onlineCount').textContent = `${120 + Math.floor(Math.random() * 30)} agents online`, 2500);
updatePreview();
