import formatDate from '../dateUtils.js';

// API

// 職缺資料操作
const fetchTodayPublishedJobsFromProxy = async (url, subscribedConditionInfo) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscribedConditionInfo),
  });

  const data = await response.json();
  if (!data.result || data.result.items.length === 0) {
    throw new Error('no data');
  }

  return data.result;
};

// 訂閱資料操作
const fetchSubscribedJobCriteriaFromProxy = async ({ token, plugin_id }) => {
  try {
    const response = await fetch(`api/plugins/${plugin_id}/getSubConditions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        method: 'GET',
      }),
    });
    const data = await response.json();

    console.log(data);
    if (data) {
      document.getElementById('industries').value = data.industries.join(', ');
      document.getElementById('job_info').value = data.job_info.join(', ');
      document.getElementById('exclude_job_title').value = data.exclude_job_title.join(', ');
    }
  } catch (error) { console.error('獲取訂閱數據時發生錯誤:', error); }
};

const subscribedJobCriteriaFromProxy = async ({ token, plugin_id }, subscriptionData) => {
  try {
    const response = await fetch(`api/plugins/${plugin_id}/subConditions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        method: 'POST',
        data: subscriptionData,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json(); // 解析回應為 JSON
  } catch (error) {
    console.error('訂閱時發生錯誤:', error);
    throw error; // 重新拋出錯誤以便於上層調用捕捉
  }
};

const fetchSubscribedEntitiesFromProxy = async ({ token, plugin_id }) => {
  try {
    const response = await fetch(`api/plugins/${plugin_id}/getSubEntities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        method: 'GET',
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json(); // 解析回應為 JSON
    localStorage.setItem('subscribedEntities', JSON.stringify(result.data.subscriptions));
  } catch (error) {
    console.error('顯示時發生錯誤:', error);
  }
};

const updateSubscribeJobFromProxy = async ({ token, plugin_id }, jobId, method) => {
  try {
    const response = await fetch(`api/plugins/${plugin_id}/subbedJob`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        method,
        data: { job_id: jobId },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json(); // 解析回應為 JSON
    console.log('訂閱職位成功:', data); // 可以在這裡處理成功訂閱的回應

    await fetchSubscribedEntitiesFromProxy({ token, plugin_id }); // 獲取已訂閱的職位和公司
  } catch (error) {
    console.error('訂閱職位時發生錯誤:', error);
  }
};
const updateSubscribeCompanyFromProxy = async ({ token, plugin_id }, companyName, method) => {
  console.log({ token, plugin_id });
  try {
    const response = await fetch(`api/plugins/${plugin_id}/subbedCompany`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        method,
        data: { company_name: companyName },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json(); // 解析回應為 JSON
    console.log('訂閱職位成功:', data); // 可以在這裡處理成功訂閱的回應

    await fetchSubscribedEntitiesFromProxy({ token, plugin_id }); // 獲取已訂閱的職位和公司
  } catch (error) {
    console.error('訂閱職位時發生錯誤:', error);
  }
};

const getSubscribedEntities = () => {
  const subscribedEntitiesString = localStorage.getItem('subscribedEntities');
  let subscribedJobIds = [];
  let subscribedCompanyNames = [];

  if (subscribedEntitiesString) {
    try {
      const { job_ids = [], company_names = [] } = JSON.parse(subscribedEntitiesString);
      subscribedJobIds = job_ids || [];
      subscribedCompanyNames = company_names || [];
    } catch (error) {
      console.error('解析 JSON 時出錯:', error);
    }
  } else {
    console.error('localStorage 中沒有找到 subscribedEntities 或數據無效');
  }
  const subscribedEntities = { subscribedJobIds, subscribedCompanyNames };
  return subscribedEntities;
};

// 已讀相關操作

const getReadJobs = () => JSON.parse(localStorage.getItem('readJobs')) || [];

const isJobRead = (jobId) => {
  const readJobs = getReadJobs();
  return readJobs.includes(jobId);
};

const markJobAsRead = (jobId) => {
  const readJobs = getReadJobs();
  if (!readJobs.includes(jobId)) {
    readJobs.push(jobId);
    localStorage.setItem('readJobs', JSON.stringify(readJobs));
  }
};

// UI

const createJobExperienceElement = (jobExperience) => {
  const jobExperienceElement = document.createElement('div');
  jobExperienceElement.className = 'job_exp';
  jobExperienceElement.textContent = `年資要求: ${jobExperience}`;
  return jobExperienceElement;
};

const createJobDescriptionElement = (description) => {
  const jobDescriptionElement = document.createElement('div');
  jobDescriptionElement.className = 'job-desc';
  jobDescriptionElement.textContent = description.length > 100 ? `${description.substring(0, 100)}...` : description;
  return jobDescriptionElement;
};

const createJobUpdateDateElement = (updateDate) => {
  const dateElement = document.createElement('div');
  dateElement.className = 'job-date';
  dateElement.textContent = `更新日期: ${formatDate(updateDate)}`;
  return dateElement;
};

const createJobSourceElement = (source) => {
  const sourceElement = document.createElement('div');
  sourceElement.className = 'job-source';
  sourceElement.textContent = `來源: ${source}`;
  return sourceElement;
};

const createJobInfoElement = (info) => {
  const infoElement = document.createElement('div');
  infoElement.className = 'job-info';
  infoElement.textContent = `職位資訊: ${info}`;
  return infoElement;
};

const handleFetchError = () => {
  const jobListElement = document.getElementById('job-list');
  jobListElement.innerHTML = '消息過期或無最新職缺';
};

const handleJobItemReadStatus = (jobItem, jobId) => {
  if (isJobRead(jobId)) {
    jobItem.classList.add('read');
  }

  const jobTitleElement = jobItem.querySelector('.job-title');
  jobTitleElement.addEventListener('click', () => {
    markJobAsRead(jobId);
    jobItem.classList.add('read');
  });
};

const createSubscribeJobButton = (
  updateSubscribeJobFromProxy,
  subscribedEntity,
  subscribedEntities,
  { token, plugin_id },
  { openJobs, notification },
) => {
  const button = document.createElement('button');
  button.className = 'subscribe-button';
  const isSubscribed = subscribedEntities.includes(String(subscribedEntity));
  button.textContent = isSubscribed ? '已訂閱' : '訂閱職缺';

  button.addEventListener('click', async () => {
    const action = isSubscribed ? 'DELETE' : 'POST'; // 1: 訂閱, 2: 取消訂閱
    await updateSubscribeJobFromProxy(
      { token, plugin_id },
      subscribedEntity,
      action,
    );
    await openJobs(notification);
  });

  return button;
};

const createSubscribeCompanyButton = (
  updateSubscribeCompanyFromProxy,
  subscribedEntity,
  subscribedEntities,
  { token, plugin_id },
  { openJobs, notification },
) => {
  const button = document.createElement('button');
  button.className = 'subscribe-button';
  const isSubscribed = subscribedEntities.includes(String(subscribedEntity));
  button.textContent = isSubscribed ? '已訂閱' : '訂閱公司';

  button.addEventListener('click', async () => {
    const action = isSubscribed ? 'DELETE' : 'POST'; // 1: 訂閱, 2: 取消訂閱
    await updateSubscribeCompanyFromProxy(
      { token, plugin_id },
      subscribedEntity,
      action,
    );

    await openJobs(notification);
  });

  return button;
};

// 創建內容包含有監聽器的按鈕
const createJobItem = (
  job,
  indexOfItem,
  { subscribedJobIds, subscribedCompanyNames },
  { token, plugin_id },
  { openJobs, notification },
) => {
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

  const subscribeButtonTitle = createSubscribeJobButton(
    updateSubscribeJobFromProxy,
    job.job_id,
    subscribedJobIds,
    { token, plugin_id },
    { openJobs, notification },
  );

  const createCompanyElement = (
    companyName,
    subscribedCompanyNames,
    { token, plugin_id },
    notification,
  ) => {
    const companyElement = document.createElement('div');
    companyElement.className = 'job-company';
    companyElement.textContent = companyName;

    const subscribeButtonCompany = createSubscribeCompanyButton(
      updateSubscribeCompanyFromProxy,
      companyName,
      subscribedCompanyNames,
      { token, plugin_id },
      { openJobs, notification },
    );

    companyElement.appendChild(subscribeButtonCompany);
    return companyElement;
  };

  const companyElement = createCompanyElement(
    job.company_name,
    subscribedCompanyNames,
    { token, plugin_id },
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
};

/**
*額外渲染上下一頁按鈕，需要傳遞查詢API以及Page資訊
*/
const displayJobList = (
  url,
  { authToken, data },
  jobData,
  { subscribedJobIds, subscribedCompanyNames },
  { token, plugin_id },
  { openJobs, notification },
  page = 1,
) => {
  const jobListElement = document.getElementById('job-list');// 注意可以考慮抽離（html已有job-list EL）
  jobListElement.innerHTML = '';

  const sortedJobData = jobData.items.sort(
    (a, b) => new Date(b.update_date) - new Date(a.update_date),
  );

  const limit = 50;
  const modifyIndexs = (page - 1) * limit;
  sortedJobData.forEach((job, index) => {
    const jobItem = createJobItem(
      job,
      index + 1 + modifyIndexs,
      { subscribedJobIds, subscribedCompanyNames },
      { token, plugin_id },
      { openJobs, notification },
    );
    jobListElement.appendChild(jobItem);
    handleJobItemReadStatus(jobItem, job.job_id);
  });

  const infoText = document.createElement('div');
  infoText.className = 'info-text';
  jobListElement.appendChild(infoText);

  renderPaginationControls(
    jobListElement,
    url,
    { authToken, data },
    jobData,
    { token, plugin_id },
    { openJobs, notification },
  );
};

/**
 * 切換頁數並重新載入資料
 */
const changePage = async (
  url,
  { authToken, data },
  newPage,
  { token, plugin_id },
  { openJobs, notification },
) => {
  const currentPage = newPage;
  const { subscribedJobIds, subscribedCompanyNames } = getSubscribedEntities();
  try {
    const jobData = await fetchTodayPublishedJobsFromProxy(
      url,
      { authToken, data, page: currentPage },
    );
    displayJobList(
      url,
      { authToken, data },
      jobData,
      { subscribedJobIds, subscribedCompanyNames },
      { token, plugin_id },
      { openJobs, notification },
      currentPage,
    );
  } catch (error) {
    console.error('Failed to fetch job data:', error);
  }
};

/**
 * 渲染分頁按鈕（上一頁/下一頁）
 */
const renderPaginationControls = (
  parentElement,
  url,
  { authToken, data },
  jobData,
  { token, plugin_id },
  { openJobs, notification },
) => {
  const paginationContainer = document.createElement('div');
  paginationContainer.className = 'pagination-controls';

  const prevButton = document.createElement('button');
  prevButton.textContent = '上一頁';
  prevButton.disabled = jobData.currentPage === 1;
  prevButton.addEventListener('click', () => changePage(
    url,
    { authToken, data },
    jobData.currentPage - 1,
    { token, plugin_id },
    { openJobs, notification },
  ));

  const nextButton = document.createElement('button');
  nextButton.textContent = '下一頁';
  nextButton.disabled = jobData.currentPage === jobData.totalPages;
  nextButton.addEventListener('click', () => changePage(
    url,
    { authToken, data },
    jobData.currentPage + 1,
    { token, plugin_id },
    { openJobs, notification },
  ));

  if (jobData.currentPage > 1) paginationContainer.appendChild(prevButton);
  if (jobData.currentPage < jobData.updateItemsPages) paginationContainer.appendChild(nextButton);
  parentElement.appendChild(paginationContainer);
};

// 封裝輸出讓plugin動態讀取
export const initializePlugin = ({ token, plugin_id }) => {
  // 開啟已定時推播符合條件之職缺清單
  const openJobs = async (notification) => {
    // 從 localStorage 中提取已訂閱的 job_ids 和 company_names
    const { subscribedJobIds, subscribedCompanyNames } = getSubscribedEntities();

    if (notification.link?.url) {
      const { url, data = {}, authToken } = notification.link;
      console.log('查詢職缺條件', data);

      try {
        const pubbedJobData = await fetchTodayPublishedJobsFromProxy(url, { authToken, data });
        displayJobList(
          url,
          { authToken, data },
          pubbedJobData,
          { subscribedJobIds, subscribedCompanyNames },
          { token, plugin_id },
          { openJobs, notification },
        );
      } catch (error) {
        handleFetchError();
      }
    }
  };

  // 開啟已即時推播有更新內容之單一職缺或公司名下有更新的所有職缺
  const openJobsInfo = async (notification) => {
    const job = notification.link.data.data; // 命名可能要改過
    const { subscribedJobIds, subscribedCompanyNames } = getSubscribedEntities();
    const jobListElement = document.getElementById('job-list');
    jobListElement.innerHTML = '';
    const jobItem = createJobItem(job, 1, { subscribedJobIds, subscribedCompanyNames }, { token, plugin_id }, { openJobs, notification });
    jobListElement.appendChild(jobItem);
    handleJobItemReadStatus(jobItem, job.job_id);
  };

  return {
    openJobsInfo,
    openJobs,
  };
};

const createPluginHtml = () => `
    <div class="job-plugin-container" id="job-plugin-container">
      <h2>Job SideBar</h2>
      <button class="toggle-button" id="toggle-subscribe-form">訂閱職缺條件</button>
      <div class="subscribe-form" id="condition-subscribe-form" style="display: none;">
        <h3>篩選條件</h3>
..        <p><small> HINT: 以 , 或 空白鍵 分隔文字。<br>全空白預設無限制。<br>支持模糊匹配不區分大小寫</small></p>
        <label for="industries">行業:</label> 
        <input type="text" id="industries" placeholder="輸入行業名稱">
        <br>
        <label for="job_info">職位資訊（Tech Stack）:</label>
        <input type="text" id="job_info" placeholder="輸入職位關鍵詞，用逗號或空格分隔" size="50">
        <br>
        <h3>排除條件</h3>
        <label for="job_info">職位名稱:</label>
        <input type="text" id="exclude_job_title" placeholder="輸入職位關鍵詞，用逗號或空格分隔" size="50">
        <button id="condition-subscribe-button">訂閱</button>
      </div>
      <button class="toggle-button" id="toggle-fav-jobs">收藏職缺資料</button>
      <button class="toggle-button" id="toggle-job-list">符合的職缺資料</button>
      <div class="job-list-container" id="job-list-container">
        <div id="job-list"></div>
      </div>
    </div>`;

const getDomElement = () => {
  const sideBarContainer = document.getElementById('side-bar-container');
  sideBarContainer.innerHTML += createPluginHtml();

  return {
    jobPluginContainer: document.getElementById('job-plugin-container'),
    toggleSubscribeFormButton: document.getElementById('toggle-subscribe-form'),
    subscribeForm: document.getElementById('condition-subscribe-form'),
    toggleJobListButton: document.getElementById('toggle-job-list'),
    jobListContainer: document.getElementById('job-list-container'),
    conditionSubscribeButton: document.getElementById('condition-subscribe-button'),
    industriesInput: document.getElementById('industries'),
    jobInfoInput: document.getElementById('job_info'),
    excludeJobTitleInput: document.getElementById('exclude_job_title'),
  };
};

// 用單例避免多次添加監聽器，不然就要有remove機制
let instance;
export const setupEventListeners = ({ token, plugin_id }) => {
  // JOB 訂閱模組
  if (instance) {
    return instance; // 返回已經初始化過的實例，不會有後續處理
  }
  const {
    jobPluginContainer,
    toggleSubscribeFormButton,
    subscribeForm,
    toggleJobListButton,
    jobListContainer,
    conditionSubscribeButton,
    industriesInput,
    jobInfoInput,
    excludeJobTitleInput,
  } = getDomElement(); // 不是純函數

  subscribeForm.style.display = 'none';

  jobListContainer.style.display = 'block';

  toggleSubscribeFormButton.addEventListener('click', () => {
    if (subscribeForm.style.display === 'none' || subscribeForm.style.display === '') {
      subscribeForm.style.display = 'block';
      fetchSubscribedJobCriteriaFromProxy({ token, plugin_id });
    } else {
      subscribeForm.style.display = 'none';
    }
  });

  toggleJobListButton.addEventListener('click', () => {
    if (jobListContainer.style.display === 'none' || jobListContainer.style.display === '') {
      jobListContainer.style.display = 'block';
      toggleJobListButton.textContent = '符合的職缺資料';
    } else {
      jobListContainer.style.display = 'none';
      toggleJobListButton.textContent = '符合的職缺資料(隱藏)';
    }
  });

  conditionSubscribeButton.addEventListener('click', async () => {
    const processInputString = (input) => input
      .split(/[\s,]+/) // 使用正則表達式拆分字串
      .filter((item) => item.trim() !== '') // 過濾掉空白或空的項目
      .map((item) => item.replace(/^["']|["']$/g, '')); // 去除前後的單引號或雙引號

    const industries = processInputString(industriesInput.value);
    const job_info = processInputString(jobInfoInput.value);
    const exclude_job_title = processInputString(excludeJobTitleInput.value);

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

    try {
      const data = await subscribedJobCriteriaFromProxy({ token, plugin_id }, subscriptionData);
      alert('訂閱成功！');
      console.log(data);
      // 可以在這裡執行其他後續操作，例如更新 UI
    } catch (error) {
      console.error('訂閱時發生錯誤:', error);
      alert('訂閱失敗，請稍後再試。');
    }
    // 可能可以考量不用每次都fetch
    fetchSubscribedJobCriteriaFromProxy({ token, plugin_id });
  });

  fetchSubscribedEntitiesFromProxy({ token, plugin_id });

  instance = { pluginSideBarContainer: jobPluginContainer };// TODO 一起匯出還是分開

  return instance;
};
