import { generateProposal, monthlyRevenue, projectProgress } from './core.js';

const STORAGE_KEY = 'orbit-freelancers-os-v1';
const seed = {
  projects: [
    { id: 1, name: 'Lahore Café Website', client: 'Saffron Café', value: 85000, status: 'Design', tasks: [{title:'Approve homepage',done:true},{title:'Mobile polish',done:false},{title:'Connect WhatsApp',done:false}] },
    { id: 2, name: 'Property Lead Dashboard', client: 'Urban Keys', value: 140000, status: 'Build', tasks: [{title:'Data model',done:true},{title:'Lead filters',done:true},{title:'Client review',done:false}] }
  ],
  tasks: [{ id: 11, title: 'Send café homepage preview', due: 'Today', done: false },{ id: 12, title: 'Follow up on invoice #102', due: 'Today', done: false },{ id: 13, title: 'Prepare weekly client update', due: 'Friday', done: true }],
  invoices: [{ id: 101, client: 'Saffron Café', amount: 42500, status: 'Paid', due: 'Sep 12' },{ id: 102, client: 'Urban Keys', amount: 70000, status: 'Pending', due: 'Sep 22' },{ id: 103, client: 'Nexa Studio', amount: 30000, status: 'Overdue', due: 'Sep 10' }]
};
const $ = (id) => document.getElementById(id);
const pkr = (value) => `PKR ${Number(value || 0).toLocaleString('en-PK')}`;
let data = load();
function load(){try{return {...structuredClone(seed),...JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')}}catch{return structuredClone(seed)}}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(data))}
function toast(message){$('toast').textContent=message;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),2200)}

function render(){
  const revenue=monthlyRevenue(data.invoices);const pipeline=data.projects.reduce((sum,p)=>sum+Number(p.value||0),0);const open=data.tasks.filter(t=>!t.done).length;
  $('revenue-total').textContent=pkr(revenue);$('pipeline-total').textContent=pkr(pipeline);$('open-task-count').textContent=open;
  $('collection-rate').textContent=`${Math.round(data.invoices.filter(i=>i.status==='Paid').length/(data.invoices.length||1)*100)}%`;
  $('project-list').innerHTML=data.projects.length?data.projects.map(project=>{const progress=projectProgress(project.tasks);return `<div class="project"><div><div class="project-title"><i></i><h3>${escapeHtml(project.name)}</h3></div><p>${escapeHtml(project.client)} · ${escapeHtml(project.status)}</p></div><div class="project-value"><strong>${pkr(project.value)}</strong><span>${progress}% complete</span></div><div class="progress"><i style="width:${progress}%"></i></div></div>`}).join(''):'<div class="empty">Add your first client project.</div>';
  $('task-list').innerHTML=data.tasks.length?data.tasks.map(task=>`<label class="task ${task.done?'done':''}"><input type="checkbox" data-task="${task.id}" ${task.done?'checked':''}/><span>${escapeHtml(task.title)}<small>${escapeHtml(task.due)}</small></span></label>`).join(''):'<div class="empty">Your focus list is clear.</div>';
  document.querySelectorAll('[data-task]').forEach(input=>input.addEventListener('change',()=>{const task=data.tasks.find(t=>t.id===Number(input.dataset.task));task.done=input.checked;save();render()}));
  $('invoice-list').innerHTML=data.invoices.length?data.invoices.map(invoice=>`<tr><td>${escapeHtml(invoice.client)}</td><td>${pkr(invoice.amount)}</td><td><span class="pill ${invoice.status.toLowerCase()}">${invoice.status}</span></td><td>${escapeHtml(invoice.due)}</td></tr>`).join(''):'<tr><td colspan="4" class="empty">No invoices yet.</td></tr>';
}
function escapeHtml(value){return String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]))}

const dialog=$('entry-dialog');let dialogType='project';
function openDialog(type){
  dialogType=type;const configs={
    project:{title:'Add project',fields:`<label>Project name<input name="name" required placeholder="Brand website"/></label><label>Client<input name="client" required placeholder="Client or company"/></label><label>Project value (PKR)<input name="value" required type="number" min="0" value="50000"/></label><label>Stage<select name="status"><option>Discovery</option><option>Design</option><option>Build</option><option>Review</option></select></label>`},
    task:{title:'Add focus task',fields:`<label>Task<input name="title" required placeholder="Send client update"/></label><label>Due<input name="due" required placeholder="Today"/></label>`},
    invoice:{title:'Add invoice',fields:`<label>Client<input name="client" required placeholder="Client name"/></label><label>Amount (PKR)<input name="amount" required type="number" min="0" value="25000"/></label><label>Status<select name="status"><option>Pending</option><option>Paid</option><option>Overdue</option></select></label><label>Due date<input name="due" required placeholder="Sep 30"/></label>`}
  };
  $('dialog-title').textContent=configs[type].title;$('dialog-fields').innerHTML=configs[type].fields;dialog.showModal();
}
$('entry-form').addEventListener('submit',event=>{if(event.submitter?.value==='cancel')return;event.preventDefault();const values=Object.fromEntries(new FormData(event.currentTarget));
  if(dialogType==='project')data.projects.unshift({id:Date.now(),name:values.name,client:values.client,value:Number(values.value),status:values.status,tasks:[]});
  if(dialogType==='task')data.tasks.unshift({id:Date.now(),title:values.title,due:values.due,done:false});
  if(dialogType==='invoice')data.invoices.unshift({id:Date.now(),client:values.client,amount:Number(values.amount),status:values.status,due:values.due});
  save();render();dialog.close();event.currentTarget.reset();toast(`${dialogType[0].toUpperCase()+dialogType.slice(1)} saved`);
});

$('open-project').addEventListener('click',()=>openDialog('project'));$('open-project-2').addEventListener('click',()=>openDialog('project'));$('add-task').addEventListener('click',()=>openDialog('task'));$('add-invoice').addEventListener('click',()=>openDialog('invoice'));
$('generate-proposal').addEventListener('click',()=>{$('proposal-output').textContent=generateProposal({client:$('proposal-client').value,project:$('proposal-project').value,service:$('proposal-service').value,timeline:$('proposal-timeline').value,price:$('proposal-price').value});toast('Proposal ready')});
$('copy-proposal').addEventListener('click',async()=>{const text=$('proposal-output').textContent;if(!text||text.includes('Complete the fields'))return toast('Generate a proposal first');await navigator.clipboard.writeText(text);toast('Proposal copied')});
render();
