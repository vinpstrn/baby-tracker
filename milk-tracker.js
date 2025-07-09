let logs = JSON.parse(localStorage.getItem('milkLogs')) || [];

const amountInput = document.getElementById('amountInput');
const unitSelect = document.getElementById('unitSelect');
const logButton = document.getElementById('logButton');
const lastMilk = document.getElementById('lastMilk');
const timeAgo = document.getElementById('timeAgo');
const totalToday = document.getElementById('totalToday');
const logHistory = document.getElementById('logHistory');

let lastLogTime = null;

if (logs.length > 0) {
  const [lastLog] = logs;
  const { amount, unit, timestamp } = lastLog;
  lastLogTime = new Date(timestamp);
  const time = lastLogTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  lastMilk.innerHTML = `<b>Last feed</b>: ${amount} ${unit} at ${time} <span class="subtext" id="timeAgo">(just now)</span>`;
}

updateLogHistory();
updateTimeAgo();

function setAmount(value, unit = unitSelect.value) {
  amountInput.value = value;
  unitSelect.value = unit;
  updateButton();
}

function updateButton() {
  const amount = amountInput.value || 0;
  const unit = unitSelect.value;
  logButton.textContent = `Log ${amount} ${unit} of milk`;
}

function logMilk() {
  const amount = parseInt(amountInput.value);
  const unit = unitSelect.value;

  const errorId = 'amount-error';
  let existingError = document.getElementById(errorId);
  if (!amount) {
    if (!existingError) {
      const errorEl = document.createElement('div');
      errorEl.id = errorId;
      errorEl.textContent = 'Amount is required';
      errorEl.style.color = 'red';
      errorEl.style.fontSize = '13px';
      errorEl.style.marginTop = '4px';
      amountInput.parentNode.appendChild(errorEl);
    }
    return;
  } else if (existingError) {
    existingError.remove();
  }

  const now = new Date();
  const time = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  lastLogTime = now;

  lastMilk.innerHTML = `<b>Last feed</b>: ${amount} ${unit} at ${time} <span class="subtext" id="timeAgo">(just now)</span>`;

  logs.unshift({ amount, unit, timestamp: now.toISOString() });
  localStorage.setItem('milkLogs', JSON.stringify(logs));

  updateLogHistory();
  updateTotalToday();
  amountInput.value = '';
  updateButton();
}

function updateTotalToday() {
  const today = new Date().toLocaleDateString();
  let total = 0;
  const unit = unitSelect.value;
  for (let log of logs) {
    const logDate = new Date(log.timestamp).toLocaleDateString();
    if (logDate === today) {
      if (unit === 'ml') {
        total +=
          log.unit === 'ml'
            ? parseInt(log.amount)
            : Math.round(parseFloat(log.amount) * 30);
      } else {
        total +=
          log.unit === 'oz'
            ? parseFloat(log.amount)
            : parseFloat((log.amount / 30).toFixed(1));
      }
    }
  }
  totalToday.innerHTML = `<b>Total today (${today})</b>: ${total} ${unit}`;
}

function updateLogHistory() {
  if (!logHistory) return;

  if (logs.length === 0) {
    logHistory.innerHTML = `<div style="color: #777; font-size: 14px;">No logs yet.</div>`;
    return;
  }

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

      const selectedUnit = unitSelect.value;
      let displayAmount = parseFloat(log.amount);
      if (selectedUnit === 'oz' && log.unit === 'ml') {
        displayAmount = (displayAmount / 30).toFixed(1);
      } else if (selectedUnit === 'ml' && log.unit === 'oz') {
        displayAmount = Math.round(displayAmount * 30);
      }

      const display = `${date} - <span class="logs-blue">${time}: <em>${displayAmount}</em> ${selectedUnit}</span>`;
      logs[index].display = display; // for consistency

      return `
      <div id="log-${index}" class="milk-log" style="margin-bottom: 6px;">
        <span id="log-display-${index}">${display}</span>
        <div id="edit-form-${index}" style="display:none; margin-top: 4px;">
          <input type="number" class="edit-input edit-input-amount" id="edit-amount-${index}" value="${
        log.amount
      }" style="width:60px; padding:2px; font-size: 13px;">
          <select class="edit-input edit-input-unit" id="edit-unit-${index}" style="padding:2px; font-size: 13px;">
            <option value="ml" ${
              log.unit === 'ml' ? 'selected' : ''
            }>ml</option>
            <option value="oz" ${
              log.unit === 'oz' ? 'selected' : ''
            }>oz</option>
          </select>
          <button class="logs-btn" onclick="saveEdit(${index})" style="font-size: 12px; margin-left: 4px;"><img class="logs-icon logs-icon-save" src="imgs/save.png" alt="Save Button"></button>
          <button class="logs-btn" onclick="cancelEdit(${index})" style="font-size: 12px;"><img class="logs-icon logs-icon-cancel" src="imgs/cancel.png" alt="Cancel Button"></button>
        </div>
        <div class="logs-btn-box">
          <button class="logs-btn" onclick="startEdit(${index})" style="margin-left: 8px; font-size: 12px;"><img class="logs-icon logs-icon-edit" src="imgs/edit.png" alt="Edit Button">
          </button>
          <button class="logs-btn" onclick="openDeleteModal(${index})" style="margin-left: 4px; font-size: 12px; color: red;"><img class="logs-icon logs-icon-delete" src="imgs/delete.png" alt="Delete Button"></button>
        </div>
      </div>
    `;
    })
    .join('');

  // Add the Delete All button at the end
  logHistory.innerHTML += `
    <div style="text-align: center; margin-top: 12px;">
      <button class="logs-delete" onclick="openDeleteAllModal()" style="font-size: 13px; background: #dc3545; color: white; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer;">
        🗑️ Delete All Logs
      </button>
    </div>
  `;
}

function toggleLogs() {
  logHistory.style.display =
    logHistory.style.display === 'none' ? 'block' : 'none';
}

function updateTimeAgo() {
  if (!lastLogTime) return;
  const now = new Date();
  const diffMs = now - lastLogTime;
  const diffMin = Math.floor(diffMs / 60000);

  let display = '(just now)';
  if (diffMin >= 1 && diffMin < 60) {
    display = `(${diffMin} min${diffMin > 1 ? 's' : ''} ago)`;
  } else if (diffMin >= 60) {
    const hours = Math.floor(diffMin / 60);
    const minutes = diffMin % 60;
    display = `(${hours}h${minutes > 0 ? ' ' + minutes + 'm' : ''} ago)`;
  }

  const timeAgoEl = document.getElementById('timeAgo');
  if (timeAgoEl) timeAgoEl.textContent = display;
}

function updateLastMilk() {
  if (!logs.length) return;

  const { amount, unit, timestamp } = logs[0];
  const selectedUnit = unitSelect.value;

  let displayAmount = parseFloat(amount);
  if (selectedUnit === 'oz' && unit === 'ml') {
    displayAmount = (displayAmount / 30).toFixed(1);
  } else if (selectedUnit === 'ml' && unit === 'oz') {
    displayAmount = Math.round(displayAmount * 30);
  }

  const time = new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  lastMilk.innerHTML = `${displayAmount} ${selectedUnit} at ${time} <span class="subtext" id="timeAgo">(just now)</span>`;
}

function openDeleteAllModal() {
  const modal = document.createElement('div');
  modal.id = 'delete-all-modal';
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
      <p>Are you sure you want to delete <strong>all</strong> logs?</p>
      <button onclick="confirmDeleteAll()" style="margin: 0 10px; padding: 6px 12px; background: red; color: white; border: none; border-radius: 6px;">Delete All</button>
      <button onclick="closeDeleteAllModal()" style="margin: 0 10px; padding: 6px 12px; background: #ccc; border: none; border-radius: 6px;">Cancel</button>
    </div>
  `;
  document.body.appendChild(modal);
}

function closeDeleteAllModal() {
  const modal = document.getElementById('delete-all-modal');
  if (modal) document.body.removeChild(modal);
}

function confirmDeleteAll() {
  // Apply fade-out
  logHistory.classList.add('fade-out');

  // After animation completes, clear logs and hide section
  setTimeout(() => {
    logs = [];
    localStorage.removeItem('milkLogs');
    logHistory.style.display = 'none'; // auto-hide log area
    logHistory.classList.remove('fade-out', 'hidden');
    updateLogHistory(); // will now show "No logs yet."
    updateTotalToday();
    lastMilk.innerHTML = `<b>Last feed:</b> I don't drink milk yet mommy! <span class="subtext" id="timeAgo">(-)</span>`;
    closeDeleteAllModal();
  }, 400);
}

function openDeleteModal(index) {
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
          <p>Are you sure you want to delete this log?</p>
          <button onclick="confirmDelete(${index})" style="margin: 0 10px; padding: 6px 12px; background: red; color: white; border: none; border-radius: 6px;">Delete</button>
          <button onclick="closeDeleteModal()" style="margin: 0 10px; padding: 6px 12px; background: #ccc; border: none; border-radius: 6px;">Cancel</button>
        </div>
      `;
  document.body.appendChild(modal);
}

function closeDeleteModal() {
  const modal = document.getElementById('delete-modal');
  if (modal) document.body.removeChild(modal);
}

function confirmDelete(index) {
  logs.splice(index, 1);
  localStorage.setItem('milkLogs', JSON.stringify(logs));
  updateLogHistory();
  updateTotalToday();
  closeDeleteModal();
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
  const newUnit = document.getElementById(`edit-unit-${index}`).value;
  const newTime = new Date();

  logs[index] = {
    amount: parseInt(newAmount),
    unit: newUnit,
    timestamp: newTime.toISOString(),
  };

  localStorage.setItem('milkLogs', JSON.stringify(logs));
  updateLogHistory();
  updateTotalToday();
}

unitSelect.addEventListener('change', () => {
  const buttons = document.querySelectorAll('.quick-buttons button');
  const placeholder =
    unitSelect.value === 'oz' ? 'Enter amount in oz' : 'Enter amount in ml';
  amountInput.placeholder = placeholder;

  if (unitSelect.value === 'oz') {
    const ozOptions = [2, 3, 4];
    ozOptions.forEach((oz, index) => {
      if (buttons[index]) {
        buttons[index].textContent = `${oz} oz`;
        buttons[index].setAttribute('onclick', `setAmount(${oz}, 'oz')`);
      }
    });
  } else {
    const mlOptions = [60, 90, 120];
    mlOptions.forEach((ml, index) => {
      if (buttons[index]) {
        buttons[index].textContent = `${ml} ml`;
        buttons[index].setAttribute('onclick', `setAmount(${ml}, 'ml')`);
      }
    });
  }

  updateTotalToday();
  updateLogHistory();
  updateLastMilk();
  updateButton();
});

amountInput.addEventListener('input', updateButton);
updateButton();
updateTotalToday();
setInterval(updateTimeAgo, 60000);
