import * as T from 'three';
const materials = new Map();
export function mat(color, roughness = 1) {
  const key = color + ':' + roughness;
  if (!materials.has(key)) materials.set(key, new T.MeshStandardMaterial({ color, roughness, flatShading: true }));
  return materials.get(key);
}
export function mesh(geo, color, parent, x=0, y=0, z=0, scale=null) {
  const m = new T.Mesh(geo, mat(color)); m.position.set(x,y,z); if(scale) m.scale.set(...scale);
  m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
}
export const box = (p,c,x,y,z,w,h,d) => mesh(new T.BoxGeometry(w,h,d),c,p,x,y,z);
export const ball = (p,c,x,y,z,r=1,s=null) => mesh(new T.IcosahedronGeometry(r,1),c,p,x,y,z,s);
export const cylinder = (p,c,x,y,z,rt,rb,h,n=10) => mesh(new T.CylinderGeometry(rt,rb,h,n),c,p,x,y,z);
export function group(parent,x=0,y=0,z=0) { const g = new T.Group(); g.position.set(x,y,z); parent.add(g); return g; }
export function limb(p,c,a,b,r=.05) {
  const av=new T.Vector3(...a),bv=new T.Vector3(...b),d=bv.clone().sub(av);
  const m=cylinder(p,c,0,0,0,r,r,d.length(),7); m.position.copy(av.add(bv).multiplyScalar(.5)); m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return m;
}
export function palm(parent,x,z,size=1,rot=0) {
  const g=group(parent,x,.37,z);g.scale.setScalar(size);g.rotation.y=rot;
  for(let i=0;i<8;i++){
    const cy=.17+i*.27, cx=Math.sin(i*.13)*.35;
    const part=cylinder(g,i%2?'#a58352':'#bc955e',cx,cy,0,.13-i*.004,.16-i*.004,.29,7);part.rotation.z=-.06;
  }
  const crown=group(g,.29,2.3,0);
  for(let i=0;i<8;i++){
    const a=i*Math.PI/4, geo=new T.BufferGeometry();
    const verts=[],indices=[];
    for(let j=0;j<=5;j++){
      const t=j/5, rad=t*1.7, height=Math.sin(t*Math.PI)*.38-t*t*.65;
      const width=Math.sin(t*Math.PI)*.27;
      const xx=Math.sin(a)*rad,zz=Math.cos(a)*rad;
      verts.push(xx-Math.cos(a)*width,height,zz+Math.sin(a)*width,xx,height+.055,zz,xx+Math.cos(a)*width,height,zz-Math.sin(a)*width);
      if(j<5){const k=j*3;indices.push(k,k+3,k+1,k+1,k+3,k+4,k+1,k+4,k+2,k+2,k+4,k+5);}
    }
    geo.setAttribute('position',new T.Float32BufferAttribute(verts,3));geo.setIndex(indices);geo.computeVertexNormals();
    const leaf=new T.Mesh(geo,new T.MeshStandardMaterial({color:i%2?'#3b773a':'#548b42',side:T.DoubleSide,flatShading:true}));leaf.castShadow=true;crown.add(leaf);
  }
  for(let i=0;i<3;i++)ball(g,'#816141',.29+Math.cos(i*2)*.16,2.18,Math.sin(i*2)*.16,.15);
  return g;
}
export function crop(parent,id,x,z,growth=1) {
  const g=group(parent,x,.05,z);g.scale.setScalar(.35+.65*growth);
  if(id==='corn'){
    limb(g,'#558840',[0,0,0],[0,.85,0],.035);
    for(let i=0;i<4;i++){
      const leaf=ball(g,i%2?'#75a447':'#4d843c',(i%2?1:-1)*.16,.2+i*.12,0,.2,[1.3,.26,.55]);leaf.rotation.z=(i%2?1:-1)*.6;
    }
    ball(g,growth>.75?'#f7cb4c':'#9dbc50',.10,.59,.01,.16,[.7,1.65,.7]);
    limb(g,'#e4cc72',[0,.83,0],[.03,1.03,0],.012);
  }else if(id==='berry'){
    ball(g,'#508e4e',0,.3,0,.38,[1,1,.9]);
    for(let i=0;i<6;i++)ball(g,growth>.7?'#de6682':'#88a65a',Math.cos(i*2.4)*.28,.25+(i%3)*.12,Math.sin(i*2.4)*.28,.092);
  }else{
    ball(g,growth>.7?'#e5b44b':'#93aa54',0,.28,0,.23,[.85,1.45,.85]);
    for(let i=0;i<6;i++){const a=i*Math.PI/3;limb(g,'#4f8650',[0,.53,0],[Math.sin(a)*.2,.9,Math.cos(a)*.2],.04);}
  }
  return g;
}
export function chicken(parent,x,z) {
  const g=group(parent,x,.4,z);
  ball(g,'#fff4d8',0,.28,0,.28,[1,1.06,1.3]);
  ball(g,'#f6e7c7',.04,.31,.1,.18,[1,.7,1]);
  ball(g,'#fff7df',0,.57,-.19,.18);
  ball(g,'#d5785b',0,.74,-.19,.075,[.65,1.2,1.1]);
  const beak=mesh(new T.ConeGeometry(.07,.16,4),'#e4ac42',g,0,.55,-.39);beak.rotation.x=-Math.PI/2;
  for(const x of [-.085,.085]){ball(g,'#354437',x,.60,-.31,.025);limb(g,'#dbaa51',[x,.03,0],[x,.17,0],.024);}
  const tail=ball(g,'#f5e5c2',0,.44,.29,.14,[.7,1.2,1]);tail.rotation.x=.4;
  return g;
}
export function cow(parent,x,z) {
  const g=group(parent,x,.42,z);g.rotation.y=-.5;
  ball(g,'#fff4dd',0,.65,0,.53,[.85,.85,1.4]);
  ball(g,'#535c51',.35,.78,.11,.25,[.5,.85,1]);ball(g,'#535c51',-.24,.88,-.25,.23,[1,.5,1]);
  for(const dx of [-.26,.26])for(const dz of [-.38,.38]){cylinder(g,'#fff4dd',dx,.26,dz,.075,.065,.5);cylinder(g,'#695d49',dx,.045,dz,.08,.08,.10);}
  ball(g,'#fff4dd',0,.8,-.61,.28,[1,1.05,1.25]);ball(g,'#d8a69a',0,.62,-.88,.21,[1,.6,.55]);
  for(const dx of [-.2,.2]){ball(g,'#585f50',dx,.87,-.76,.04);ball(g,'#fff4dd',dx*1.6,.99,-.6,.13,[1.3,.4,.6]);cylinder(g,'#ccbd98',dx,1.13,-.62,.008,.055,.22,5);}
  limb(g,'#79664c',[0,.8,.58],[.04,.4,.89],.025);ball(g,'#535c51',.04,.37,.89,.07);
  return g;
}
export function cottage(parent,x,z) {
  const g=group(parent,x,.37,z);g.rotation.y=.10;
  box(g,'#eacfac',0,.62,0,1.85,1.25,1.55);
  box(g,'#c18d66',0,.12,.9,2.3,.22,.55);
  for(let i=0;i<9;i++)box(g,'#dbb989',-.96+i*.24,.245,.9,.22,.025,.56);
  const roof=new T.BufferGeometry();roof.setAttribute('position',new T.Float32BufferAttribute([-1.2,1.25,-1,-1.2,1.25,1,0,2,-1,0,2,1,1.2,1.25,-1,1.2,1.25,1],3));roof.setIndex([0,1,2,1,3,2,2,3,4,3,5,4,0,2,4,1,5,3]);roof.computeVertexNormals();mesh(roof,'#ad644a',g);
  for(let i=0;i<8;i++){
    const zz=-.94+i*.27;
    limb(g,'#95563f',[-1.23,1.27,zz],[0,2.035,zz],.035);limb(g,'#a76348',[0,2.035,zz],[1.23,1.27,zz],.035);
  }
  box(g,'#709e97',-.23,.53,.79,.52,.91,.07);box(g,'#ddbe83',-.23,.54,.84,.40,.75,.025);ball(g,'#8e7651',-.10,.5,.88,.035);
  box(g,'#799b94',.58,.78,.8,.4,.4,.035);box(g,'#fff1cf',.58,.78,.83,.035,.44,.04);box(g,'#fff1cf',.58,.78,.83,.44,.035,.04);
  for(const xx of [-.94,.94])cylinder(g,'#a67c53',xx,.65,1.06,.045,.045,1.25);
  box(g,'#ca9b71',0,1.27,1.04,2.02,.10,.17);
  cylinder(g,'#b17154',.74,.17,1.02,.15,.11,.30);ball(g,'#69944e',.74,.42,1.02,.22);ball(g,'#e7ac8a',.78,.58,1.02,.08);
  return g;
}
export function cookingPot(parent,x,z) {
  const g=group(parent,x,.38,z);
  for(let i=0;i<8;i++)ball(g,'#aaa38d',Math.sin(i*Math.PI/4)*.47,.10,Math.cos(i*Math.PI/4)*.47,.16,[1,.7,1]);
  for(let i=0;i<3;i++){const b=box(g,'#98704b',0,.12,0,.7,.13,.12);b.rotation.y=i*Math.PI/3;}
  cylinder(g,'#455f5e',0,.43,0,.42,.28,.42,14);
  cylinder(g,'#c1a473',0,.65,0,.39,.39,.035,16);cylinder(g,'#eac368',0,.68,0,.32,.32,.025,16);
  for(const xx of [-.47,.47]){const h=mesh(new T.TorusGeometry(.115,.035,5,10),'#435b58',g,xx,.5,0);h.rotation.y=Math.PI/2;}
  limb(g,'#9b7047',[.12,.65,0],[.38,1.1,.1],.032);
  return g;
}
export function decoration(parent,id,x,z) {
  const g=group(parent,x,.4,z);
  if(id==='flowers'){
    cylinder(g,'#b77c61',0,.13,0,.31,.23,.25);
    for(let i=0;i<6;i++){const a=i*2.4,xx=Math.sin(a)*.22,zz=Math.cos(a)*.22;limb(g,'#658d48',[xx,0,zz],[xx,.48+(i%2)*.1,zz],.02);for(let k=0;k<5;k++)ball(g,i%2?'#f4c966':'#e994a2',xx+Math.sin(k*1.26)*.065,.5+(i%2)*.1,zz+Math.cos(k*1.26)*.065,.075);ball(g,'#c28a43',xx,.54+(i%2)*.1,zz,.04);}
  }else if(id==='lantern'){
    cylinder(g,'#97764f',0,.7,0,.045,.065,1.4);limb(g,'#97764f',[0,1.39,0],[.35,1.39,0],.045);
    box(g,'#f8d481',.35,1.08,0,.26,.36,.26);for(const yy of [.87,1.29])box(g,'#746747',.35,yy,0,.34,.07,.34);
    for(const xx of [.21,.49])for(const zz of [-.14,.14])limb(g,'#746747',[xx,.88,zz],[xx,1.28,zz],.025);
  }else{
    for(let i=0;i<3;i++)box(g,'#c29667',0,.44,-.20+i*.19,1.2,.07,.15);
    for(const xx of [-.47,.47])for(const zz of [-.22,.22])box(g,'#93764f',xx,.22,zz,.08,.44,.08);
    for(const yy of [.66,.85])box(g,'#c29667',0,yy,-.25,1.2,.12,.08);
    for(const xx of [-.48,.48])box(g,'#93764f',xx,.65,-.26,.065,.55,.065);
  }
  return g;
}
export function avatar(parent,x,z) {
  const g=group(parent,x,.4,z);
  for(const dx of [-.10,.10]){box(g,'#6d8585',dx,.16,0,.13,.29,.14);box(g,'#8b684e',dx,.035,.04,.14,.08,.22);}
  cylinder(g,'#dcaa7a',0,.46,0,.19,.17,.32,7);ball(g,'#e7bd91',0,.77,0,.2,[.85,1,.9]);
  for(const dx of [-.22,.22])limb(g,'#e7bd91',[dx,.55,0],[dx,.30,.04],.06);
  cylinder(g,'#e3bf76',0,.96,0,.34,.34,.045,12);cylinder(g,'#e6c786',0,1.04,0,.17,.20,.17,10);cylinder(g,'#997755',0,.99,0,.20,.20,.035,10);
  ball(g,'#4e4e3b',-.075,.78,.156,.017);ball(g,'#4e4e3b',.075,.78,.156,.017);
  return g;
}
