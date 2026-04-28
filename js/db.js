// db.js — SCSVMV CSV Database Manager
// Stores data in localStorage; export/import as CSV at any time.

const DB = (() => {
  /* ───────── Sample seed data ───────── */
  const SEED = {
    events: [
      { id:'EVT001', title:'National Conference on Artificial Intelligence', description:'A premier conference bringing together researchers, academicians and industry experts to discuss the latest advancements in AI, ML and Deep Learning.', category:'Conference', date:'2026-05-15', time:'09:00', venue:'Main Auditorium, SCSVMV University', organizer_name:'Dr. Rajesh Kumar', organizer_type:'faculty', organizer_id:'FAC001', status:'upcoming', max_participants:'500', registered_count:'234', image_url:'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80', tags:'AI,ML,Research', contact_email:'ai.conf@kanchiuniv.ac.in', contact_phone:'9876543210', whatsapp_link:'https://chat.whatsapp.com/invite/scsvmv-ai', created_date:'2026-04-01', approved:'true' },
      { id:'EVT002', title:'Workshop on Full Stack Web Development', description:'Hands-on workshop covering React.js, Node.js, MongoDB and deployment strategies. Perfect for beginners and intermediate developers.', category:'Workshop', date:'2026-05-20', time:'10:00', venue:'Computer Lab 3, Block B', organizer_name:'Priya Sharma', organizer_type:'student', organizer_id:'SCS2021001', status:'upcoming', max_participants:'60', registered_count:'45', image_url:'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80', tags:'WebDev,React,NodeJS', contact_email:'webdev@kanchiuniv.ac.in', contact_phone:'9876543211', whatsapp_link:'https://chat.whatsapp.com/invite/scsvmv-webdev', created_date:'2026-04-05', approved:'true' },
      { id:'EVT003', title:'Annual Cultural Fest – Sanskriti 2026', description:'The annual cultural extravaganza featuring music, dance, drama and art competitions. A celebration of creativity and culture.', category:'Cultural', date:'2026-06-10', time:'08:00', venue:'Open Air Theatre, SCSVMV Campus', organizer_name:'Cultural Committee', organizer_type:'student', organizer_id:'SCS2022015', status:'upcoming', max_participants:'1000', registered_count:'567', image_url:'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80', tags:'Cultural,Fest,Music,Dance', contact_email:'cultural@kanchiuniv.ac.in', contact_phone:'9876543212', whatsapp_link:'https://chat.whatsapp.com/invite/scsvmv-sanskriti', created_date:'2026-03-15', approved:'true' },
      { id:'EVT004', title:'Seminar on Vedic Mathematics', description:'An enlightening seminar exploring ancient mathematical techniques from Vedic scriptures and their applications in modern problem-solving.', category:'Seminar', date:'2026-04-10', time:'11:00', venue:'Seminar Hall 2, Academic Block', organizer_name:'Dr. Sundaram Iyer', organizer_type:'faculty', organizer_id:'FAC002', status:'completed', max_participants:'200', registered_count:'198', image_url:'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80', tags:'Mathematics,Vedic,Seminar', contact_email:'vedic@kanchiuniv.ac.in', contact_phone:'9876543213', whatsapp_link:'https://chat.whatsapp.com/invite/scsvmv-vedic', created_date:'2026-03-01', approved:'true' },
      { id:'EVT005', title:'Inter-College Sports Tournament', description:'Annual inter-college sports tournament featuring cricket, volleyball, kabaddi, chess and athletics competitions.', category:'Sports', date:'2026-04-18', time:'08:30', venue:'Sports Complex, SCSVMV University', organizer_name:'Sports Committee', organizer_type:'faculty', organizer_id:'FAC003', status:'completed', max_participants:'300', registered_count:'285', image_url:'https://images.unsplash.com/photo-1546519638405-a9b1e0f5a4f4?w=800&q=80', tags:'Sports,Cricket,Volleyball', contact_email:'sports@kanchiuniv.ac.in', contact_phone:'9876543214', whatsapp_link:'https://chat.whatsapp.com/invite/scsvmv-sports', created_date:'2026-03-10', approved:'true' },
      { id:'EVT006', title:'Hackathon 2026 – Code for Bharat', description:'24-hour hackathon where teams build innovative tech solutions for real-world problems in agriculture, healthcare and education.', category:'Technical', date:'2026-05-28', time:'08:00', venue:'Innovation Hub, SCSVMV University', organizer_name:'Tech Club', organizer_type:'student', organizer_id:'SCS2023005', status:'upcoming', max_participants:'150', registered_count:'89', image_url:'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80', tags:'Hackathon,Coding,Innovation', contact_email:'hackathon@kanchiuniv.ac.in', contact_phone:'9876543215', whatsapp_link:'https://chat.whatsapp.com/invite/scsvmv-hack', created_date:'2026-04-10', approved:'true' }
    ],
    participants: [
      { id:'PAR001', event_id:'EVT004', user_type:'student', user_id:'SCS2022001', name:'Arun Kumar', email:'arun@kanchiuniv.ac.in', phone:'9876543001', whatsapp:'9876543001', department:'Computer Science', year:'3', address:'Chennai, Tamil Nadu', city:'Chennai', registration_date:'2026-03-20', status:'confirmed' },
      { id:'PAR002', event_id:'EVT004', user_type:'student', user_id:'SCS2021015', name:'Meena Devi', email:'meena@kanchiuniv.ac.in', phone:'9876543002', whatsapp:'9876543002', department:'Mathematics', year:'4', address:'Kanchipuram, TN', city:'Kanchipuram', registration_date:'2026-03-22', status:'confirmed' },
      { id:'PAR003', event_id:'EVT005', user_type:'student', user_id:'SCS2023010', name:'Rajesh Babu', email:'rajesh@kanchiuniv.ac.in', phone:'9876543003', whatsapp:'9876543003', department:'Physical Education', year:'2', address:'Vellore, TN', city:'Vellore', registration_date:'2026-03-25', status:'confirmed' },
      { id:'PAR004', event_id:'EVT001', user_type:'faculty', user_id:'FAC004', name:'Dr. Priya Nair', email:'priya@kanchiuniv.ac.in', phone:'9876543004', whatsapp:'9876543004', department:'Computer Science', year:'', address:'Chennai, TN', city:'Chennai', registration_date:'2026-04-10', status:'confirmed' },
      { id:'PAR005', event_id:'EVT001', user_type:'other', user_id:'OTH001', name:'Suresh Ramamurthy', email:'suresh.r@gmail.com', phone:'9876543005', whatsapp:'9876543005', department:'', year:'', address:'45, Anna Nagar, Chennai', city:'Chennai', registration_date:'2026-04-12', status:'confirmed' }
    ],
    feedback: [
      { id:'FBK001', event_id:'EVT004', participant_name:'Arun Kumar', user_type:'student', rating:'5', title:'Mind-blowing session!', review:'The Vedic Mathematics seminar was truly eye-opening. The way complex calculations were simplified using ancient techniques was remarkable.', submission_date:'2026-04-11' },
      { id:'FBK002', event_id:'EVT004', participant_name:'Meena Devi', user_type:'student', rating:'4', title:'Very informative and engaging', review:'Excellent seminar! I learned many new techniques applicable in competitive exams. Would love more hands-on sessions.', submission_date:'2026-04-11' },
      { id:'FBK003', event_id:'EVT005', participant_name:'Rajesh Babu', user_type:'student', rating:'5', title:'Best sports event ever!', review:'The inter-college sports tournament was excellently organized. The facilities were top-notch and the competition was fierce but friendly.', submission_date:'2026-04-19' },
      { id:'FBK004', event_id:'EVT004', participant_name:'Dr. Priya Nair', user_type:'faculty', rating:'5', title:'Outstanding knowledge sharing', review:'Thoroughly impressed by the depth of content. Connections between ancient Vedic mathematics and modern computational methods were insightful.', submission_date:'2026-04-12' }
    ],
    students: [
      { reg_number:'SCS2021001', name:'Priya Sharma', email:'priya.sharma@kanchiuniv.ac.in', phone:'9876543201', whatsapp:'9876543201', department:'Computer Science', year:'4', program:'B.Tech' },
      { reg_number:'SCS2022001', name:'Arun Kumar', email:'arun@kanchiuniv.ac.in', phone:'9876543001', whatsapp:'9876543001', department:'Computer Science', year:'3', program:'B.Tech' },
      { reg_number:'SCS2021015', name:'Meena Devi', email:'meena@kanchiuniv.ac.in', phone:'9876543002', whatsapp:'9876543002', department:'Mathematics', year:'4', program:'B.Sc' },
      { reg_number:'SCS2023005', name:'Vikram Anand', email:'vikram@kanchiuniv.ac.in', phone:'9876543205', whatsapp:'9876543205', department:'Computer Science', year:'2', program:'B.Tech' },
      { reg_number:'SCS2023010', name:'Rajesh Babu', email:'rajesh@kanchiuniv.ac.in', phone:'9876543003', whatsapp:'9876543003', department:'Physical Education', year:'2', program:'B.P.Ed' },
      { reg_number:'SCS2022015', name:'Ananya Krishnan', email:'ananya@kanchiuniv.ac.in', phone:'9876543212', whatsapp:'9876543212', department:'Arts', year:'3', program:'B.A' }
    ],
    users: [
      { id:'USR_ADMIN', name:'SCSVMV Admin', email:'admin@kanchiuniv.ac.in', password_hash:'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', role:'admin', provider:'email', verified:'true', avatar:'', created_date:'2026-04-01' }
    ],
    faculty: [
      { faculty_id:'FAC001', name:'Dr. Rajesh Kumar', email:'rajesh.kumar@kanchiuniv.ac.in', phone:'9876543101', department:'Computer Science', designation:'Professor', whatsapp:'9876543101' },
      { faculty_id:'FAC002', name:'Dr. Sundaram Iyer', email:'sundaram@kanchiuniv.ac.in', phone:'9876543102', department:'Mathematics', designation:'Associate Professor', whatsapp:'9876543102' },
      { faculty_id:'FAC003', name:'Dr. Murugan', email:'murugan@kanchiuniv.ac.in', phone:'9876543103', department:'Physical Education', designation:'Director of Sports', whatsapp:'9876543103' },
      { faculty_id:'FAC004', name:'Dr. Priya Nair', email:'priya@kanchiuniv.ac.in', phone:'9876543004', department:'Computer Science', designation:'Assistant Professor', whatsapp:'9876543004' }
    ]
  };

  /* ───────── Core helpers ───────── */
  const key = t => `scsvmv_db_${t}`;

  function init() {
    Object.keys(SEED).forEach(t => {
      if (!localStorage.getItem(key(t)))
        localStorage.setItem(key(t), JSON.stringify(SEED[t]));
    });
  }

  function getAll(table)                          { return JSON.parse(localStorage.getItem(key(table))) || []; }
  function getById(table, field, val)             { return getAll(table).find(r => r[field] === val) || null; }
  function getWhere(table, filters)               { return getAll(table).filter(r => Object.entries(filters).every(([k,v]) => r[k] === v)); }

  function insert(table, record) {
    const data = getAll(table);
    data.push(record);
    localStorage.setItem(key(table), JSON.stringify(data));
    return record;
  }

  function update(table, field, val, updates) {
    const data = getAll(table);
    const i = data.findIndex(r => r[field] === val);
    if (i !== -1) { data[i] = { ...data[i], ...updates }; localStorage.setItem(key(table), JSON.stringify(data)); return data[i]; }
    return null;
  }

  function remove(table, field, val) {
    const data = getAll(table).filter(r => r[field] !== val);
    localStorage.setItem(key(table), JSON.stringify(data));
  }

  function generateId(prefix) { return prefix + Date.now() + Math.floor(Math.random()*1000); }

  /* ───────── CSV export / import ───────── */
  function toCSV(table) {
    const data = getAll(table);
    if (!data.length) return '';
    const headers = Object.keys(data[0]);
    const rows = data.map(r => headers.map(h => `"${(r[h]||'').toString().replace(/"/g,'""')}"`).join(','));
    return [headers.join(','), ...rows].join('\n');
  }

  function downloadCSV(table) {
    const blob = new Blob([toCSV(table)], { type:'text/csv' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download:`${table}_${new Date().toISOString().slice(0,10)}.csv` });
    a.click(); URL.revokeObjectURL(a.href);
  }

  function importCSV(table, text) {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g,''));
    const data = lines.slice(1).map(line => {
      const vals = []; let cur='', inQ=false;
      for (const ch of line) { if (ch==='"') inQ=!inQ; else if (ch===',' && !inQ) { vals.push(cur); cur=''; } else cur+=ch; }
      vals.push(cur);
      const row = {}; headers.forEach((h,i) => row[h]=(vals[i]||'').replace(/"/g,'').trim()); return row;
    });
    localStorage.setItem(key(table), JSON.stringify(data));
    return data;
  }

  function reset() { Object.keys(SEED).forEach(t => localStorage.setItem(key(t), JSON.stringify(SEED[t]))); }

  function stats() {
    const events    = getAll('events');
    const parts     = getAll('participants');
    const feedback  = getAll('feedback');
    return {
      totalEvents:     events.length,
      upcoming:        events.filter(e=>e.status==='upcoming').length,
      completed:       events.filter(e=>e.status==='completed').length,
      pending:         events.filter(e=>e.approved==='false').length,
      totalParts:      parts.length,
      totalFeedback:   feedback.length,
      avgRating:       feedback.length ? (feedback.reduce((s,f)=>s+Number(f.rating),0)/feedback.length).toFixed(1) : 'N/A'
    };
  }

  return { init, getAll, getById, getWhere, insert, update, remove, generateId, toCSV, downloadCSV, importCSV, reset, stats };
})();
