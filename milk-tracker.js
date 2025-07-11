let logs = JSON.parse(localStorage.getItem('milkLogs')) || [];

const amountInput = document.getElementById('amountInput');
const unitSelect = document.getElementById('unitSelect');
const logButton = document.getElementById('logButton');
const lastMilk = document.getElementById('lastMilk');
const timeAgo = document.getElementById('timeAgo');
const totalToday = document.getElementById('totalToday');
const logHistory = document.getElementById('logHistory');
let editingIndex = null;
let lastLogTime = null;

function displayTodayDate() {
  const dateElement = document.getElementById('date');
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const today = new Date().toLocaleDateString('en-US', options);
  dateElement.textContent = `Today is ${today}`;
}

// Call the function on page load
displayTodayDate();


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
    logHistory.innerHTML = `<div style="color: #777; font-size: 12px;">No logs yet.</div>`;
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

      // Show/hide edit form and buttons based on editingIndex
      const isEditing = editingIndex === index;

      return `
      <div id="log-${index}" class="milk-log">
        <span id="log-display-${index}" style="display:${isEditing ? 'none' : 'inline'};">${display}</span>
        
        <div id="edit-form-${index}" style="display:${isEditing ? 'block' : 'none'};">
          <input type="number" class="edit-input edit-input-amount" id="edit-amount-${index}" value="${log.amount}">
          <select class="edit-input edit-input-unit" id="edit-unit-${index}">
            <option value="ml" ${log.unit === 'ml' ? 'selected' : ''}>ml</option>
            <option value="oz" ${log.unit === 'oz' ? 'selected' : ''}>oz</option>
          </select>
        </div>

        <div class="logs-btn-box">
          <div id="save-cancel-box-${index}" class="logs-save-cancel-box" style="display:${isEditing ? 'flex' : 'none'};">
            <button class="logs-btn" onclick="saveEdit(${index})" style="font-size: 12px; margin-left: 4px;">
              <img class="logs-icon logs-icon-save" src="imgs/save.png" alt="Save Button">
            </button>
            <button class="logs-btn" onclick="cancelEdit(${index})" style="font-size: 12px;">
              <img class="logs-icon logs-icon-cancel" src="imgs/cancel.png" alt="Cancel Button">
            </button>
          </div>

          <div id="edit-delete-box-${index}" class="logs-edit-delete-box" style="display:${isEditing ? 'none' : 'flex'};">
            <button class="logs-btn" onclick="startEdit(${index})" style="margin-left: 8px; font-size: 12px;">
              <img class="logs-icon logs-icon-edit" src="imgs/edit.png" alt="Edit Button">
            </button>
            <button class="logs-btn" onclick="openDeleteModal(${index})" style="margin-left: 4px; font-size: 12px; color: red;">
              <img class="logs-icon logs-icon-delete" src="imgs/delete.png" alt="Delete Button">
            </button>
          </div>
        </div>
      </div>
    `;
    })
    .join('');

  // Add the Delete All button at the end
  logHistory.innerHTML += `
    <button class="btn-tracker logs-delete" onclick="openDeleteAllModal()">Delete All</button>
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
    <div class="logs-modal">
      <p class="logs-modal-text">Are you sure you want to delete <strong>all</strong> logs?</p>
      <button class="btn-modal btn-modal-delete" onclick="confirmDeleteAll()">Delete All</button>
      <button class="btn-modal btn-modal-cancel" onclick="closeDeleteAllModal()">Cancel</button>
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
        <div class="logs-modal">
          <p>Are you sure you want to delete this log?</p>
          <button class="btn-modal btn-modal-delete" onclick="confirmDelete(${index})">Delete</button>
          <button class="btn-modal btn-modal-cancel" onclick="closeDeleteModal()">Cancel</button>
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
  editingIndex = index;
  updateLogHistory();
}

function cancelEdit(index) {
  editingIndex = null;
  updateLogHistory();
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
  editingIndex = null;
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
    const mlOptions = [30, 60, 90];
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

// For PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/baby-tracker/sw.js').then(() => {
      console.log('Service Worker registered!');
    });
  });
}
