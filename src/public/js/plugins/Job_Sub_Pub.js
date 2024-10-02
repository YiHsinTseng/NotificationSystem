import formatDate from '../dateUtils.js';

// 職缺資料操作
async function fetchPubbedJobData(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!data.result || data.result.items.length === 0) {
    throw new Error('no data');
  }

  return data.result;
}

// 訂閱資料操作
async function fetchSubscribedConditions(token, job_plugin_id) {
  try {
    const response = await fetch(`api/plugins/${job_plugin_id}/jobSubInfo`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();

    console.log(data);
    if (data) {
      document.getElementById('industries').value = data.industries.join(', ');
      document.getElementById('job_info').value = data.job_info.join(', ');
      document.getElementById('exclude_job_title').value = data.exclude_job_title.join(', ');
    }
  } catch (error) { console.error('獲取訂閱數據時發生錯誤:', error); }
}

function fetchSubscribedJobsAndCompanies(token, job_plugin_id) {
  return fetch(`api/plugins/${job_plugin_id}/subInfo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json()) // 解析回應為 JSON
    .then((data) => {
      localStorage.setItem('subscribedJobsAndCompanies', JSON.stringify(data));
    })
    .catch((error) => {
      console.error('顯示時發生錯誤:', error);
    });
}

async function subscribeToJob(token, job_plugin_id, job_ids, company_names, type) {
  await fetch(`api/plugins/${job_plugin_id}/instant_sub`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      type,
      data: {
        sub: {
          job_ids,
          company_names,
        },
      },
    }),
  })
    .then((response) => response.json())
    .catch((error) => console.error('訂閱職位時發生錯誤:', error));
  await fetchSubscribedJobsAndCompanies(token, job_plugin_id);
}

function getSubscribedJobsAndCompanies() {
  const subscribedIdsString = localStorage.getItem('subscribedJobsAndCompanies');
  let subscribedJobIds = [];
  let subscribedCompanyNames = [];

  if (subscribedIdsString) {
    try {
      const { job_ids = [], company_names = [] } = JSON.parse(subscribedIdsString);
      subscribedJobIds = job_ids || [];
      subscribedCompanyNames = company_names || [];
    } catch (error) {
      console.error('解析 JSON 時出錯:', error);
    }
  } else {
    console.error('localStorage 中沒有找到 subscribedJobsAndCompanies 或數據無效');
  }
  const subscribedJobsAndCompanies = { subscribedJobIds, subscribedCompanyNames };
  return subscribedJobsAndCompanies;
}

// 已讀相關操作

function getReadJobs() {
  return JSON.parse(localStorage.getItem('readJobs')) || [];
}

function isJobRead(jobId) {
  const readJobs = getReadJobs();
  return readJobs.includes(jobId);
}

function markJobAsRead(jobId) {
  const readJobs = getReadJobs();
  if (!readJobs.includes(jobId)) {
    readJobs.push(jobId);
    localStorage.setItem('readJobs', JSON.stringify(readJobs));
  }
}

// UI

function createJobExperienceElement(jobExperience) {
  const jobExperienceElement = document.createElement('div');
  jobExperienceElement.className = 'job_exp';
  jobExperienceElement.textContent = `年資要求: ${jobExperience}`;
  return jobExperienceElement;
}

function createJobDescriptionElement(description) {
  const jobDescriptionElement = document.createElement('div');
  jobDescriptionElement.className = 'job-desc';
  jobDescriptionElement.textContent = description.length > 100 ? `${description.substring(0, 100)}...` : description;
  return jobDescriptionElement;
}

function createJobUpdateDateElement(updateDate) {
  const dateElement = document.createElement('div');
  dateElement.className = 'job-date';
  dateElement.textContent = `更新日期: ${formatDate(updateDate)}`;
  return dateElement;
}

function createJobSourceElement(source) {
  const sourceElement = document.createElement('div');
  sourceElement.className = 'job-source';
  sourceElement.textContent = `來源: ${source}`;
  return sourceElement;
}

function createJobInfoElement(info) {
  const infoElement = document.createElement('div');
  infoElement.className = 'job-info';
  infoElement.textContent = `職位資訊: ${info}`;
  return infoElement;
}

function handleFetchError() {
  const jobListElement = document.getElementById('job-list');
  jobListElement.innerHTML = '消息過期或無最新職缺';
}

// 與監聽器有關函式
export function initializePlugin(token, job_plugin_id) {
  function handleJobItemReadStatus(jobItem, jobId) {
    if (isJobRead(jobId)) {
      jobItem.classList.add('read');
    }

    const jobTitleElement = jobItem.querySelector('.job-title');
    jobTitleElement.addEventListener('click', () => {
      markJobAsRead(jobId);
      jobItem.classList.add('read');
    });
  }

  function createSubscribeButton(
    text,
    subscribedItem,
    subscribedJobsAndCompanies,
    token,
    job_plugin_id,
    notification,
  ) {
    const button = document.createElement('button');
    button.className = 'subscribe-button';
    const isSubscribed = subscribedJobsAndCompanies.includes(subscribedItem);
    button.textContent = isSubscribed ? '已訂閱' : text;

    button.addEventListener('click', async () => {
      const action = isSubscribed ? 2 : 1; // 1: 訂閱, 2: 取消訂閱
      switch (text) {
        case '訂閱職缺':
          await subscribeToJob(token, job_plugin_id, [subscribedItem], [], action); // 用職缺 ID 訂閱
          break;
        case '訂閱公司':
          await subscribeToJob(token, job_plugin_id, [], [subscribedItem], action); // 用公司名稱 訂閱
          break;
        default:
          console.warn(`未處理的按鈕文本: ${text}`);
          break;
      }
      await openJobs(notification);
    });

    return button;
  }

  function createJobItem(
    job,
    indexOfItem,
    { subscribedJobIds, subscribedCompanyNames },
    token,
    job_plugin_id,
    notification,
  ) {
    const jobItem = document.createElement('div');
    jobItem.className = 'job-item';

    const jobNumber = document.createElement('div');
    jobNumber.className = 'job-number';
    jobNumber.textContent = `#${indexOfItem}`;

    const jobTitleElement = document.createElement('a');
    jobTitleElement.className = 'job-title';
    jobTitleElement.textContent = job.job_title;
    jobTitleElement.href = job.job_link;
    jobTitleElement.target = '_blank';

    const subscribeButtonTitle = createSubscribeButton(
      '訂閱職缺',
      job.job_id,
      subscribedJobIds,
      token,
      job_plugin_id,
      notification,
    );

    function createCompanyElement(
      companyName,
      subscribedCompanyNames,
      token,
      job_plugin_id,
      notification,
    ) {
      const companyElement = document.createElement('div');
      companyElement.className = 'job-company';
      companyElement.textContent = companyName;

      const subscribeButtonCompany = createSubscribeButton(
        '訂閱公司',
        companyName,
        subscribedCompanyNames,
        token,
        job_plugin_id,
        notification,
      );

      companyElement.appendChild(subscribeButtonCompany);
      return companyElement;
    }

    const companyElement = createCompanyElement(
      job.company_name,
      subscribedCompanyNames,
      token,
      job_plugin_id,
      notification,
    );

    const jobExperienceElement = createJobExperienceElement(job.job_exp);
    const jobDescriptionElement = createJobDescriptionElement(job.job_desc);
    const updateDate = createJobUpdateDateElement(job.update_date);
    const source = createJobSourceElement(job.source);
    const jobInfoElement = createJobInfoElement(job.job_info);

    const readButton = document.createElement('button');
    readButton.className = 'read-button';
    readButton.textContent = '已讀';

    const saveButton = document.createElement('button');
    saveButton.className = 'save-button';
    saveButton.textContent = '最愛';

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';

    readButton.addEventListener('click', () => {
      markJobAsRead(job.job_id);
      jobItem.classList.add('read');
    });
    buttonContainer.appendChild(saveButton);
    buttonContainer.appendChild(readButton);

    jobItem.append(
      jobNumber,
      buttonContainer,
      jobTitleElement,
      subscribeButtonTitle,
      companyElement,
      jobExperienceElement,
      jobDescriptionElement,
      updateDate,
      source,
      jobInfoElement,
    );

    return jobItem;
  }

  function displayJobList(
    jobData,
    { subscribedJobIds, subscribedCompanyNames },
    token,
    job_plugin_id,
    notification,
  ) {
    const jobListElement = document.getElementById('job-list');
    jobListElement.innerHTML = '';

    const sortedJobData = jobData.items.sort(
      (a, b) => new Date(b.update_date) - new Date(a.update_date),
    );

    sortedJobData.forEach((job, index) => {
      const jobItem = createJobItem(
        job,
        index + 1,
        { subscribedJobIds, subscribedCompanyNames },
        token,
        job_plugin_id,
        notification,
      );
      jobListElement.appendChild(jobItem);
      handleJobItemReadStatus(jobItem, job.job_id);
    });

    const infoText = document.createElement('div');
    infoText.className = 'info-text';
    jobListElement.appendChild(infoText);
  }

  // JOB查看模組
  async function openJobs(notification) {
    // 從 localStorage 中提取已訂閱的 job_ids 和 company_names
    const { subscribedJobIds, subscribedCompanyNames } = getSubscribedJobsAndCompanies();

    if (notification.link?.url) {
      const { url, data = {}, authToken } = notification.link;
      console.log('查詢職缺條件', data);

      try {
        const pubbedJobData = await fetchPubbedJobData(url, { authToken, data });
        displayJobList(
          pubbedJobData,
          { subscribedJobIds, subscribedCompanyNames },
          token,
          job_plugin_id,
          notification,
        );
      } catch (error) {
        handleFetchError();
      }
    }
  }

  async function openJobInfo(notification) {
    const job = notification.link.data.data; // 命名可能要改過
    console.log(job);

    const jobListElement = document.getElementById('job-list');
    jobListElement.innerHTML = '';

    const jobItem = createJobItem(job, 1, [], [], token, job_plugin_id, notification);
    jobListElement.appendChild(jobItem);
    handleJobItemReadStatus(jobItem, job.job_id);
  }

  return {
    openJobInfo,
    openJobs,
  };
}

function getDomElement() {
  const sideBarContainer = document.getElementById('side-bar-container');

  const pluginHtml = ` <div class="job-plugin-container" id="job-plugin-container">
            <h2>Job SideBar</h2>
            <button id="toggle-subscribe-form">訂閱職缺條件</button>
            <div class="subscribe-form" id="subscribe-form" style="display: none;">
                <h3>篩選條件</h3>
                <label for="industries">行業:</label> 
                <input type="text" id="industries" placeholder="輸入行業名稱">
                <br>
                <label for="job_info">職位資訊:</label>
                <input type="text" id="job_info" placeholder="輸入職位關鍵詞，用逗號或空格分隔" size="50">
                <br>
                <h3>排除條件</h3>
                <label for="job_info">職位名稱:</label>
                <input type="text" id="exclude_job_title" placeholder="輸入職位關鍵詞，用逗號或空格分隔" size="50">
                <button id="subscribe-button">訂閱</button>
            </div>
            <div class="job-list-container" id="job-list-container">
                <div id="job-list"></div>
            </div>
        </div>`;

  sideBarContainer.innerHTML += pluginHtml;

  return {
    jobPluginContainer: document.getElementById('job-plugin-container'),
    toggleSubscribeFormButton: document.getElementById('toggle-subscribe-form'),
    subscribeForm: document.getElementById('subscribe-form'),
  };
}

// 用單例避免多次添加監聽器，不然就要有remove機制
let instance;
export function setupEventListeners(token, job_plugin_id) {
  // JOB 訂閱模組
  if (instance) {
    return instance; // 返回已經初始化過的實例，不會有後續處理
  }
  const {
    jobPluginContainer, toggleSubscribeFormButton, subscribeForm,
  } = getDomElement(); // 不是純函數

  subscribeForm.style.display = 'none';

  toggleSubscribeFormButton.addEventListener('click', () => {
    if (subscribeForm.style.display === 'none' || subscribeForm.style.display === '') {
      subscribeForm.style.display = 'block';
      fetchSubscribedConditions(token, job_plugin_id);
    } else {
      subscribeForm.style.display = 'none';
    }
  });

  document.getElementById('subscribe-button').addEventListener('click', () => {
    function processInputString(input) {
      return input
        .split(/[\s,]+/) // 使用正則表達式拆分字串
        .filter((item) => item.trim() !== '') // 過濾掉空白或空的項目
        .map((item) => item.replace(/^["']|["']$/g, '')); // 去除前後的單引號或雙引號
    }

    const industries = processInputString(document.getElementById('industries').value);
    const job_info = processInputString(document.getElementById('job_info').value);
    const exclude_job_title = processInputString(document.getElementById('exclude_job_title').value);

    const subscriptionData = {
      type: 1,
      data: {
        sub: {
          industries,
          job_info,
        },
        exclude: {
          exclude_job_title,
        },
      },
    };

    fetch(`api/plugins/${job_plugin_id}/routine_sub`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(subscriptionData),
    })
      .then((response) => response.json())
      .then((data) => {
        alert('訂閱成功！');
        console.log(data);
      })
      .catch((error) => {
        console.error('訂閱時發生錯誤:', error);
      });

    fetchSubscribedJobsAndCompanies(token, job_plugin_id);
  });

  instance = { pluginSideBarContainer: jobPluginContainer };// TODO 一起匯出還是分開

  return instance;
}
