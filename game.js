const S=7,GAP=2.2,BR=80,BS=65,GR=18,WA=14,VP=32,VT=20,WN={clear:'☀️ 맑음',cloud:'☁️ 흐림',wind:'🌬 바람'},curBR=()=>st.weather=='cloud'?40:BR,$=id=>document.getElementById(id),cv=$('c'),g=cv.getContext('2d');
// 기지는 왼쪽 하단. 길은 플레이어 뒤쪽(아래)에만 있고, 입구 E에서 시작해 기지로 이어짐
const PATH=[[30,66],[30,74],[50,74],[50,82],[20,82],[20,90],[4,90],[4,96]];
const E=PATH[0],BASE=[4,96];
const L=[0];for(let i=1;i<PATH.length;i++)L.push(L[i-1]+Math.hypot(PATH[i][0]-PATH[i-1][0],PATH[i][1]-PATH[i-1][1]));
const TOT=L[L.length-1];
function pos(s){let i=1;while(i<L.length-1&&L[i]<s)i++;const t=(s-L[i-1])/(L[i]-L[i-1]);return[PATH[i-1][0]+(PATH[i][0]-PATH[i-1][0])*t,PATH[i-1][1]+(PATH[i][1]-PATH[i-1][1])*t]}
function dPath(x,y){let m=1e9;for(let i=1;i<PATH.length;i++){const[a,b]=PATH[i-1],[c,d]=PATH[i],dx=c-a,dy=d-b,t=Math.max(0,Math.min(1,((x-a)*dx+(y-b)*dy)/(dx*dx+dy*dy)));m=Math.min(m,Math.hypot(x-a-t*dx,y-b-t*dy))}return m}

// 배경(한 번만 그려 두기)
const fogc=document.createElement('canvas');fogc.width=fogc.height=700;const fg=fogc.getContext('2d');
const bg=document.createElement('canvas');bg.width=bg.height=700;
(function(){const b=bg.getContext('2d');let r=7;const R=()=>(r=(r*16807)%2147483647)/2147483647;
 b.fillStyle='#3f6b34';b.fillRect(0,0,700,700);
 for(let i=0;i<40;i++){b.fillStyle=R()<.5?'rgba(30,70,30,.25)':'rgba(120,170,70,.15)';b.beginPath();b.arc(R()*700,R()*700,20+R()*50,0,7);b.fill()}
 for(let i=0;i<900;i++){const x=R()*700,y=R()*700;b.strokeStyle=R()<.5?'#2f5a2a':'#5f9a46';b.lineWidth=1.2;b.beginPath();b.moveTo(x,y);b.lineTo(x+(R()-.5)*4,y-3-R()*4);b.stroke()}
 for(let i=0;i<30;i++){b.fillStyle='#777';b.beginPath();b.ellipse(R()*700,R()*700,3+R()*4,2+R()*3,0,0,7);b.fill()}
 for(let i=0;i<40;i++){b.fillStyle=['#f8f0a0','#fff','#f4a6c0'][i%3];b.beginPath();b.arc(R()*700,R()*700,1.6,0,7);b.fill()}
})();

let st,P,placing=false,sel=null,mode=null,mx=-9,my=-9,T=0;const keys={},pop=$('pop');
const mkP=(x,a,k,c,h)=>({x,y:70,a,t:0,w:0,hold:0,k,c,h,up:{rate:0,dmg:0,pierce:0}});
function init(){
 st={stage:1,wave:0,gold:0,base:100,weather:'clear',wt:30,wx:0,wy:0,wm:0,zd:10,bm:0,boss:false,phase:'ready',cd:8,queue:0,sp:0,hp:0,spd:0,z:[],b:[],gd:[],fx:[],over:false};
 P=[mkP(28,-Math.PI/2-.3,['KeyA','KeyD'],'#3b82f6','#1e40af'),mkP(32,-Math.PI/2+.3,['ArrowLeft','ArrowRight'],'#f97316','#9a3412')];
 if(mode=='solo'){P[1].ai=true;P[0].k2=['ArrowLeft','ArrowRight'];st.gold=80}
 placing=false;select(null);
}
init();

// 업그레이드 팝업: 캐릭터를 클릭하면 그 캐릭터 옆에 강화 버튼이 뜸
const defs={p:[['발사속도','rate',30],['데미지','dmg',30],['관통','pierce',50]],g:[['데미지','dmg',30],['공격속도','rate',30],['사거리','rng',40]]};
const ucost=(c,l)=>Math.round(c*1.5**l);
function select(o,type){sel=o?{o,type,btns:[]}:null;pop.innerHTML='';pop.style.display=o?'block':'none';if(!o)return;
 const h=document.createElement('div');h.className='ph';pop.appendChild(h);sel.h=h;
 defs[type].forEach(([n,k,c])=>{const b=document.createElement('button');
  b.onclick=e=>{e.stopPropagation();const v=ucost(c,o.up[k]);if(st.gold>=v&&!st.over){st.gold-=v;o.up[k]++}};
  pop.appendChild(b);sel.btns.push({b,n,k,c})})}
function updatePop(){if(!sel)return;const{o,type}=sel;
 if(type=='g'&&!st.gd.includes(o)){select(null);return}
 sel.h.textContent=type=='p'?'P'+(P.indexOf(o)+1)+' 강화':'포탑 #'+(st.gd.indexOf(o)+1)+' 강화';
 sel.btns.forEach(({b,n,k,c})=>{const v=ucost(c,o.up[k]);b.textContent=`${n}  Lv${o.up[k]} · ${v}G`;b.disabled=st.gold<v||st.over});
 const r=cv.getBoundingClientRect(),kk=r.width/700,px=o.x*S*kk,py=o.y*S*kk,w=pop.offsetWidth||176;
 pop.style.left=(px+26+w>r.width?px-26-w:px+26)+'px';pop.style.top=Math.max(4,Math.min(py-30,r.height-(pop.offsetHeight||120)-4))+'px'}
const gcost=()=>40+20*st.gd.length;
$('gb').onclick=()=>{placing=!placing;if(placing)select(null)};
$('m1').onclick=()=>{mode='solo';init();$('menu').style.display='none'};
$('m2').onclick=()=>{mode='multi';init();$('menu').style.display='none'};
$('mb').onclick=()=>{mode=null;select(null);$('menu').style.display='flex'};
$('go').onclick=()=>{if(st.over)init();else if(st.phase=='ready')startWave();else if(st.phase=='clear')nextStage()};

// 입력
addEventListener('keydown',e=>{keys[e.code]=1;if(e.code=='Escape'){placing=false;select(null)}if(e.code.startsWith('Arrow'))e.preventDefault()});
addEventListener('keyup',e=>keys[e.code]=0);
function mpos(e){const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/r.width*100,(e.clientY-r.top)/r.height*100]}
cv.onmousemove=e=>[mx,my]=mpos(e);
cv.oncontextmenu=e=>{e.preventDefault();placing=false};
cv.onclick=e=>{if(st.over)return;const[x,y]=mpos(e);
 if(placing){if(canPlace(x,y)&&st.gold>=gcost()){st.gold-=gcost();st.gd.push({x,y,t:0,a:-Math.PI/2,up:{dmg:0,rate:0,rng:0}});if(st.gold<gcost())placing=false}return}
 const u=P.find(p=>Math.hypot(p.x-x,p.y-y)<3)||st.gd.find(o=>Math.hypot(o.x-x,o.y-y)<2.6);
 u?select(u,P.includes(u)?'p':'g'):select(null)};
function canPlace(x,y){const d=dPath(x,y);return x>1&&y>1&&x<99&&y<99&&d>=3.5&&d<=8&&!st.gd.some(o=>Math.hypot(o.x-x,o.y-y)<3)&&!P.some(p=>Math.hypot(p.x-x,p.y-y)<3)&&Math.hypot(x-BASE[0],y-BASE[1])>7}

// 웨이브
function startWave(){const s=st.stage,w=++st.wave;
 st.queue=6+w*4+(s-1)*11;
 st.hp=13*1.4**(s-1)*(1+.15*(w-1));
 st.spd=4.5*(1+.18*(s-1))+.25*(w-1);
 st.zd=Math.round(10*(1+.3*(s-1)));
 st.gap=Math.max(.35,.9-.07*(s-1));
 st.boss=w==5;if(st.boss)st.queue++;
 st.phase='wave';st.sp=0}
function nextStage(){st.stage++;st.wave=0;st.base=Math.min(100,st.base+20);st.phase='ready';st.cd=8}
// 좀비는 위·오른쪽·왼쪽 위 가장자리에서만 등장 (기지 방향 제외)
function spawnPos(r){for(let k=0;k<14;k++){const r=Math.random()*3|0,t=Math.random(),p=r==0?[t*100,0]:r==1?[100,t*70]:[0,t*55];
 if(Math.hypot(p[0]-E[0],p[1]-E[1])>25&&!st.z.some(z=>Math.hypot(z.x-p[0],z.y-p[1])<z.r+r))return p}return null}
function aiAngle(p){let t=null,m=1e9;
 for(const z of st.z){if(z.dead||!visible(z.x,z.y)||Math.hypot(z.x-p.x,z.y-p.y)>curBR()-4)continue;
  const r=z.road?TOT-z.s:TOT+Math.hypot(z.x-E[0],z.y-E[1]);if(r<m){m=r;t=z}}
 if(!t)return -Math.PI/2+.3;
 let tt=Math.hypot(t.x-p.x,t.y-p.y)/BS,dx=0,dy=0;
 for(let k=0;k<3;k++){dx=t.x+Math.cos(t.ang)*t.sp*tt-p.x-.5*st.wx*tt*tt;dy=t.y+Math.sin(t.ang)*t.sp*tt-p.y-.5*st.wy*tt*tt;tt=Math.hypot(dx,dy)/BS}
 return Math.atan2(dy,dx)}
function hurt(z,d){z.hp-=d;if(z.hp<=0&&!z.dead){z.dead=1;const v=z.boss?40+10*(st.stage-1):2*(st.stage-1)+Math.floor(Math.random()*11);st.gold+=v;
 st.fx.push({x:z.x,y:z.y,t:.7,txt:'+'+v},{x:z.x,y:z.y,t:.8,sp:1})}}

function upd(dt){
 T+=dt;if(st.over||!mode)return;
 st.bm-=dt;st.wm-=dt;st.wt-=dt;
 if(st.wt<=0){st.wt=30;st.wm=3;st.weather=['clear','cloud','wind'][Math.random()*3|0];
  if(st.weather=='wind'){const a=Math.random()*6.283;st.wx=Math.cos(a)*WA;st.wy=Math.sin(a)*WA}else st.wx=st.wy=0}
 if(st.phase=='ready'){st.cd-=dt;if(st.cd<=0)startWave()}
 if(st.phase=='wave'&&st.queue>0){st.sp-=dt;
  if(st.sp<=0){const boss=st.boss&&st.queue==1,r=boss?2.7:1.1,p=spawnPos(r);if(p){st.z.push({road:false,s:0,x:p[0],y:p[1],ang:Math.atan2(E[1]-p[1],E[0]-p[0]),ph:Math.random()*6,hp:boss?st.hp*9:st.hp,mhp:boss?st.hp*9:st.hp,sp:boss?st.spd*.4:st.spd,dmg:boss?st.zd*3:st.zd,r,boss});if(boss){st.boss=false;st.bm=3}st.queue--;st.sp=st.gap}}}
 // 길 위 좀비: 앞 좀비와 간격 유지
 const R=st.z.filter(z=>z.road).sort((a,b)=>b.s-a.s),F=st.z.filter(z=>!z.road);
 R.forEach((z,i)=>{let n=z.s+z.sp*dt;if(i>0)n=Math.min(n,R[i-1].s-R[i-1].r-z.r);z.s=Math.max(z.s,n);
  const[nx,ny]=pos(Math.min(z.s,TOT));if(Math.hypot(nx-z.x,ny-z.y)>.001)z.ang=Math.atan2(ny-z.y,nx-z.x);z.x=nx;z.y=ny});
 // 들판 좀비: 입구로 직진, 입구가 비면 길로 진입
 let lr=R.length?R[R.length-1]:null;
 F.forEach(z=>{const dx=E[0]-z.x,dy=E[1]-z.y,d=Math.hypot(dx,dy);
  if(d<1){if(!lr||lr.s>=lr.r+z.r){z.road=true;z.s=0;z.x=E[0];z.y=E[1];lr=z}}
  else{const m=Math.min(d,z.sp*dt);z.x+=dx/d*m;z.y+=dy/d*m;z.ang=Math.atan2(dy,dx)}});
 // 겹침 방지
 const fl=st.z.filter(z=>!z.road);
 for(let i=0;i<fl.length;i++){const a=fl[i];
  for(let j=i+1;j<fl.length;j++){const b=fl[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||.01;
   const g2=a.r+b.r;if(d<g2){const o=g2-d,ux=dx/d,uy=dy/d,wa=b.r*b.r/(a.r*a.r+b.r*b.r),wb=1-wa;a.x-=ux*o*wa;a.y-=uy*o*wa;b.x+=ux*o*wb;b.y+=uy*o*wb}}
  for(const r of R){const dx=a.x-r.x,dy=a.y-r.y,d=Math.hypot(dx,dy)||.01;const g2=a.r+r.r;if(d<g2){a.x+=dx/d*(g2-d);a.y+=dy/d*(g2-d)}}}
 st.z=st.z.filter(z=>{if(z.road&&z.s>=TOT-1){st.base-=z.dmg;return false}return true});
 if(st.base<=0){st.base=0;st.over=true;return}
 // 플레이어
 P.forEach(p=>{
  if(p.ai){const ta=aiAngle(p);let da=ta-p.a;da=Math.atan2(Math.sin(da),Math.cos(da));p.w=Math.max(-2.2,Math.min(2.2,da*9));p.a+=p.w*dt}
  else{const l=keys[p.k[0]]||(p.k2&&keys[p.k2[0]]),r=keys[p.k[1]]||(p.k2&&keys[p.k2[1]]),dir=(r?1:0)-(l?1:0);
   p.hold=dir?p.hold+dt:0;const tw=dir*(.35+Math.min(1.5,p.hold*1.8));p.w+=(tw-p.w)*Math.min(1,dt*14);p.a+=p.w*dt}
  p.t-=dt;if(p.t<=0){p.t=Math.max(.1,1.2*.88**p.up.rate);
   st.b.push({x:p.x+Math.cos(p.a)*3,y:p.y+Math.sin(p.a)*3,x0:p.x+Math.cos(p.a)*3,y0:p.y+Math.sin(p.a)*3,v0x:Math.cos(p.a)*BS,v0y:Math.sin(p.a)*BS,vx:Math.cos(p.a)*BS,vy:Math.sin(p.a)*BS,ax:st.wx,ay:st.wy,t:0,d:0,dmg:5+3*p.up.dmg,pr:1+p.up.pierce,c:p.c,n:P.indexOf(p)+1,hit:new Set()})}});
 // 총알
 st.b.forEach(b=>{b.t+=dt;b.x=b.x0+b.v0x*b.t+.5*b.ax*b.t*b.t;b.y=b.y0+b.v0y*b.t+.5*b.ay*b.t*b.t;b.vx=b.v0x+b.ax*b.t;b.vy=b.v0y+b.ay*b.t;b.d=BS*b.t;
  for(const z of st.z){if(z.dead||b.hit.has(z))continue;
   if(Math.hypot(z.x-b.x,z.y-b.y)<z.r+.8){b.hit.add(z);hurt(z,b.dmg);if(--b.pr<=0){b.d=1e9;break}}}});
 st.b=st.b.filter(b=>b.d<curBR()&&b.x>-3&&b.x<103&&b.y>-3&&b.y<103);
 // 포탑
 st.gd.forEach(o=>{o.t-=dt;let t=null,m=1e9;const rg=(GR+2*o.up.rng)*(st.weather=='cloud'?.6:1);
  for(const z of st.z){if(z.dead||Math.hypot(z.x-o.x,z.y-o.y)>rg)continue;
   const r=z.road?TOT-z.s:TOT+Math.hypot(z.x-E[0],z.y-E[1]);if(r<m){m=r;t=z}}
  if(t)o.a=Math.atan2(t.y-o.y,t.x-o.x);
  if(o.t>0||!t)return;
  hurt(t,4+2*o.up.dmg);st.fx.push({l:[o.x,o.y,t.x,t.y],t:.1});o.t=Math.max(.15,1.5*.88**o.up.rate)});
 st.z=st.z.filter(z=>!z.dead);
 st.fx.forEach(f=>f.t-=dt);st.fx=st.fx.filter(f=>f.t>0);
 if(st.phase=='wave'&&st.queue==0&&!st.z.length){if(st.wave>=5)st.phase='clear';else{st.phase='ready';st.cd=8}}
}

// ---- 그리기 ----
function soldier(x,y,a,body,helm,u,gl){g.save();g.translate(x*S,y*S);g.rotate(a);
 g.fillStyle='#1a1a1a';g.fillRect(.4*u,-.28*u,gl*u,.56*u);
 g.fillStyle='#555';g.fillRect((gl-.6)*u,-.38*u,.5*u,.76*u);
 g.fillStyle=body;g.beginPath();g.ellipse(0,0,.9*u,1.7*u,0,0,7);g.fill();
 g.fillStyle='#f1c27d';g.beginPath();g.arc(1.3*u,.45*u,.34*u,0,7);g.arc(2*u,-.1*u,.34*u,0,7);g.fill();
 g.fillStyle=helm;g.beginPath();g.arc(0,0,1.05*u,0,7);g.fill();
 g.fillStyle='rgba(255,255,255,.28)';g.beginPath();g.arc(-.15*u,-.35*u,.4*u,0,7);g.fill();
 g.restore()}
function visible(x,y){return st.weather!='cloud'||P.some(p=>Math.hypot(p.x-x,p.y-y)<VP)||st.gd.some(o=>Math.hypot(o.x-x,o.y-y)<VT)||Math.hypot(x-BASE[0],y-BASE[1])<14}
function turret(o,i){g.save();g.translate(o.x*S,o.y*S);
 g.fillStyle='#1f2937';g.beginPath();g.arc(0,0,1.9*S,0,7);g.fill();g.fillStyle='#4b5563';g.beginPath();g.arc(0,0,1.6*S,0,7);g.fill();
 g.rotate(o.a);g.fillStyle='#0f766e';g.fillRect(0,-.55*S,3.2*S,1.1*S);g.fillStyle='#134e4a';g.fillRect(2.4*S,-.75*S,.9*S,1.5*S);
 g.fillStyle='#14b8a6';g.beginPath();g.arc(0,0,1.15*S,0,7);g.fill();g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.arc(-.3*S,-.3*S,.4*S,0,7);g.fill();g.restore();
 g.fillStyle='#5eead4';g.strokeStyle='#000';g.lineWidth=3;g.font='bold 11px sans-serif';g.textAlign='center';g.strokeText('T'+(i+1),o.x*S,o.y*S+2.9*S);g.fillText('T'+(i+1),o.x*S,o.y*S+2.9*S)}
function zombie(z){const u=S*z.r/1.1;if(z.boss){g.fillStyle='rgba(220,38,38,.2)';g.beginPath();g.arc(z.x*S,z.y*S,z.r*1.5*S,0,7);g.fill()}
 g.save();g.translate(z.x*S,z.y*S);g.rotate(z.ang+Math.sin(T*5+z.ph)*.12);
 g.fillStyle='#3a4a5c';g.beginPath();g.ellipse(-.2*u,0,.85*u,1.4*u,0,0,7);g.fill();           // 너덜한 옷
 g.fillStyle='#2b3744';g.fillRect(-.6*u,-.2*u,.5*u,.9*u);
 g.strokeStyle='#8fbf7a';g.lineWidth=.55*u;g.lineCap='round';                                 // 앞으로 뻗은 팔
 g.beginPath();g.moveTo(.2*u,-1.2*u);g.lineTo(1.9*u,-.85*u);g.moveTo(.2*u,1.2*u);g.lineTo(1.9*u,.85*u);g.stroke();
 g.fillStyle='#9fcf86';g.beginPath();g.arc(.3*u,0,.85*u,0,7);g.fill();                        // 머리
 g.fillStyle='#6a9a58';g.beginPath();g.arc(-.1*u,.4*u,.3*u,0,7);g.fill();
 g.fillStyle='#7f1d1d';g.beginPath();g.arc(.25*u,-.45*u,.28*u,0,7);g.fill();                  // 상처
 g.fillStyle='#ff2d2d';g.beginPath();g.arc(.85*u,-.32*u,.17*u,0,7);g.arc(.85*u,.32*u,.17*u,0,7);g.fill(); // 눈
 g.restore();
 if(z.hp<z.mhp||z.boss){const k=z.r/1.1,w=2.8*k*S,y=(z.y-2.6*k)*S,x=z.x*S-w/2,h=z.boss?6:3;g.fillStyle='#222';g.fillRect(x,y,w,h);g.fillStyle=z.boss?'#f59e0b':'#ef4444';g.fillRect(x,y,w*Math.max(0,z.hp/z.mhp),h);
  if(z.boss){g.fillStyle='#fff';g.font='bold 11px sans-serif';g.textAlign='center';g.fillText('BOSS',z.x*S,y-4)}}}
function base(){const x=BASE[0]*S,y=BASE[1]*S;
 g.fillStyle='#4b5563';g.fillRect(x-3.4*S,y-4*S,6.8*S,7.6*S);
 g.fillStyle='#9ca3af';g.fillRect(x-3*S,y-3.6*S,6*S,6.8*S);
 g.fillStyle='#6b7280';for(let i=0;i<4;i++)g.fillRect(x-3*S+i*1.7*S,y-4.7*S,1.1*S,1.1*S);
 g.fillStyle='#1f2937';g.fillRect(x-1*S,y+.6*S,2*S,2.6*S);
 g.fillStyle='#3b82f6';g.fillRect(x-2.6*S,y-2.6*S,5.2*S,2.2*S);
 g.strokeStyle='#e5e7eb';g.lineWidth=2;g.beginPath();g.moveTo(x+2*S,y-4.7*S);g.lineTo(x+2*S,y-8*S);g.stroke();
 g.fillStyle='#ef4444';g.beginPath();g.moveTo(x+2*S,y-8*S);g.lineTo(x+4.4*S,y-7.2*S);g.lineTo(x+2*S,y-6.4*S);g.fill()}
function draw(){
 g.drawImage(bg,0,0);g.lineCap=g.lineJoin='round';
 const road=w=>{g.beginPath();PATH.forEach(([x,y],i)=>i?g.lineTo(x*S,y*S):g.moveTo(x*S,y*S));g.lineWidth=w*S;g.stroke()};
 g.strokeStyle='#4a3b27';road(6.4);g.strokeStyle='#a38a5c';road(5.2);g.strokeStyle='rgba(120,95,55,.5)';road(3.2);
 if(placing){g.strokeStyle='rgba(120,255,120,.10)';road(17)}
 g.save();g.setLineDash([6,5]);g.strokeStyle='#ffd166';g.lineWidth=2;g.beginPath();g.arc(E[0]*S,E[1]*S,3*S,0,7);g.stroke();g.restore();
 st.fx.forEach(f=>{if(f.sp){g.fillStyle=`rgba(90,140,60,${f.t*.6})`;g.beginPath();g.arc(f.x*S,f.y*S,1.6*S,0,7);g.fill()}});
 base();
 g.fillStyle='#222';g.fillRect(8*S,95.8*S,14*S,1.6*S);g.fillStyle='#4ade80';g.fillRect(8*S,95.8*S,14*S*st.base/100,1.6*S);
 st.gd.forEach((o,i)=>turret(o,i));
 P.forEach(p=>{const Tm=curBR()/BS,c=Math.cos(p.a),s2=Math.sin(p.a),x0=p.x+c*3,y0=p.y+s2*3,N=40,pt=k=>{const t=Tm*k/N;return[(x0+c*BS*t+.5*st.wx*t*t)*S,(y0+s2*BS*t+.5*st.wy*t*t)*S]};
  const e=pt(N),gr=g.createLinearGradient(x0*S,y0*S,e[0],e[1]);gr.addColorStop(0,p.c);gr.addColorStop(1,'rgba(255,255,255,0)');
  g.save();g.strokeStyle=gr;g.globalAlpha=.55;g.lineWidth=2;g.lineCap='round';g.beginPath();g.moveTo(x0*S,y0*S);for(let k=1;k<=N;k++){const q=pt(k);g.lineTo(q[0],q[1])}g.stroke();
  g.globalAlpha=.7;g.fillStyle=p.c;for(let k=8;k<N;k+=8){const q=pt(k);g.beginPath();g.arc(q[0],q[1],2.2,0,7);g.fill()}g.restore()});
 st.z.forEach(z=>{if(visible(z.x,z.y))zombie(z)});
 P.forEach((p,i)=>{soldier(p.x,p.y,p.a,p.c,p.h,S,3.4);
  g.fillStyle='#fff';g.strokeStyle='#000';g.lineWidth=3;g.font='bold 12px sans-serif';g.textAlign='center';g.strokeText(('P'+(i+1)+(p.ai?' AI':'')),p.x*S,p.y*S+30);g.fillText(('P'+(i+1)+(p.ai?' AI':'')),p.x*S,p.y*S+30)});
 if(sel){const o=sel.o;g.save();g.setLineDash([5,4]);g.strokeStyle='#ffd166';g.lineWidth=2;g.beginPath();g.arc(o.x*S,o.y*S,2.7*S,0,7);g.stroke();
  if(sel.type=='g'){g.strokeStyle='rgba(255,255,255,.3)';g.lineWidth=1;g.beginPath();g.arc(o.x*S,o.y*S,(GR+2*o.up.rng)*(st.weather=='cloud'?.6:1)*S,0,7);g.stroke()}g.restore()}
 st.b.forEach(b=>{const l=Math.hypot(b.vx,b.vy),tx=b.x-b.vx/l*4,ty=b.y-b.vy/l*4;g.lineCap='round';
  g.strokeStyle=b.c;g.globalAlpha=.5;g.lineWidth=6;g.beginPath();g.moveTo(tx*S,ty*S);g.lineTo(b.x*S,b.y*S);g.stroke();g.globalAlpha=1;
  g.lineWidth=2.5;g.beginPath();g.moveTo(tx*S,ty*S);g.lineTo(b.x*S,b.y*S);g.stroke();
  g.fillStyle=b.c;g.beginPath();g.arc(b.x*S,b.y*S,.95*S,0,7);g.fill();g.strokeStyle='#fff';g.lineWidth=1.5;g.stroke();
  g.fillStyle='#fff';g.font='bold 10px sans-serif';g.textAlign='center';g.fillText(b.n,b.x*S,b.y*S+3.5)});
 st.fx.forEach(f=>{if(f.l){g.strokeStyle='#2dd4bf';g.lineWidth=3;g.beginPath();g.moveTo(f.l[0]*S,f.l[1]*S);g.lineTo(f.l[2]*S,f.l[3]*S);g.stroke()}
  else if(f.txt){g.fillStyle='#ffd166';g.strokeStyle='#000';g.lineWidth=3;g.font='bold 14px sans-serif';g.textAlign='center';const yy=(f.y-2-(.7-f.t)*5)*S;g.strokeText(f.txt,f.x*S,yy);g.fillText(f.txt,f.x*S,yy)}});
 if(st.weather=='cloud'){fg.globalCompositeOperation='source-over';fg.clearRect(0,0,700,700);fg.fillStyle='rgba(25,32,45,.66)';fg.fillRect(0,0,700,700);fg.globalCompositeOperation='destination-out';
  const hole=(x,y,r)=>{const gr=fg.createRadialGradient(x*S,y*S,r*S*.45,x*S,y*S,r*S);gr.addColorStop(0,'rgba(0,0,0,1)');gr.addColorStop(1,'rgba(0,0,0,0)');fg.fillStyle=gr;fg.fillRect((x-r)*S,(y-r)*S,2*r*S,2*r*S)};
  P.forEach(p=>hole(p.x,p.y,VP));st.gd.forEach(o=>hole(o.x,o.y,VT));hole(BASE[0],BASE[1],14);g.drawImage(fogc,0,0)}
 if(st.weather=='wind'){const a=Math.atan2(st.wy,st.wx),c=Math.cos(a),s2=Math.sin(a),m=v=>((v%760)+760)%760-30;g.strokeStyle='rgba(255,255,255,.28)';g.lineWidth=1.5;g.lineCap='round';
  for(let i=0;i<36;i++){const sp=120+(i%5)*45,x=m(i*173+c*T*sp),y=m(i*311+s2*T*sp);g.beginPath();g.moveTo(x,y);g.lineTo(x+c*28,y+s2*28);g.stroke()}}
 if(st.wm>0&&!st.over){g.fillStyle='rgba(0,0,0,.55)';g.fillRect(150,18,400,40);g.fillStyle='#fff';g.font='bold 18px sans-serif';g.textAlign='center';
  g.fillText(st.weather=='clear'?'☀️ 맑음 - 아무 일도 없어요':st.weather=='cloud'?'☁️ 흐림 - 시야와 사거리가 짧아져요':'🌬 바람 - 총알이 휘어요',350,45)}
 if(st.bm>0&&!st.over){g.fillStyle='rgba(120,0,0,.7)';g.fillRect(150,66,400,40);g.fillStyle='#fff';g.font='bold 18px sans-serif';g.textAlign='center';g.fillText('👹 보스 등장! 느리지만 체력이 아주 많아요',350,93)}
 if(placing){const ok=canPlace(mx,my);g.fillStyle=ok?'rgba(80,255,80,.35)':'rgba(255,60,60,.35)';g.beginPath();g.arc(mx*S,my*S,1.7*S,0,7);g.fill();
  g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=1;g.beginPath();g.arc(mx*S,my*S,GR*S,0,7);g.stroke()}
 if(st.over){g.fillStyle='rgba(0,0,0,.7)';g.fillRect(0,0,700,700);g.fillStyle='#fff';g.textAlign='center';g.font='bold 40px sans-serif';g.fillText('기지 파괴! GAME OVER',350,340);g.font='20px sans-serif';g.fillText('스테이지 '+st.stage+' / 웨이브 '+st.wave+' 까지 도달',350,380)}
 // UI 갱신
 $('hud').innerHTML=`<span style="grid-column:span 2">모드 <b>${mode=='solo'?'🤖 솔로 (P2 자동)':'👥 멀티 (2인)'}</b></span><span>스테이지 <b>${st.stage}</b></span><span>웨이브 <b>${st.wave}/5</b></span><span>골드 <b>💰${st.gold}</b></span><span>기지 <b>${st.base}/100</b></span><span style="grid-column:span 2">${WN[st.weather]}${st.weather=='wind'?' '+['→','↘','↓','↙','←','↖','↑','↗'][Math.round(Math.atan2(st.wy,st.wx)/(Math.PI/4)+8)%8]:''} · ${Math.ceil(st.wt)}초 후 변경</span><span style="grid-column:span 2">좀비 기지 공격력 <b>${Math.round(10*(1+.3*(st.stage-1)))}</b></span>`;
 $('bf').style.width=st.base+'%';
 $('msg').textContent=st.over?'게임 오버':st.phase=='ready'?`다음 웨이브 ${Math.ceil(st.cd)}초 후 시작`:st.phase=='clear'?`🎉 스테이지 ${st.stage} 클리어!`:`남은 좀비: ${st.queue+st.z.length}`;
 const go=$('go');go.textContent=st.over?'다시 시작':st.phase=='ready'?'지금 웨이브 시작':st.phase=='clear'?'다음 스테이지 →':'웨이브 진행 중';go.disabled=!(st.over||st.phase=='ready'||st.phase=='clear');
 updatePop();
 $('gb').textContent=(placing?'설치 취소 (맵 클릭으로 배치)':'포탑 구매')+`  —  ${gcost()}G  (보유 ${st.gd.length})`;$('gb').disabled=!placing&&st.gold<gcost();
}
let last=performance.now();
(function loop(t){const dt=Math.min(.05,(t-last)/1000);last=t;upd(dt);draw();requestAnimationFrame(loop)})(last);
