window.state={crystals:2480,energy:7,ready:{Элори:140,Фонея:80},spinning:false};
const state = window.state;
const $=s=>document.querySelector(s),format=n=>n.toLocaleString('ru-RU');
function update(){ 
  $('#crystalValue').textContent=format(state.crystals);
  $('#energyValue').textContent=state.energy;
  $('#readyTotal').textContent=Object.values(state.ready).reduce((a,b)=>a+b,0); 
  if (window.update3DScene) window.update3DScene(state);
}
function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2200)}
function collect(moon){if(!moon || moon.startsWith('slot'))return toast('Открой этот слот за 10 000 ✦');const amount=state.ready[moon];if(!amount)return toast('Эта луна ещё заряжается');state.crystals+=amount;delete state.ready[moon];const button=[...document.querySelectorAll('.moon')].find(x=>x.dataset.moon===moon);if(button)button.querySelector('small').textContent='08:24';$('#naviText').textContent='Отлично! Заряди луну, чтобы вырастить ещё кристаллы.';update();toast(`+${amount} кристаллов · ${moon}`)}
document.querySelectorAll('.moon').forEach(b=>b.addEventListener('click',()=>collect(b.dataset.moon || b.dataset.id)));
$('#collectAll').addEventListener('click',()=>{if(!Object.keys(state.ready).length)return toast('Пока нечего собирать');Object.keys({...state.ready}).forEach(collect)});
$('#chargeAll').addEventListener('click',()=>{if(state.energy<1)return toast('Нужно больше энергии');state.energy--;$('#naviText').textContent='Луны заряжены. Кристаллы вырастут совсем скоро!';update();toast('Луны заряжены · −1 энергия')});
const sheets={tasks:'#tasksSheet',wheel:'#wheelSheet',draws:'#drawsSheet'};
function closeSheets(){document.querySelectorAll('.sheet').forEach(x=>x.classList.add('hidden'))}
document.querySelectorAll('.nav-item').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.nav-item').forEach(x=>x.classList.remove('active'));b.classList.add('active');closeSheets();if(sheets[b.dataset.view])$(sheets[b.dataset.view]).classList.remove('hidden')}));
document.querySelectorAll('.close-sheet').forEach(b=>b.addEventListener('click',()=>{closeSheets();document.querySelector('[data-view=home]').click()}));
$('#planetButton').addEventListener('click',()=>toast('Магазин планеты появится в следующей версии'));
$('#spinWheel').addEventListener('click',()=>{if(state.spinning)return;state.spinning=true;const w=$('.wheel');w.style.transition='transform 2s cubic-bezier(.16,.75,.18,1)';w.style.transform='rotate(1080deg)';setTimeout(()=>{state.crystals+=250;update();toast('Приз колеса: +250 кристаллов!');w.style.transition='none';w.style.transform='rotate(0)';state.spinning=false},2100)});
document.querySelectorAll('.task-go,.prize-card button').forEach(b=>b.addEventListener('click',()=>toast('Механика доступна в полном продукте')));

const menuButton = $('#menuButton');
const closeMenu = $('#closeMenu');
const sideMenu = $('#sideMenu');
const openGames = $('#openGames');

if (menuButton && sideMenu) {
  menuButton.addEventListener('click', () => sideMenu.classList.remove('hidden'));
}
if (closeMenu && sideMenu) {
  closeMenu.addEventListener('click', () => sideMenu.classList.add('hidden'));
}
if (openGames) {
  openGames.addEventListener('click', () => {
    if (sideMenu) sideMenu.classList.add('hidden');
    closeSheets();
    const gamesSheet = $('#gamesSheet');
    if (gamesSheet) gamesSheet.classList.remove('hidden');
  });
}
const menuGameButton = $('#menuGameButton');
if (menuGameButton) {
  menuGameButton.addEventListener('click', () => {
    if (sideMenu) sideMenu.classList.add('hidden');
    closeSheets();
    const gamesSheet = $('#gamesSheet');
    if (gamesSheet) gamesSheet.classList.remove('hidden');
  });
}
const menuLinkTasks = $('#menuLinkTasks');
if (menuLinkTasks) menuLinkTasks.addEventListener('click', () => { if(sideMenu) sideMenu.classList.add('hidden'); document.querySelector('[data-view=tasks]').click(); });
const menuLinkWheel = $('#menuLinkWheel');
if (menuLinkWheel) menuLinkWheel.addEventListener('click', () => { if(sideMenu) sideMenu.classList.add('hidden'); document.querySelector('[data-view=wheel]').click(); });

const goWater = $('#goWater');
if (goWater) goWater.addEventListener('click', () => { closeSheets(); $('#waterSheet').classList.remove('hidden'); });

const goArrow = $('#goArrow');
if (goArrow) goArrow.addEventListener('click', () => { closeSheets(); $('#arrowSheet').classList.remove('hidden'); });

const goCharge = $('#goCharge');
if (goCharge) goCharge.addEventListener('click', () => { closeSheets(); });

document.querySelectorAll('.game-card').forEach(b=>b.addEventListener('click',()=>{closeSheets();$(`#${b.dataset.game}Sheet`).classList.remove('hidden')}));

const waterStart=[['cyan','pink','orange'],['pink','orange','cyan'],['orange','cyan','pink'],[]];let water=[],selectedTube=null;
function resetWater(){water=waterStart.map(t=>[...t]);selectedTube=null;renderWater()}
function renderWater(){const board=$('#waterBoard');board.innerHTML='';water.forEach((tube,index)=>{const b=document.createElement('button');b.className=`tube ${selectedTube===index?'selected':''}`;b.setAttribute('aria-label',`Пробирка ${index+1}`);tube.forEach(color=>{const layer=document.createElement('i');layer.className=`water ${color}`;b.append(layer)});b.addEventListener('click',()=>pourWater(index));board.append(b)})}
function pourWater(target){if(selectedTube===null){if(!water[target].length)return toast('Эта пробирка пуста');selectedTube=target;return renderWater()}if(selectedTube===target){selectedTube=null;return renderWater()}const from=water[selectedTube],to=water[target],color=from[from.length-1];if(to.length===3||to.length&&to[to.length-1]!==color){selectedTube=null;renderWater();return toast('Вода смешается — выбери другую пробирку')}to.push(from.pop());selectedTube=null;renderWater();if(water.every(t=>!t.length||t.length===3&&new Set(t).size===1)){state.crystals+=100;update();toast('Уровень пройден! +100 кристаллов')}}
$('#resetWater').addEventListener('click',resetWater);

const arrowStart=['→','↓','↓','→',null,'←','→','↑','←'];let arrows=[];const vectors={'→':[0,1],'←':[0,-1],'↑':[-1,0],'↓':[1,0]};
function resetArrow(){arrows=[...arrowStart];renderArrows()}
function renderArrows(){const board=$('#arrowBoard');board.innerHTML='';arrows.forEach((arrow,index)=>{const b=document.createElement('button');b.className=`arrow-tile ${arrow?'':'empty'}`;b.textContent=arrow||'';if(arrow)b.addEventListener('click',()=>launchArrow(index,b));board.append(b)})}
function launchArrow(index,button){const [dr,dc]=vectors[arrows[index]],row=Math.floor(index/3),col=index%3;let r=row+dr,c=col+dc;while(r>=0&&r<3&&c>=0&&c<3){if(arrows[r*3+c]){button.classList.add('blocked');setTimeout(()=>button.classList.remove('blocked'),350);return toast('Путь занят другой луной')}r+=dr;c+=dc}button.classList.add('fly');arrows[index]=null;setTimeout(renderArrows,380);if(!arrows.filter(Boolean).length)setTimeout(()=>{state.energy++;state.crystals+=100;update();toast('Затор расчищен! +1 энергия и +100 кристаллов')},420)}
$('#resetArrow').addEventListener('click',resetArrow);resetWater();resetArrow();update();
