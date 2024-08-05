// popup.js

const lc_api = 'https://leetcode-stats-api.herokuapp.com/';

document.addEventListener('DOMContentLoaded', function () {
  const addUserBtn = document.getElementById('add-user-btn');
  const addUserInput = document.getElementById('add-user-input');

  if (addUserBtn && addUserInput) {
    addUserBtn.addEventListener('click', () => {
      const input = addUserInput.value;
      if (input) {
        fetch(lc_api + input)
          .then((rsp) => rsp.json())
          .then((jsdata) => {
            if (jsdata.status === 'error') {
              throw new Error('Invalid username');
            } else {
              enterUser(input, jsdata);
            }
          })
          .catch((err) => {
            window.alert(err.message);
          });
      } else {
        window.alert('Please enter a valid username');
      }
      addUserInput.value = '';
    });
  } else {
    console.error('Add user button or input field not found.');
  }

  if (chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.get(['lc_users'], ({ lc_users }) => {
      const users = lc_users || [];
      if (users.length !== 0) {
        for (const user of users) {
          renderTableRow(user);
        }
      }
    });
  } else {
    console.error('chrome.storage.sync is not available.');
  }
});

function enterUser(user, jsdata) {
  if (chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.get('lc_users', ({ lc_users }) => {
      const users = lc_users || [];
      if (!users.includes(user)) {
        users.push(user);
        chrome.storage.sync.set({ lc_users: users });
        createRow(user, jsdata);
      }
    });
  } else {
    console.error('chrome.storage.sync is not available.');
  }
}

function createRow(user, jsdata) {
  const table = document.getElementById('tableBody');
  if (table) {
    const row = document.createElement('tr');
    row.setAttribute('id', user);

    const c0 = document.createElement('td');
    const a = document.createElement('a');
    a.textContent = user;
    a.href = `https://leetcode.com/${user}`;
    a.target = '_blank';
    c0.appendChild(a);
    row.appendChild(c0);

    const c1 = document.createElement('td');
    c1.textContent = jsdata.totalSolved;
    row.appendChild(c1);

    const c2 = document.createElement('td');
    c2.textContent = jsdata.hardSolved;
    row.appendChild(c2);

    const c3 = document.createElement('td');
    c3.textContent = jsdata.mediumSolved;
    row.appendChild(c3);

    const c4 = document.createElement('td');
    c4.textContent = jsdata.easySolved;
    row.appendChild(c4);

    const c5 = document.createElement('td');
    const btn = document.createElement('button');
    btn.innerHTML = 'Delete';
    btn.classList.add('btn', 'btn-danger', 'btn-sm', 'btn-rounded', 'delete-btn');
    btn.setAttribute('data-field', user);
    btn.setAttribute('type', 'button');
    btn.addEventListener('click', () => delete_user(user));
    c5.appendChild(btn);
    row.appendChild(c5);

    table.appendChild(row);
  } else {
    console.error('Table body element not found.');
  }
}

function delete_user(user) {
  if (chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.get('lc_users', ({ lc_users }) => {
      const users = lc_users || [];
      if (users.includes(user)) {
        const updatedUsers = users.filter((e) => e !== user);
        chrome.storage.sync.set({ lc_users: updatedUsers });
        const elementToRemove = document.getElementById(user);
        if (elementToRemove) {
          elementToRemove.remove();
        } else {
          console.error('Element to remove not found:', user);
        }
      } else {
        console.error('User not found in storage:', user);
      }
    });
  } else {
    console.error('chrome.storage.sync is not available.');
  }
}

function renderTableRow(user) {
  fetch(lc_api + user)
    .then((rsp) => rsp.json())
    .then((jsdata) => {
      createRow(user, jsdata);
    })
    .catch((err) => {
      window.alert(err.message);
    });
}
