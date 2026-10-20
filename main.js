const $=s=>document.querySelector(s);
const store={get:k=>JSON.parse(localStorage.getItem(k)||'[]'),add(k,v){const a=this.get(k);a.unshift(v);localStorage.setItem(k,JSON.stringify(a))}};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=n=>n.toLocaleString('uk-UA')+' ₴';
$('#burger').onclick=()=>$('#nav').classList.toggle('open');
const modal=$('#modal'),box=$('#modalBox');
function openModal(html,img){box.className='box'+(img?' img':'');box.innerHTML='<button class="close" aria-label="Закрити">&times;</button>'+html;modal.classList.add('open');box.querySelector('.close').onclick=closeModal}
function closeModal(){modal.classList.remove('open')}
modal.onclick=e=>{if(e.target===modal)closeModal()};
document.onkeydown=e=>{if(e.key==='Escape')closeModal()};
const okEmail=v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
function handle(formId,errId,okId,key,msg){
 const f=$(formId);if(!f)return;
 f.onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(f));
  if(!d.name||d.name.trim().length<2)return $(errId).textContent='Введіть ім\'я (мінімум 2 символи).';
  if(!okEmail(d.email||''))return $(errId).textContent='Введіть коректний email, наприклад name@mail.com.';
  if('msg' in d&&d.msg.trim().length<10)return $(errId).textContent='Повідомлення має містити мінімум 10 символів.';
  $(errId).textContent='';d.date=new Date().toLocaleString('uk-UA');store.add(key,d);f.reset();$(okId).textContent=msg;renderMsgs()}
}
handle('#subForm','#subErr','#subOk','subscribers','Готово! Ви в списку розсилки.');
handle('#contactForm','#cErr','#cOk','messages','Повідомлення надіслано. Відповімо протягом доби.');
function renderMsgs(){const l=$('#msgList');if(l)l.innerHTML=store.get('messages').slice(0,5).map(m=>`<li><b>${esc(m.name)}</b> (${esc(m.topic)}), ${m.date}<br>${esc(m.msg)}</li>`).join('')||'<li>Звернень поки немає.</li>'}
renderMsgs();
const g=$('#gallery');if(g)g.onclick=e=>{if(e.target.tagName==='IMG')openModal(`<img src="${e.target.getAttribute('src')}" alt="${esc(e.target.alt)}">`,true)};
const r=$('#reviews');if(r)r.innerHTML=REVIEWS.map(v=>`<div class="card"><p>«${esc(v.text)}»</p><h3 style="margin-top:14px">${esc(v.name)}</h3></div>`).join('');
const cat=$('#catalog');
if(cat){
 [...new Set(PHONES.map(p=>p.color))].forEach(c=>$('#fColor').insertAdjacentHTML('beforeend',`<option>${c}</option>`));
 const draw=()=>{let l=PHONES.filter(p=>(!$('#fColor').value||p.color===$('#fColor').value)&&(!$('#fStorage').value||p.storage==$('#fStorage').value));
  if($('#fSort').value)l.sort((a,b)=>$('#fSort').value==='asc'?a.price-b.price:b.price-a.price);
  $('#empty').textContent=l.length?'':'Нічого не знайдено. Змініть фільтри.';
  cat.innerHTML=l.map(p=>`<div class="card phone"><img src="${p.img}" alt="${esc(p.name)}"><h3>${esc(p.name)}</h3><p><span class="dot" style="background:${p.hex}"></span>${p.color}, ${p.storage>=1024?'1 ТБ':p.storage+' ГБ'}</p><div class="price">${fmt(p.price)}</div><button class="btn" data-id="${p.id}">Детальніше</button></div>`).join('')};
 ['#fColor','#fStorage','#fSort'].forEach(s=>$(s).onchange=draw);draw();
 cat.onclick=e=>{const id=e.target.dataset.id;if(!id)return;const p=PHONES.find(x=>x.id==id);
  openModal(`<h2>${esc(p.name)}</h2><p>${esc(p.desc)}</p><ul style="margin:14px 0 14px 20px">${p.specs.map(s=>`<li>${esc(s)}</li>`).join('')}</ul><div class="price" style="font-weight:700;margin-bottom:14px">${fmt(p.price)}</div><a class="btn" href="contact.html">Передзамовити</a>`)}
}
/* ===== Анімації ===== */
const calm=matchMedia('(prefers-reduced-motion:reduce)').matches;
document.body.insertAdjacentHTML('afterbegin','<div class="progress" id="prog"></div>');
addEventListener('scroll',()=>{const h=document.documentElement;$('#prog').style.width=h.scrollTop/(h.scrollHeight-h.clientHeight)*100+'%'},{passive:true});
if(!calm){
 // заголовок по словах
 document.querySelectorAll('.split').forEach(h=>{h.innerHTML=h.textContent.split(' ').map((w,i)=>`<span class="w" style="animation-delay:${i*.12}s">${w}</span>`).join(' ')});
 // поява при скролі
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.15});
 document.querySelectorAll('section h2,.card,.gallery img,.filters').forEach((el,i)=>{el.classList.add('reveal');el.style.setProperty('--d',(i%4)*.1+'s');io.observe(el)});
 // нахил телефона за мишею
 const hi=document.querySelector('.hero img');
 if(hi){hi.classList.add('float');const hero=hi.closest('.hero');
  hero.addEventListener('mousemove',e=>{const b=hero.getBoundingClientRect(),x=(e.clientX-b.left)/b.width-.5,y=(e.clientY-b.top)/b.height-.5;hi.style.transform=`perspective(800px) rotateY(${x*14}deg) rotateX(${-y*14}deg)`});
  hero.addEventListener('mouseleave',()=>hi.style.transform='')}
}
// лічильники
const cio=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;cio.unobserve(e.target);const t=+e.target.dataset.count;if(calm)return;let s=null;
 const step=ts=>{s=s||ts;const p=Math.min((ts-s)/1200,1);e.target.textContent=Math.round(t*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(step)};requestAnimationFrame(step)}),{threshold:.6});
document.querySelectorAll('[data-count]').forEach(el=>cio.observe(el));
