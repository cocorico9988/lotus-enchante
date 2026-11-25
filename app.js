'use strict';
const $ = selector => document.querySelector(selector);
const today = new Date(); today.setHours(0,0,0,0);
let displayedMonth = new Date(today.getFullYear(),today.getMonth(),1);
let selectedDate = null;
let selectedTime = null;
const dateLabel = date => date.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
function renderCalendar(){
  $('#calendar-title').textContent=displayedMonth.toLocaleDateString('fr-FR',{month:'long',year:'numeric'});
  $('#prev-month').disabled=displayedMonth.getFullYear()===today.getFullYear()&&displayedMonth.getMonth()===today.getMonth();
  const container=$('#calendar-days');container.replaceChildren();
  const offset=(displayedMonth.getDay()+6)%7;
  for(let i=0;i<offset;i++){const blank=document.createElement('span');blank.className='empty';blank.setAttribute('aria-hidden','true');container.append(blank);}
  const count=new Date(displayedMonth.getFullYear(),displayedMonth.getMonth()+1,0).getDate();
  for(let day=1;day<=count;day++){
    const date=new Date(displayedMonth.getFullYear(),displayedMonth.getMonth(),day);
    const button=document.createElement('button');button.type='button';button.textContent=day;button.disabled=date<today;
    button.setAttribute('aria-label',dateLabel(date));button.setAttribute('aria-pressed',String(selectedDate?.getTime()===date.getTime()));
    if(date.getTime()===today.getTime())button.classList.add('today');
    if(selectedDate?.getTime()===date.getTime())button.classList.add('selected');
    button.addEventListener('click',()=>{selectedDate=date;selectedTime=null;$('#date-summary').textContent='Votre date : '+dateLabel(date);$('#booking-error').textContent='';renderCalendar();renderTimes();const selected=$('#calendar-days .selected');selected?.focus({preventScroll:true});});
    container.append(button);
  }
}
function renderTimes(){
 const container=$('#time-slots');container.replaceChildren();
 const times=selectedDate.getDay()===0?['11:00','12:30','14:00','15:30','17:00']:['10:00','11:30','13:00','14:30','16:00','17:30','18:30'];
 const now=new Date();
 times.forEach(time=>{const [hours,minutes]=time.split(':').map(Number);const slotDate=new Date(selectedDate);slotDate.setHours(hours,minutes);
 if(slotDate<=now)return;
 const button=document.createElement('button');button.type='button';button.textContent=time;button.setAttribute('aria-pressed',String(selectedTime===time));
 if(selectedTime===time)button.classList.add('selected');
 button.addEventListener('click',()=>{selectedTime=time;$('#booking-error').textContent='';renderTimes();[...container.children].find(el=>el.textContent===time)?.focus({preventScroll:true});});container.append(button);
 });
 if(!container.children.length){const note=document.createElement('p');note.textContent='Les créneaux de ce jour sont terminés. Choisissez une autre date.';container.append(note);}
}
$('#prev-month').addEventListener('click',()=>{displayedMonth.setMonth(displayedMonth.getMonth()-1);renderCalendar();});
$('#next-month').addEventListener('click',()=>{displayedMonth.setMonth(displayedMonth.getMonth()+1);renderCalendar();});
$('#booking-form').addEventListener('submit',event=>{event.preventDefault();if(!selectedDate){$('#booking-error').textContent='Veuillez choisir une date pour continuer.';$('#calendar-days button:not(:disabled)')?.focus();return;}if(!selectedTime){$('#booking-error').textContent='Veuillez choisir un horaire pour continuer.';$('#time-slots button')?.focus();return;}location.hash='surprise';});
document.querySelectorAll('[data-treatment]').forEach(link=>link.addEventListener('click',()=>{$('#treatment').value=link.dataset.treatment;}));
function route(){
 const hash=location.hash||'#accueil';const concert=hash==='#surprise';const booking=hash==='#reservation';
 document.body.classList.toggle('concert-mode',concert);$('#spa-shell').hidden=concert;$('#reveal-view').hidden=!concert;$('#home-view').hidden=booking;$('#booking-view').hidden=!booking;
 document.title=concert?'Surprise biboube, on va voir les Strokes.':'Lotus Enchanté — Massages thaïlandais à Bastille';
 if(concert){window.scrollTo({top:0,behavior:'instant'});$('#reveal-view').focus({preventScroll:true});}
 else if(booking){renderCalendar();window.scrollTo({top:0,behavior:'instant'});}
 else if(hash==='#accueil'){window.scrollTo({top:0,behavior:'instant'});}
 else{requestAnimationFrame(()=>document.getElementById(hash.slice(1))?.scrollIntoView());}
}
// Keep the concert's internal anchor within its own visual world.
$('.hero-bottom a').addEventListener('click',event=>{event.preventDefault();$('#le-programme').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});
$('#restart').addEventListener('click',()=>{selectedDate=null;selectedTime=null;displayedMonth=new Date(today.getFullYear(),today.getMonth(),1);$('#date-summary').textContent='Veuillez sélectionner une date.';$('#time-slots').innerHTML='<p>Les horaires s’afficheront après le choix de votre date.</p>';$('#booking-error').textContent='';location.hash='accueil';});
window.addEventListener('hashchange',route);route();
