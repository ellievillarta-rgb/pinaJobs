const LOGO_COLORS = [
  ['#FAEEDA','#EF9F27','#412402'],
  ['#E1F5EE','#1D9E75','#085041'],
  ['#FAECE7','#D85A30','#712B13'],
  ['#E6F1FB','#378ADD','#042C53'],
  ['#EEEDFE','#7F77DD','#26215C'],
];

let jobs = [{}]; // Placeholder, will be replaced by server data

let activeFilters = { type: 'all', setup: 'all' };
let currentSort = 'newest';

function timeAgo(date) {
  const diff = Math.floor((Date.now() - date) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return diff + ' days ago';
}

function getLogoInitial(company) { return company.charAt(0).toUpperCase(); }

function renderJobs() {
  const search = document.getElementById('search-input').value.toLowerCase();
  let filtered = jobs.filter(j => {
    const matchSearch = !search || j.title.toLowerCase().includes(search) || j.company.toLowerCase().includes(search) || j.industry.toLowerCase().includes(search);
    const matchType = activeFilters.type === 'all' || j.type === activeFilters.type;
    const matchSetup = activeFilters.setup === 'all' || j.setup === activeFilters.setup;
    return matchSearch && matchType && matchSetup;
  });

  if (currentSort === 'az') filtered.sort((a,b) => a.title.localeCompare(b.title));
  else if (currentSort === 'newest') filtered.sort((a,b) => b.posted - a.posted);
  else if (currentSort === 'salary') filtered.sort((a,b) => a.salary.localeCompare(b.salary));

  document.getElementById('jobs-count').textContent = filtered.length;
  document.getElementById('stat-jobs').textContent = jobs.length;

  const counts = { 'Full-time': 0, 'Part-time': 0, 'Internship': 0, 'Contract': 0 };
  jobs.forEach(j => { if (counts[j.type] !== undefined) counts[j.type]++; });
  document.getElementById('count-all').textContent = jobs.length;
  document.getElementById('count-full').textContent = counts['Full-time'];
  document.getElementById('count-part').textContent = counts['Part-time'];
  document.getElementById('count-intern').textContent = counts['Internship'];
  document.getElementById('count-contract').textContent = counts['Contract'];

  const list = document.getElementById('jobs-list');
  if (!filtered.length) {
    list.innerHTML = '<div class="empty-state"><i class="ti ti-mood-sad"></i><p>No jobs found. Try adjusting your filters or <strong>post the first one!</strong></p></div>';
    return;
  }

  list.innerHTML = filtered.map(j => {
    const c = LOGO_COLORS[j.logoIdx % LOGO_COLORS.length];
    const badgeHtml = j.badge === 'new' ? '<span class="job-badge badge-new">New</span>'
      : j.badge === 'hot' ? '<span class="job-badge badge-hot">Hot</span>'
      : j.badge === 'remote' ? '<span class="job-badge badge-remote">Remote</span>' : '';
    return `
    <div class="job-card" onclick="openDetail(${j.id})">
      <div class="job-card-top">
        <div class="company-logo" style="background:${c[0]};color:${c[2]};">${getLogoInitial(j.company)}</div>
        <div class="job-card-info">
          <div class="job-title">${j.title}</div>
          <div class="job-company"><i class="ti ti-building" style="font-size:12px;"></i> ${j.company} &nbsp;·&nbsp; ${j.industry}</div>
        </div>
        ${badgeHtml}
      </div>
      <div class="job-tags">
        <span class="job-tag"><i class="ti ti-clock"></i>${j.type}</span>
        <span class="job-tag"><i class="ti ti-home"></i>${j.setup}</span>
        ${j.location ? `<span class="job-tag"><i class="ti ti-map-pin"></i>${j.location}</span>` : ''}
      </div>
      <div class="job-card-footer">
        <div>
          ${j.salary ? `<div class="job-salary">${j.salary}</div>` : ''}
          <div class="job-posted">Posted ${timeAgo(j.posted)}</div>
        </div>
        <button class="btn btn-primary btn-apply" onclick="event.stopPropagation(); openDetail(${j.id})">View & Apply</button>
      </div>
    </div>
    `;
  }).join('');
}

function filterJobs() { renderJobs(); }

function setFilter(type, val, el) {
  activeFilters[type] = val;
  document.querySelectorAll(`[data-filter="${type}"]`).forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  renderJobs();
}

function sortJobs(val) { currentSort = val; renderJobs(); }

function resetFilters() {
  activeFilters = { type: 'all', setup: 'all' };
  document.getElementById('search-input').value = '';
  document.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('[data-val="all"]').forEach(b => b.classList.add('active'));
  renderJobs();
}

function openLoginModal() {
  document.getElementById('login-modal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLoginModal() {
  document.getElementById('login-modal').classList.remove('active');
  document.body.style.overflow = '';
}

function openPostModal() {
  document.getElementById('post-modal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closePostModal() {
  document.getElementById('post-modal').classList.remove('active');
  document.body.style.overflow = '';
}

function opencreateAccount() {
  document.getElementById('create-account-modal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCreateAccountModal() {
  document.getElementById('create-account-modal').classList.remove('active');
  document.body.style.overflow = '';
}

function submitJob() {
  const company = document.getElementById('f-company').value.trim();
  const title = document.getElementById('f-title').value.trim();
  const type = document.getElementById('f-type').value;
  const setup = document.getElementById('f-setup').value;
  const email = document.getElementById('f-email').value.trim();
  const desc = document.getElementById('f-desc').value.trim();
  if (!company || !title || !type || !setup || !email || !desc) {
    showToast('Please fill in all required fields', true); return;
  }
  const newJob = {
    id: Date.now(),
    title, company,
    industry: document.getElementById('f-industry').value || 'Other',
    type, setup,
    location: document.getElementById('f-location').value,
    salary: document.getElementById('f-salary').value.trim(),
    email,
    desc,
    resp: document.getElementById('f-resp').value.trim(),
    req: document.getElementById('f-req').value.trim(),
    posted: new Date(),
    badge: 'new',
    logoIdx: jobs.length
  };
  jobs.unshift(newJob);
  closePostModal();
  clearForm();
  renderJobs();
  showToast('Job posted successfully!');
}

function clearForm() {
  ['f-company','f-industry','f-title','f-type','f-setup','f-location','f-salary','f-email','f-desc','f-resp','f-req'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

function openDetail(id) {
  const j = id ? jobs.find(j => j.id === id) : null;
  if (!j) return;
  const c = LOGO_COLORS[j.logoIdx % LOGO_COLORS.length];
  const respLines = j.resp ? j.resp.split('\n').filter(Boolean) : [];
  const reqLines = j.req ? j.req.split('\n').filter(Boolean) : [];
  document.getElementById('detail-content').innerHTML = `
    <div class="modal-header">
      <div style="display:flex;align-items:center;gap:12px;">
        <div class="company-logo" style="background:${c[0]};color:${c[2]};width:48px;height:48px;border-radius:12px;font-size:20px;">${getLogoInitial(j.company)}</div>
        <div>
          <div class="modal-title" style="font-size:18px;">${j.title}</div>
          <div class="modal-sub">${j.company} &nbsp;·&nbsp; ${j.industry}</div>
        </div>
      </div>
      <button class="close-btn" onclick="closeDetail()"><i class="ti ti-x"></i></button>
    </div>
    <div class="detail-hero">
      <div class="detail-title">${j.title}</div>
      <div class="detail-company">${j.company}</div>
      <div class="detail-meta">
        <span class="detail-pill"><i class="ti ti-clock" style="font-size:13px;"></i>${j.type}</span>
        <span class="detail-pill"><i class="ti ti-home" style="font-size:13px;"></i>${j.setup}</span>
        ${j.location ? `<span class="detail-pill"><i class="ti ti-map-pin" style="font-size:13px;"></i>${j.location}</span>` : ''}
        ${j.salary ? `<span class="detail-pill"><i class="ti ti-currency-dollar" style="font-size:13px;"></i>${j.salary}</span>` : ''}
      </div>
    </div>
    <div class="detail-section">
      <h3><i class="ti ti-heart"></i> About this role</h3>
      <p>${j.desc}</p>
    </div>
    ${respLines.length ? `<div class="detail-section"><h3><i class="ti ti-list-check"></i> Responsibilities</h3><ul>${respLines.map(l=>`<li>${l}</li>`).join('')}</ul></div>` : ''}
    ${reqLines.length ? `<div class="detail-section"><h3><i class="ti ti-star"></i> Requirements</h3><ul>${reqLines.map(l=>`<li>${l}</li>`).join('')}</ul></div>` : ''}
    <div class="detail-footer">
      <div class="detail-footer-info">
        <strong>${j.salary || 'Salary not specified'}</strong>
        Posted ${timeAgo(j.posted)}
      </div>
      <a class="btn btn-primary" href="mailto:${j.email}?subject=Application for ${encodeURIComponent(j.title)}&body=Hi ${encodeURIComponent(j.company)},%0A%0AI am interested in the ${encodeURIComponent(j.title)} position."><i class="ti ti-send"></i> Apply via email</a>
    </div>
  `;
  document.getElementById('detail-modal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeDetail() {
  document.getElementById('detail-modal').classList.remove('active');
  document.body.style.overflow = '';
}

document.getElementById('post-modal').addEventListener('click', function(e) { if (e.target === this) closePostModal(); });
document.getElementById('detail-modal').addEventListener('click', function(e) { if (e.target === this) closeDetail(); });

function showToast(msg, isErr) {
  const t = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  t.style.background = isErr ? '#D85A30' : 'var(--gray-900)';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

renderJobs();