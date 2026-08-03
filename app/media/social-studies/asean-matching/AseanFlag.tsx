function starPoints(cx: number, cy: number, outer: number, inner: number, points = 5, rotation = -90) {
  return Array.from({ length: points * 2 }, (_, index) => {
    const radius = index % 2 ? inner : outer;
    const angle = ((rotation + index * 180 / points) * Math.PI) / 180;
    return `${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`;
  }).join(" ");
}

export default function AseanFlag({ code }: { code: string }) {
  const p = { viewBox: "0 0 60 40", preserveAspectRatio: "xMidYMid slice", role: "img", "aria-label": `ธงชาติ ${code}` } as const;
  if (code === "ID") return <svg {...p}><path fill="#e70011" d="M0 0h60v20H0z"/><path fill="#fff" d="M0 20h60v20H0z"/></svg>;
  if (code === "LA") return <svg {...p}><path fill="#ce1126" d="M0 0h60v40H0z"/><path fill="#002868" d="M0 10h60v20H0z"/><circle cx="30" cy="20" r="8" fill="#fff"/></svg>;
  if (code === "TH") return <svg {...p}><path fill="#a51931" d="M0 0h60v40H0z"/><path fill="#f4f5f8" d="M0 6.7h60v26.6H0z"/><path fill="#2d2a4a" d="M0 13.3h60v13.4H0z"/></svg>;
  if (code === "VN") return <svg {...p}><path fill="#da251d" d="M0 0h60v40H0z"/><polygon points={starPoints(30,20,10,4)} fill="#ff0"/></svg>;
  if (code === "SG") return <svg {...p}><path fill="#ef3340" d="M0 0h60v20H0z"/><path fill="#fff" d="M0 20h60v20H0z"/><circle cx="15" cy="10" r="7.4" fill="#fff"/><circle cx="18.1" cy="9" r="6.3" fill="#ef3340"/>{[[21,4.3],[24.4,7],[23.1,11.1],[19,13.2],[18,8.4]].map(([x,y],i)=><polygon key={i} points={starPoints(x,y,1.35,.55)} fill="#fff"/>)}</svg>;
  if (code === "MM") return <svg {...p}><path fill="#fecb00" d="M0 0h60v13.34H0z"/><path fill="#34b233" d="M0 13.33h60v13.34H0z"/><path fill="#ea2839" d="M0 26.66h60V40H0z"/><polygon points={starPoints(30,20,12.2,4.9)} fill="#fff"/></svg>;
  if (code === "KH") return <svg {...p}><path fill="#032ea1" d="M0 0h60v40H0z"/><path fill="#e00025" d="M0 10h60v20H0z"/><g fill="#fff"><path d="M17 26h26v2H17zM20 23h20v3H20zM23 20h14v3H23z"/><path d="M26 16h8v4h-8zM28 13h4v3h-4zM19 20h4v3h-4zM37 20h4v3h-4zM21 17h2v3h-2zM37 17h2v3h-2z"/><path d="M15 28h30v1H15z"/></g></svg>;
  if (code === "BN") return <svg {...p}><path fill="#f7e017" d="M0 0h60v40H0z"/><path stroke="#fff" strokeWidth="10" d="M-7 3l74 34"/><path stroke="#111" strokeWidth="6" d="M-7 3l74 34"/><g fill="#cf1126" stroke="#cf1126"><path d="M23 20h14l-2 6H25z"/><path fill="none" strokeWidth="1.6" d="M24 20c2 5 10 5 12 0"/><path d="M29 11h2v11h-2zM25 15h10v2H25z"/><circle cx="30" cy="13" r="2"/><path d="M20 19l5-2-2 4zm20 0l-5-2 2 4z"/></g></svg>;
  if (code === "MY") return <svg {...p}><path fill="#fff" d="M0 0h60v40H0z"/>{Array.from({length:7},(_,i)=><path key={i} fill="#cc0001" d={`M0 ${i*5.72}h60v2.86H0z`}/>)}<path fill="#010066" d="M0 0h30v22.86H0z"/><circle cx="12.5" cy="11.4" r="7.4" fill="#fc0"/><circle cx="15.3" cy="10.4" r="6.3" fill="#010066"/><polygon points={starPoints(23,11.4,5.2,2.5,14)} fill="#fc0"/></svg>;
  if (code === "PH") return <svg {...p}>
    <path fill="#0038a8" d="M0 0h60v20H0z"/>
    <path fill="#ce1126" d="M0 20h60v20H0z"/>
    <path fill="#fff" d="M0 0 30 20 0 40z"/>
    <g fill="#fcd116">
      {Array.from({ length: 8 }, (_, index) => <path key={index} d="M10.5 13.2 9.55 17.35h1.9z" transform={`rotate(${index * 45} 10.5 20)`}/>) }
      <circle cx="10.5" cy="20" r="3.35"/>
      <polygon points={starPoints(3.9,4.7,2.25,.9,5,-30)}/>
      <polygon points={starPoints(3.9,35.3,2.25,.9,5,30)}/>
      <polygon points={starPoints(25.1,20,2.25,.9,5,90)}/>
    </g>
  </svg>;
  if (code === "TL") return <svg {...p}><path fill="#dc241f" d="M0 0h60v40H0z"/><path fill="#ffc726" d="M0 0l43 20L0 40z"/><path fill="#000" d="M0 0l28 20L0 40z"/><polygon points={starPoints(10.5,20,5.3,2.1,5,0)} fill="#fff"/></svg>;
  return null;
}
