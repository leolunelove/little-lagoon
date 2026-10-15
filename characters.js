import * as T from 'three';
import {group,box,ball,cylinder,limb,mesh} from './models.js';
// Character-only materials: the island keeps its existing faceted rendering.
const characterMaterials=new Map();
function softMaterial(color){if(!characterMaterials.has(color))characterMaterials.set(color,new T.MeshStandardMaterial({color,roughness:.88}));return characterMaterials.get(color);}
function softMesh(parent,geometry,color,x=0,y=0,z=0,scale=[1,1,1]){
 const object=new T.Mesh(geometry,softMaterial(color));object.position.set(x,y,z);object.scale.set(...scale);object.castShadow=true;object.receiveShadow=true;parent.add(object);return object;
}
function oval(parent,color,x,y,z,rx,ry,rz){return softMesh(parent,new T.SphereGeometry(1,20,14),color,x,y,z,[rx,ry,rz]);}
function rounded(parent,color,x,y,z,w,h,d,r=.04){
 const shape=new T.Shape(),a=w/2-r,b=h/2-r;
 shape.moveTo(-a,-h/2);shape.lineTo(a,-h/2);shape.quadraticCurveTo(w/2,-h/2,w/2,-b);shape.lineTo(w/2,b);shape.quadraticCurveTo(w/2,h/2,a,h/2);shape.lineTo(-a,h/2);shape.quadraticCurveTo(-w/2,h/2,-w/2,b);shape.lineTo(-w/2,-b);shape.quadraticCurveTo(-w/2,-h/2,-a,-h/2);
 const bevel=Math.min(r*.45,d*.22),geo=new T.ExtrudeGeometry(shape,{depth:d-bevel*2,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:bevel,bevelThickness:bevel,curveSegments:4});geo.translate(0,0,-d/2+bevel);
 return softMesh(parent,geo,color,x,y,z);
}
function curve(parent,color,points,radius){const path=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));return softMesh(parent,new T.TubeGeometry(path,12,radius,5,false),color);}
function section(parent,color,rings){
 const v=[],idx=[],n=20;
 for(const [y,rx,rz]of rings)for(let i=0;i<=n;i++){const a=i/n*Math.PI*2;v.push(Math.sin(a)*rx,y,Math.cos(a)*rz);}
 for(let j=0;j<rings.length-1;j++)for(let i=0;i<n;i++){const k=j*(n+1)+i;idx.push(k,k+n+1,k+1,k+1,k+n+1,k+n+2);}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(v,3));geo.setIndex(idx);geo.computeVertexNormals();return softMesh(parent,geo,color);
}
export function gardener(parent){
 const root=group(parent),hips=group(root,0,.87,0),torso=group(hips);root.scale.setScalar(.84);
 root.name='Lagoon islander';
 // Adult proportions: tapered shoulders/waist and long articulated limbs.
 const rings=[[.01,.16,.095],[.14,.155,.10],[.34,.19,.115],[.50,.225,.12],[.57,.20,.105],[.605,.115,.085]],verts=[],indices=[],segments=20;
 for(const [y,rx,rz]of rings)for(let i=0;i<=segments;i++){const a=i/segments*Math.PI*2;verts.push(Math.sin(a)*rx,y,Math.cos(a)*rz);}
 for(let j=0;j<rings.length-1;j++)for(let i=0;i<segments;i++){const k=j*(segments+1)+i;indices.push(k,k+1,k+segments+1,k+1,k+segments+2,k+segments+1);}
 const shirt=new T.BufferGeometry();shirt.setAttribute('position',new T.Float32BufferAttribute(verts,3));shirt.setIndex(indices);shirt.computeVertexNormals();softMesh(torso,shirt,'#6c9280');
 rounded(torso,'#b39b72',0,-.017,0,.325,.15,.207,.03);
 rounded(torso,'#806749',0,.055,.105,.312,.032,.019,.007);
 rounded(torso,'#bca984',.015,.055,.12,.045,.038,.015,.005);
 oval(torso,'#c99773',0,.64,0,.066,.105,.065);
 // Open neck and relaxed short sleeves keep the outfit suited to the beach.
 const collarA=rounded(torso,'#8ca590',-.055,.569,.087,.086,.06,.018,.012);collarA.rotation.z=-.43;
 const collarB=rounded(torso,'#8ca590',.055,.569,.087,.086,.06,.018,.012);collarB.rotation.z=.43;
 rounded(torso,'#587c6b',0,.30,.12,.014,.37,.009,.004);
 for(const y of [.18,.29,.40])oval(torso,'#c9c6a8',0,y,.129,.007,.007,.005);
 rounded(torso,'#779784',-.108,.40,.108,.088,.086,.018,.012);
 curve(torso,'#627e6a',[[-.145,.403,.12],[-.107,.397,.129],[-.069,.403,.128]],.003);
 const head=group(torso,0,.82,0),eyes=[],brows=[];head.scale.set(.45,.52,.46);
 softMesh(head,new T.SphereGeometry(1,32,24),'#e9b58b',0,0,0,[.285,.315,.25]);
 for(const side of[-1,1]){
  oval(head,'#e3aa82',side*.298,-.014,0,.066,.083,.057);
  oval(head,'#ce9276',side*.337,-.012,.028,.022,.041,.016);
  const eye=group(head,side*.104,.015,.235);eye.rotation.y=side*.23;
  oval(eye,'#fff1d6',0,0,0,.047,.032,.015);
  oval(eye,'#4b3a2f',0,-.001,.014,.022,.029,.008);
  oval(eye,'#241f1d',0,-.001,.021,.013,.022,.005);
  oval(eye,'#fff9e5',-.006,.009,.034,.006,.006,.004);eyes.push(eye);
  const brow=curve(head,'#634430',[[side*.065,.104,.252],[side*.111,.115,.245],[side*.155,.102,.228]],.010);brows.push(brow);
 }
 oval(head,'#d2a07a',0,-.014,.240,.025,.068,.024);oval(head,'#d2a07a',0,-.066,.267,.037,.026,.037);
 curve(head,'#9b6550',[[-.052,-.129,.230],[0,-.134,.236],[.052,-.129,.230]],.006);
 // Swept chocolate-brown hair, with larger locks rather than noisy strands.
 const cap=new T.SphereGeometry(.30,24,14,0,Math.PI*2,0,Math.PI*.38);
 softMesh(head,cap,'#55392b',0,.037,-.022,[1,1,.92]);
 oval(head,'#55392b',0,.068,-.155,.267,.22,.13);
 for(const [x,y,z,rx,ry,rz,tilt]of[[-.172,.176,.205,.104,.092,.065,-.52],[-.055,.235,.221,.130,.064,.061,.26],[.091,.259,.183,.130,.067,.063,.38],[.208,.211,.100,.083,.112,.065,.32]]){
  const lock=oval(head,'#604130',x,y,z,rx,ry,rz);lock.rotation.z=tilt;
 }
 for(const side of[-1,1])oval(head,'#55392b',side*.268,.067,-.008,.039,.095,.09);
 const arms=[],legs=[],hands=[],elbows=[],knees=[];
 for(const side of[-1,1]){
  const arm=group(torso,side*.221,.51,0);arm.rotation.z=side*.085;
  oval(arm,'#6c9280',side*.016,-.076,0,.08,.13,.08);
  rounded(arm,'#91a591',side*.02,-.162,0,.137,.032,.139,.009);
  section(arm,'#c99773',[[-.15,.054,.052],[-.21,.057,.053],[-.295,.044,.044],[-.325,.035,.038]]);
  const elbow=group(arm,0,-.295,0);oval(elbow,'#c99773',0,-.003,0,.042,.045,.043);section(elbow,'#c99773',[[.01,.039,.04],[-.06,.048,.046],[-.14,.044,.042],[-.23,.029,.030],[-.26,.028,.029]]);elbows.push(elbow);
  const hand=group(elbow,0,-.24,.022);oval(hand,'#d0a17c',0,-.03,0,.043,.066,.027);
  for(let i=0;i<4;i++)oval(hand,'#c99773',(i-1.5)*.018,-.089+Math.abs(i-1.5)*.007,.003,.011,.038,.013);
  const thumb=oval(hand,'#c99773',-side*.039,-.039,.014,.017,.04,.018);thumb.rotation.z=-side*.4;
  if(side===-1)rounded(elbow,'#6c5740',0,-.197,.012,.09,.026,.098,.008);
  arms.push(arm);hands.push(hand);
  const leg=group(hips,side*.089,-.004,0);
  section(leg,'#b39b72',[[.015,.086,.098],[-.09,.098,.105],[-.24,.090,.099],[-.365,.080,.088]]);
  rounded(leg,'#c8b185',0,-.343,.004,.169,.045,.183,.012);
  const pocket=rounded(leg,'#a48e67',side*.077,-.214,.01,.031,.13,.117,.008);
  rounded(pocket,'#c3aa7c',side*.019,.043,.009,.02,.033,.108,.006);
  const knee=group(leg,0,-.39,0);oval(knee,'#c99773',0,-.015,.007,.062,.069,.06);
  section(knee,'#c99773',[[.005,.053,.054],[-.085,.059,.060],[-.16,.053,.055],[-.29,.032,.037],[-.41,.03,.036]]);
  oval(knee,'#c99773',0,-.417,.047,.062,.041,.121);
  rounded(knee,'#6a543a',0,-.461,.042,.142,.026,.253,.012);
  const strap=rounded(knee,'#927552',0,-.392,.079,.128,.023,.053,.008);strap.rotation.x=-.10;
  rounded(knee,'#927552',0,-.392,-.018,.124,.022,.034,.007);
  knees.push(knee);legs.push(leg);
 }
 root.userData.rig={hips,torso,head,arms,legs,hands,eyes,brows,elbows,knees,idleTime:0,blink:1};return root;
}
export function animateGardener(root,actor,dt,ambient=true){
 const r=root.userData.rig,walking=actor.phase==='walking',working=actor.phase==='working';
 dt=Math.max(0,Math.min(dt,.05));if(ambient)r.idleTime+=dt;
 const phase=actor.distanceWalked*.19,stride=walking?Math.sin(phase)*.38:0;
 const progress=working&&actor.active?Math.min(1,actor.workTime/actor.active.duration):0;
 const bend=working?Math.sin(progress*Math.PI)*.65:0;
 r.legs[0].rotation.x=stride;r.legs[1].rotation.x=-stride;
 r.knees.forEach((k,i)=>k.rotation.x=walking?Math.max(0,Math.sin(phase+i*Math.PI))*.35:bend*.30);
 r.elbows.forEach(e=>e.rotation.x=working?-bend*.75:-.10);
 r.arms[0].rotation.x=working?-bend*1.95:-stride*.75;r.arms[1].rotation.x=working?-bend*1.95:stride*.75;
 r.arms.forEach((arm,i)=>arm.rotation.z=(i?1:-1)*(.085+(walking?Math.abs(stride)*.04:0)));
 r.torso.rotation.x=bend;r.torso.rotation.z=walking?Math.sin(phase)*.025:0;
 r.hips.position.y=.87-bend*.055;
 if(walking){
  // Keep the lowest sandal grounded through the articulated stride.
  const soles=r.legs.map((leg,i)=>{const thigh=leg.rotation.x,total=thigh+r.knees[i].rotation.x;return -.004-.39*Math.cos(thigh)-.474*Math.cos(total)-(Math.sin(total)>=0?.1685:-.0845)*Math.sin(total);});
  r.hips.position.y=-Math.min(...soles)+.002;
 }
 r.head.rotation.x=working?-bend*.28:(ambient&&!walking?Math.sin(r.idleTime*.9)*.025:0);
 r.head.rotation.z=ambient&&!working?Math.sin(r.idleTime*.7)*.018:0;
 r.torso.scale.y=ambient&&!working&&!walking?1+Math.sin(r.idleTime*1.8)*.008:1;
 // A short blink every few seconds; reduced motion keeps an open, still face.
 const blinkPhase=r.idleTime%4.7;
 const blink=ambient&&blinkPhase>4.48?Math.max(.10,Math.abs((blinkPhase-4.59)/.11)):1;
 r.eyes.forEach(eye=>eye.scale.y=Math.min(1,blink));r.blink=blink;
 const angle={down:0,up:Math.PI,left:-Math.PI/2,right:Math.PI/2}[actor.facing];
 const delta=Math.atan2(Math.sin(angle-root.rotation.y),Math.cos(angle-root.rotation.y));root.rotation.y+=delta*Math.min(1,dt*14);
}
export function farmAnimal(parent,id){
 const g=group(parent),body=group(g),legs=[],head=group(body);
 if(id==='cow'){
  ball(body,'#e8ddc4',0,.66,0,.5,[.82,.86,1.32]);
  ball(body,'#856046',.32,.73,.04,.25,[.55,.94,1.25]);ball(body,'#785039',-.25,.86,.25,.22,[.6,.72,1.25]);ball(body,'#8f6747',-.18,.84,-.26,.24,[1,.63,1]);
  for(const x of[-.25,.25])for(const z of[-.36,.36]){const leg=group(g,x,.43,z);cylinder(leg,'#e7dbc2',0,-.17,0,.068,.056,.34);cylinder(leg,'#594a3a',0,-.39,0,.076,.076,.11);legs.push(leg);}
  head.position.set(0,.83,-.53);ball(head,'#ede2c9',0,-.02,-.12,.25,[.9,1,1.12]);ball(head,'#c49484',0,-.14,-.35,.20,[1,.63,.58]);
  for(const x of[-.18,.18]){ball(head,'#373c30',x,.035,-.22,.027);ball(head,'#9b7754',x*1.55,.13,-.025,.10,[1.6,.5,.8]);cylinder(head,'#c6b896',x,.27,-.02,.01,.043,.18,6);}
  limb(body,'#826344',[0,.76,.53],[.04,.35,.82],.025);ball(body,'#5b4332',.04,.32,.82,.065);
 }else{
  ball(body,'#f0e7d1',0,.25,0,.25,[.86,1,1.3]);ball(body,'#e1d3b7',.17,.27,.03,.16,[.38,.75,1.2]);
  head.position.set(0,.47,-.14);ball(head,'#f6edd8',0,0,-.06,.14);ball(head,'#ba5441',0,.13,-.05,.065,[.6,1.2,1.2]);
  const beak=mesh(new T.ConeGeometry(.05,.12,4),'#c99b3c',head,0,-.02,-.24);beak.rotation.x=-Math.PI/2;
  for(const x of[-.075,.075]){ball(head,'#383b30',x,.025,-.16,.018);const leg=group(g,x,.13,0);limb(leg,'#c29843',[0,0,0],[0,-.10,0],.019);box(leg,'#c29843',0,-.11,-.025,.07,.02,.12);legs.push(leg);}
  ball(body,'#e9ddc3',0,.39,.26,.13,[.7,1.1,1]);
 }
 g.userData.rig={body,legs,head};return g;
}
export function animateAnimal(root,animal){
 const r=root.userData.rig,walking=animal.phase==='walking',peck=animal.phase==='pecking';
 r.legs.forEach((leg,i)=>leg.rotation.x=walking?Math.sin(animal.distanceWalked*.55+(i%2)*Math.PI)*.3:0);
 r.head.rotation.x=peck?-Math.max(0,Math.sin(animal.clock*(animal.id==='cow'?2:5)))*(animal.id==='cow'?1.05:1.2):0;
 r.body.rotation.x=peck?-.12*Math.max(0,Math.sin(animal.clock*4)):0;
 root.rotation.y=animal.facingLeft?Math.PI/2:-Math.PI/2;
}
