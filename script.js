const $=s=>document.querySelector(s);const store=JSON.parse(localStorage.aetherAgents||'{}');let user=null,step=0,area=0;const tutorial=[
'Yuna Bond 003: Welcome, recruit. I am Yuna Bond, codename 003—original Aether field lead, not affiliated with any official real-world agency.',
'At the HQ entrance, authenticate non-biometrically: tap your ID card on the blue entrance sensor. No fingerprints, face scans, or eye scans are needed.',
'This is the mission room. Sit at the table and accept briefings through the floating HUD screen whenever you want a casual assignment.',
'Take this training pistol. Use it only in simulated hostile encounters against fictional, non-graphic targets.',
'Prepare your motorcycle, set GPS coordinates in the AR visor, take a prop cigarette from the vehicle console, and follow calm GPS advice to the museum.',
'Tutorial mission: quietly obtain a private document about the museum operational style and employee info. A tourist is your obstacle; distract them politely.',
'Bring Dae Park, our magenta-suited partner. He can distract civilians while you handle arcade-style enemy shooting drills.',
'Great work. You can go anywhere at this point. Goodbye, agent—and keep the tone friendly.'
];
function save(){localStorage.aetherAgents=JSON.stringify(store)}
function show(id){['auth','customize','game'].forEach(x=>$('#'+x).classList.toggle('hidden',x!==id))}
$('#createForm').onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));store[d.username]={...d,rank:'New Agent',credits:250};user=store[d.username];save();show('customize')}
$('#loginForm').onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));if(store[d.username]?.password===d.password){user=store[d.username];startGame()}else $('#authMessage').textContent='Account not found or password mismatch.'}
$('#customForm').oninput=e=>{$('#avatarCaption').textContent=`${new FormData(e.currentTarget).get('displayName')} preview: fixed warm light-medium complexion, black hair, dark brown eyes.`}
$('#customForm').onsubmit=e=>{e.preventDefault();Object.assign(user,Object.fromEntries(new FormData(e.target)),{visor:e.target.visor.checked});save();startGame()}
function startGame(){show('game');$('#agentName').textContent=user.displayName||user.fullName;$('#rank').textContent=user.rank;$('#credits').textContent=user.credits;step=0;renderStep();chat('System','Online feature connected to the Aether demo shard.')}
function renderStep(){ $('#dialogue').textContent=tutorial[step]||'Free roam unlocked: explore, talk, collect gear, or start the friendly combat mini-game.'; if(step>=tutorial.length){user.rank='Ace Agent';$('#rank').textContent='Ace Agent';save()}}
$('#nextStep').onclick=()=>{step++;renderStep()};$('#freeRoam').onclick=()=>{step=tutorial.length;renderStep()};$('#logout').onclick=()=>{user=null;show('auth')}
document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>{const a=b.dataset.action;if(a==='explore'){const areas=['HQ atrium','harbor promenade','museum lobby','cafe arcade','marina garage'];area=(area+1)%areas.length;chat('World',`You travel to ${areas[area]} in 2.5D parallax view.`)}if(a==='combat'){chat('Mini-game','Sparring starts: you face Yuna Bond 003, Dae Park, and Ren Sato 008 in a non-graphic arcade duel.')}if(a==='loot'){const gear=['compact camera gadget','electric motorcycle','foam training launcher','AR lock mapper'];$('#weapon').textContent=gear[Math.floor(Math.random()*gear.length)];user.credits+=75;$('#credits').textContent=user.credits;save();chat('Inventory',`Obtained ${$('#weapon').textContent} and 75 credits.`)}})
document.querySelectorAll('[data-talk]').forEach(b=>b.onclick=()=>({yuna:chat('Yuna Bond 003','The hybrid tux-wetsuit is for land-and-water fieldwork; red stripes mark shoulders and leg sides only.'),dae:chat('Dae Park','I handle polite distractions. Tourists love a good museum cafe recommendation.'),ren:chat('Ren Sato 008','Red suit ready. The franchise has standalone missions, not one giant arc.') }[b.dataset.talk]))
function chat(who,msg){const line=document.createElement('div');line.className='chat-line';line.innerHTML=`<strong>${who}:</strong> ${msg}`;$('#chatLog').prepend(line)}
setInterval(()=>$('#onlineCount').textContent=`${120+Math.floor(Math.random()*30)} agents online`,2500)
