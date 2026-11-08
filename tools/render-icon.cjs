// Render the SVG icon sources into PNG sizes and a multi-resolution .ico.
// Optional developer tool; the generated assets are committed, so a normal
// build (rebuild.py) does not need Playwright.
// Run: PLAYWRIGHT_MODULE=... node tools/render-icon.cjs
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'assets');
// Small sizes use the simplified mark (bars only) so the glyph stays legible;
// 40px and above carry the full speech-bubble identity.
const PLAN=[
 {file:'icon-compact.svg',sizes:[16,20,24,32]},
 {file:'icon.svg',sizes:[40,48,64,128,180,256,512]}
];
function ico(pngs){
 const count=pngs.length,header=Buffer.alloc(6),entries=Buffer.alloc(16*count);
 header.writeUInt16LE(0,0);header.writeUInt16LE(1,2);header.writeUInt16LE(count,4);
 let offset=6+16*count;
 pngs.forEach((p,i)=>{
  const o=16*i,size=p.size>=256?0:p.size;
  entries.writeUInt8(size,o);entries.writeUInt8(size,o+1);
  entries.writeUInt8(0,o+2);entries.writeUInt8(0,o+3);
  entries.writeUInt16LE(1,o+4);entries.writeUInt16LE(32,o+6);
  entries.writeUInt32LE(p.data.length,o+8);entries.writeUInt32LE(offset,o+12);
  offset+=p.data.length;
 });
 return Buffer.concat([header,entries,...pngs.map(p=>p.data)]);
}
(async()=>{
 const b=await chromium.launch({headless:true});
 const pngs=[];
 for(const {file,sizes} of PLAN){
  const svg=fs.readFileSync(path.join(assets,file),'utf8');
  for(const size of sizes){
   const p=await b.newPage({viewport:{width:size,height:size},deviceScaleFactor:1});
   await p.setContent(`<!doctype html><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`);
   const buf=await p.screenshot({omitBackground:true,clip:{x:0,y:0,width:size,height:size}});
   await p.close();
   const out=path.join(assets,`icon-${size}.png`);
   fs.writeFileSync(out,buf);
   pngs.push({size,data:buf});
   console.log(`rendered ${file} -> ${path.basename(out)} (${buf.length} B)`);
  }
 }
 pngs.sort((a,b)=>a.size-b.size);
 // ICO stores width/height in one byte: 256 is the maximum (written as 0).
 const frames=pngs.filter(p=>p.size<=256);
 // Use PNG-compressed entries (supported by Windows Vista and later).
 fs.writeFileSync(path.join(assets,'icon.ico'),ico(frames));
 console.log('wrote assets/icon.ico ('+frames.map(p=>p.size).join(',')+')');
 await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
