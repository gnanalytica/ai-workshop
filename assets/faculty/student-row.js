// Student row renderer shared between My pod and Whole cohort tabs.

function escape(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);}

function chip(text, tone='') {
  return `<span class="kicker-tag${tone ? ' ' + tone : ''}">${escape(text)}</span>`;
}

export function renderStudentRow(profile, signals, { tagMine = false } = {}) {
  const s = signals || {};
  const pct = s.daysTotal ? Math.round((s.daysDone / s.daysTotal) * 100) : 0;
  return `
    <tr data-uid="${escape(profile.id)}">
      <td>
        <b>${escape(profile.full_name || '—')}</b>
        ${tagMine ? '<span class="kicker-tag" style="margin-left:6px">mine</span>' : ''}
        <div class="muted" style="font-size:11.5px">${escape(profile.college || '')}</div>
      </td>
      <td style="min-width:140px">
        <div style="height:6px;border-radius:3px;background:var(--line);overflow:hidden">
          <div style="height:100%;width:${pct}%;background:var(--accent)"></div>
        </div>
        <div class="muted" style="font-size:11px">${s.daysDone||0}/${s.daysTotal||0} · ${pct}%</div>
      </td>
      <td>${chip(`${s.subsGraded||0}✓ / ${s.subsPending||0}…`)}</td>
      <td>${chip(`${s.attended||0}/${s.attMarked||0}`)}</td>
      <td>${s.stuckOpen ? chip(`${s.stuckOpen} open`, 'warn') : '<span class="muted">—</span>'}</td>
      <td>${chip(`${s.reviewsGiven||0}→ / ${s.reviewsReceived||0}←`)}</td>
      <td class="muted" style="font-size:12px">${s.lastActive ? new Date(s.lastActive).toLocaleDateString() : '—'}</td>
      <td>${s.atRisk ? '<span class="kicker-tag warn">at-risk</span>' : ''}</td>
      <td style="text-align:right"><button class="btn-sm" data-open-drawer="${escape(profile.id)}">Open →</button></td>
    </tr>`;
}
