// vitamins.js

let logs = JSON.parse(localStorage.getItem('vitaminLogs')) || [];

let amountInput,
  vitaminNameInput,
  logButton,
  lastLogTikiTiki,
  lastLogCeline,
  lastLogOther,
  timeAgoTikiTiki,
  timeAgoCeline,
  timeAgoOther,
  logHistory;
let lastLogTimeTiki = null,
  lastLogTimeCeline = null,
  lastLogTimeOther = null;

function setAmount(value) {
  amountInput.value = value;
  updateButton();
}

function setVitamin(name) {
  vitaminNameInput.value = name;
  updateButton();
}

function normalizeName(name) {
  return name.toLowerCase().replace(/\s+/g, '');
}

function updateButton() {
  const amount = amountInput.value || 0;
  const name = vitaminNameInput.value || 'vitamin';
  logButton.textContent = `Log ${amount} ml of ${name} 💾`;
}

function logVitamin() {
  const amount = parseFloat(amountInput.value);
  const name = vitaminNameInput.value.trim();
  const normalized = normalizeName(name);

  const existingAmountError = document.getElementById('amount-error');
  const existingNameError = document.getElementById('name-error');
  if (existingAmountError) existingAmountError.remove();
  if (existingNameError) existingNameError.remove();

  let hasError = false;

  if (!amountInput.value.trim()) {
    const errorEl = document.createElement('div');
    errorEl.id = 'amount-error';
    errorEl.textContent = 'Amount is required';
    errorEl.style.color = 'red';
    errorEl.style.fontSize = '13px';
    errorEl.style.marginTop = '4px';
    amountInput.parentNode.appendChild(errorEl);
    hasError = true;
  }

  if (!vitaminNameInput.value.trim()) {
    const errorEl = document.createElement('div');
    errorEl.id = 'name-error';
    errorEl.textContent = 'Vitamin name is required';
    errorEl.style.color = 'red';
    errorEl.style.fontSize = '13px';
    errorEl.style.marginTop = '4px';
    vitaminNameInput.parentNode.appendChild(errorEl);
    hasError = true;
  }

  if (hasError) return;

  const now = new Date();
  const time = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  logs.unshift({ amount, name, timestamp: now.toISOString() });
  localStorage.setItem('vitaminLogs', JSON.stringify(logs));

  updateLogHistory();
  updateLastLogs();

  amountInput.value = '';
  vitaminNameInput.value = '';
  updateButton();
}

function updateLogHistory() {
  logHistory.innerHTML = logs
    .map((log, index) => {
      const logDate = new Date(log.timestamp);
      const time = logDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      const date = logDate.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const display = `${log.amount} ml of ${log.name} at ${time} on ${date}`;

      return `
      <div id="log-${index}" style="margin-bottom: 6px;">
        • <span id="log-display-${index}">${display}</span>
        <div id="edit-form-${index}" style="display:none; margin-top: 4px;">
          <input type="number" id="edit-amount-${index}" value="${log.amount}" style="width:60px; padding:2px; font-size: 13px;">
          <input type="text" id="edit-name-${index}" value="${log.name}" style="padding:2px; font-size: 13px; width: 100px;">
          <button onclick="saveEdit(${index})" style="font-size: 12px; margin-left: 4px;">💾 Save</button>
          <button onclick="cancelEdit(${index})" style="font-size: 12px;">❌ Cancel</button>
        </div>
        <button onclick="startEdit(${index})" style="margin-left: 8px; font-size: 12px;">✏️</button>
        <button onclick="deleteLog(${index})" style="margin-left: 4px; font-size: 12px; color: red;">🗑️</button>
      </div>
    `;
    })
    .join('');

  if (logs.length > 0) {
    logHistory.innerHTML += `
      <button class="delete-all-btn" onclick="openDeleteAllModal()">🪹 Delete All Logs</button>
    `;
  }
}

function deleteLog(index) {
  const modal = document.createElement('div');
  modal.id = `delete-log-modal-${index}`;
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.innerHTML = `
    <div style="background:white; padding: 20px; border-radius: 10px; text-align:center;">
      <p>Are you sure you want to delete this log?</p>
      <button onclick="confirmDeleteLog(${index})" style="margin: 0 10px; padding: 6px 12px; background: red; color: white; border: none; border-radius: 6px;">Delete</button>
      <button onclick="cancelDeleteLog(${index})" style="margin: 0 10px; padding: 6px 12px; background: #ccc; border: none; border-radius: 6px;">Cancel</button>
    </div>
  `;
  document.body.appendChild(modal);
}

function startEdit(index) {
  document.getElementById(`edit-form-${index}`).style.display = 'block';
  document.getElementById(`log-display-${index}`).style.display = 'none';
}

function cancelEdit(index) {
  document.getElementById(`edit-form-${index}`).style.display = 'none';
  document.getElementById(`log-display-${index}`).style.display = 'inline';
}

function saveEdit(index) {
  const newAmount = document.getElementById(`edit-amount-${index}`).value;
  const newName = document.getElementById(`edit-name-${index}`).value.trim();
  const newTime = new Date();

  logs[index] = {
    amount: parseFloat(newAmount),
    name: newName,
    timestamp: newTime.toISOString(),
  };

  localStorage.setItem('vitaminLogs', JSON.stringify(logs));
  updateLogHistory();
  updateLastLogs();
}

function updateLastLogs() {
  const today = new Date().toLocaleDateString();

  let totalTiki = 0,
    latestTiki = null;
  let totalCeline = 0,
    latestCeline = null;
  let totalOther = 0,
    latestOther = null;

  for (let log of logs) {
    const logDate = new Date(log.timestamp).toLocaleDateString();
    const norm = normalizeName(log.name);
    if (logDate !== today) continue;

    if (norm === 'tikitiki') {
      totalTiki += parseFloat(log.amount);
      if (!latestTiki) latestTiki = log;
    } else if (norm === 'celine') {
      totalCeline += parseFloat(log.amount);
      if (!latestCeline) latestCeline = log;
    } else {
      totalOther += parseFloat(log.amount);
      if (!latestOther) latestOther = log;
    }
  }

  if (latestTiki) {
    lastLogTimeTiki = new Date(latestTiki.timestamp);
    const diffMin = Math.floor((new Date() - lastLogTimeTiki) / 60000);
    const timeAgoText = formatAgo(diffMin);
    const time = lastLogTimeTiki.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    lastLogTikiTiki.innerHTML = `${totalTiki} ml of TikiTiki at ${time} <span class="subtext" id="timeAgo-TikiTiki">${timeAgoText}</span>`;
  } else {
    lastLogTikiTiki.innerHTML = `No recent TikiTiki <span class="subtext" id="timeAgo-TikiTiki">(-)</span>`;
    lastLogTimeTiki = null;
  }

  if (latestCeline) {
    lastLogTimeCeline = new Date(latestCeline.timestamp);
    const diffMin = Math.floor((new Date() - lastLogTimeCeline) / 60000);
    const timeAgoText = formatAgo(diffMin);
    const time = lastLogTimeCeline.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    lastLogCeline.innerHTML = `${totalCeline} ml of Celine at ${time} <span class="subtext" id="timeAgo-Celine">${timeAgoText}</span>`;
  } else {
    lastLogCeline.innerHTML = `No recent Celine <span class="subtext" id="timeAgo-Celine">(-)</span>`;
    lastLogTimeCeline = null;
  }

  if (latestOther) {
    lastLogTimeOther = new Date(latestOther.timestamp);
    const time = lastLogTimeOther.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    lastLogOther.innerHTML = `${totalOther} ml of ${latestOther.name} at ${time} <span class="subtext" id="timeAgo-Other">(just now)</span>`;
  } else {
    lastLogOther.innerHTML = `No recent Others <span class="subtext" id="timeAgo-Other">(-)</span>`;
    lastLogTimeOther = null;
  }
}

function updateTimeAgo() {
  const now = new Date();

  if (lastLogTimeTiki) {
    const diffMin = Math.floor((now - lastLogTimeTiki) / 60000);
    const el = document.getElementById('timeAgo-TikiTiki');
    if (el) el.textContent = formatAgo(diffMin);
  }

  if (lastLogTimeCeline) {
    const diffMin = Math.floor((now - lastLogTimeCeline) / 60000);
    const el = document.getElementById('timeAgo-Celine');
    if (el) el.textContent = formatAgo(diffMin);
  }

  if (lastLogTimeOther) {
    const diffMin = Math.floor((now - lastLogTimeOther) / 60000);
    const el = document.getElementById('timeAgo-Other');
    if (el) el.textContent = formatAgo(diffMin);
  }
}

function formatAgo(diffMin) {
  if (diffMin < 1) return '(just now)';
  if (diffMin < 60) return `(${diffMin} min${diffMin > 1 ? 's' : ''} ago)`;
  const h = Math.floor(diffMin / 60);
  const m = diffMin % 60;
  return `(${h}h${m > 0 ? ' ' + m + 'm' : ''} ago)`;
}

function toggleLogs() {
  const isVisible = logHistory.style.display !== 'none';
  logHistory.style.display = isVisible ? 'none' : 'block';
  if (!isVisible) updateLogHistory();
}

function openDeleteAllModal() {
  const modal = document.createElement('div');
  modal.id = 'delete-modal';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.innerHTML = `
    <div style="background:white; padding: 20px; border-radius: 10px; text-align:center;">
      <p>Are you sure you want to delete all logs?</p>
      <button onclick="deleteAllLogs()" style="margin: 0 10px; padding: 6px 12px; background: red; color: white; border: none; border-radius: 6px;">Delete</button>
      <button onclick="closeDeleteAllModal()" style="margin: 0 10px; padding: 6px 12px; background: #ccc; border: none; border-radius: 6px;">Cancel</button>
    </div>
  `;
  document.body.appendChild(modal);
}

function closeDeleteAllModal() {
  const modal = document.getElementById('delete-modal');
  if (modal) document.body.removeChild(modal);
}

function deleteAllLogs() {
  logs = [];
  localStorage.setItem('vitaminLogs', JSON.stringify(logs));
  updateLogHistory();
  updateLastLogs();
  closeDeleteAllModal();
}

window.addEventListener('DOMContentLoaded', () => {
  amountInput = document.getElementById('amountInput');
  vitaminNameInput = document.getElementById('vitaminNameInput');
  logButton = document.getElementById('logButton');
  lastLogTikiTiki = document.getElementById('lastLog-TikiTiki');
  lastLogCeline = document.getElementById('lastLog-Celine');
  lastLogOther = document.getElementById('lastLog-Other');
  timeAgoTikiTiki = document.getElementById('timeAgo-TikiTiki');
  timeAgoCeline = document.getElementById('timeAgo-Celine');
  timeAgoOther = document.getElementById('timeAgo-Other');
  logHistory = document.getElementById('logHistory');

  updateLastLogs();
  updateButton();
  updateTimeAgo();
  amountInput.addEventListener('input', updateButton);
  vitaminNameInput.addEventListener('input', updateButton);
  setInterval(updateTimeAgo, 60000);
});

// Expose functions globally
window.logVitamin = logVitamin;
window.setAmount = setAmount;
window.setVitamin = setVitamin;
window.toggleLogs = toggleLogs;
window.startEdit = startEdit;
window.cancelEdit = cancelEdit;
window.saveEdit = saveEdit;
window.deleteLog = deleteLog;

function confirmDeleteLog(index) {
  logs.splice(index, 1);
  localStorage.setItem('vitaminLogs', JSON.stringify(logs));
  updateLogHistory();
  updateLastLogs();
  cancelDeleteLog(index);
}

function cancelDeleteLog(index) {
  const modal = document.getElementById(`delete-log-modal-${index}`);
  if (modal) document.body.removeChild(modal);
}
