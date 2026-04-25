(function(){self.onmessage=e=>{let{text:t}=e.data;if(!t){self.postMessage({formatted:``,count:0});return}let n=t.replace(/\r\n/g,`
`).replace(/\s+/g,` `).trim();n=n.replace(/\b([A-D])[)\.]\s+/g,`
[OPT]$1) `),n=n.replace(/\b(Answer:\s*[A-D])/gi,`
[ANS]$1
[END_BLOCK]
`);let r=n.split(`[END_BLOCK]`).map(e=>e.trim()).filter(e=>e!==``),i=[],a=1;r.forEach(e=>{let t=e.split(`
`).map(e=>e.trim()).filter(e=>e!==``);if(t.length===0)return;let n=``,r=[],o=``;if(t.forEach(e=>{if(e.startsWith(`[OPT]`))r.push(e.replace(`[OPT]`,``));else if(e.startsWith(`[ANS]`))o=e.replace(`[ANS]`,``);else{let t=e.replace(/^\d+[\s\.)]*/,``).trim();t&&(n+=(n?` `:``)+t)}}),n||r.length>0){let e=`${a}. ${n}\n`;r.length>0&&(e+=r.join(`
`)+`
`),o&&(e+=o),i.push(e.trim()),a++}}),self.postMessage({formatted:i.join(`

`),count:i.length})}})();