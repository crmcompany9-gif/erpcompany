import React from 'react';

const depts = [
  { icon:'💰', name:'Accounts', person:'Riya', tasks:12, sla:'95%', pending:0 },
  { icon:'🤝', name:'Key Account Manager', person:'Vinit', tasks:8, sla:'88%', pending:2 },
  { icon:'🏛️', name:'Certification (AALIGN)', person:'Lovely', tasks:5, sla:'72%', pending:3 },
  { icon:'🔁', name:'Retention', person:'Ankit & Yash', tasks:15, sla:'91%', pending:1 },
  { icon:'📞', name:'Point of Contact', person:'Rohit & Laxmi', tasks:22, sla:'85%', pending:4 },
  { icon:'🎨', name:'Content & Pitch Deck', person:'Design Team', tasks:4, sla:'61%', pending:2 },
  { icon:'🎓', name:'Grooming Team', person:'Grooming Lead', tasks:2, sla:'90%', pending:0 },
  { icon:'💻', name:'Website / IT', person:'JiTech', tasks:3, sla:'88%', pending:1 },
  { icon:'⚖️', name:'Legal', person:'Harsh & Liyen', tasks:6, sla:'100%', pending:0 },
];

function Departments() {
  return (
    <div>
      <div className="dept-grid">
        {depts.map(d => (
          <div className="dept-card" key={d.name}>
            <div className="dept-icon">{d.icon}</div>
            <div className="dept-name">{d.name}</div>
            <div className="dept-person">{d.person}</div>
            <div className="dept-stats">
              <div className="dept-stat"><strong>{d.tasks}</strong>Tasks</div>
              <div className="dept-stat"><strong>{d.sla}</strong>SLA</div>
              <div className="dept-stat"><strong>{d.pending}</strong>Pending</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Departments;