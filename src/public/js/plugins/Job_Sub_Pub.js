import formatDate from '../dateUtils.js';

// API另外隔開，但是因為這是插件所以可以寫死？
async function fetchSubscriptionData(token, job_plugin_id) {
  // Fetch current subscription data
  try {
    const response = await fetch(`api/plugins/${job_plugin_id}/jobSubInfo`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();

    // Populate form with the fetched data
    console.log(data);
    if (data) {
      document.getElementById('industries').value = data.industries.join(', ');
      document.getElementById('job_info').value = data.job_info.join(', ');
    }
  } catch (error) { console.error('獲取訂閱數據時發生錯誤:', error); }
}
// 將 fetch 請求包裝成函式，並將結果存入 localStorage
function fetchJobPluginSubInfo(token, job_plugin_id) {
  return fetch(`api/plugins/${job_plugin_id}/subInfo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json()) // 解析回應為 JSON
    .then((data) => {
      // 將結果存入 localStorage
      localStorage.setItem('pluginSubInfo', JSON.stringify(data));
      // console.log('成功存入 localStorage:', data);
    })
    .catch((error) => {
      console.error('顯示時發生錯誤:', error);
    });
}

async function subscribeToJob(token, job_plugin_id, job_ids, company_names, type) {
  // 發送訂閱請求(第三方api)
  // await fetchJobPluginSubInfo(job_plugin_id,token)
  await fetch(`api/plugins/${job_plugin_id}/instant_sub`, { // （由前端發送可能不太好，外掛ID會洩漏）
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      type,
      data: {
        sub: {
          job_ids, // Include job IDs here
          company_names, // Include company names here
        },
      },
    }),
  })
    .then((response) => response.json())
    .catch((error) => console.error('訂閱職位時發生錯誤:', error));
  await fetchJobPluginSubInfo(token, job_plugin_id);
}

// 為了方便輸出載入
export function initializePlugin(token, job_plugin_id) {
  // JOB查看模組
  async function openJobs(notifications, notificationId) {
    // console.log(123);
    // 查找通知對象
    const notification = notifications.find((n) => n.notification_id === notificationId);
    // 可能需要加入type區隔不同通知操作（即時通知、定時通知、系統通知）
    // 如果有 link 屬性，根據 url 和 data 發送 API 請求

    // 從 localStorage 中提取已訂閱的 job_ids 和 company_names
    let subscribedJobIds = [];
    let subscribedCompanyNames = [];

    const pluginSubInfo = localStorage.getItem('pluginSubInfo');

    // 檢查是否有有效數據
    if (pluginSubInfo) {
      // 解析 JSON
      const parsedPluginSubInfo = JSON.parse(pluginSubInfo);

      // 提取 job_ids 和 company_names
      subscribedJobIds = parsedPluginSubInfo.job_ids || [];
      subscribedCompanyNames = parsedPluginSubInfo.company_names || [];

      // console.log(subscribedJobIds,subscribedCompanyNames);
    } else {
      console.error('localStorage 中沒有找到 pluginSubInfo 或數據無效');
    }

    if (notification.link && notification.link.url) {
      const { url } = notification.link;
      const data = notification.link.data || {};
      const { authToken } = notification.link;
      // console.log(url);
      console.log('查詢職缺條件', data);

      // 可能需要透過後端前處理結合有訂閱的網站或公司清單（由前端發送可能不太好，外掛ID會洩漏）
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ authToken, data }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('查詢職缺詳細資料', data.result); // 修正變數名
          data = data.result;
          if (data.items.length === 0) {
            throw new Error('no data');
          }
          const jobListElement = document.getElementById('job-list');
          jobListElement.innerHTML = '';

          // Sort jobs by update_date
          data.items.sort((a, b) => new Date(b.update_date) - new Date(a.update_date));

          data.items.forEach((job, index) => {
            const jobItem = document.createElement('div');
            jobItem.className = 'job-item';

            const jobNumber = document.createElement('div');
            jobNumber.className = 'job-number';
            jobNumber.textContent = `#${index + 1}`; // 顯示編號，index 從 0 開始，因此加 1

            const title = document.createElement('a');
            title.className = 'job-title';
            title.textContent = job.job_title;
            title.href = job.job_link;
            title.target = '_blank'; // 讓鏈接在新窗口打開

            // 還是要用job_id暫存？用localstorage?

            // 檢查已讀的 job_id
            function isJobRead(job_id) {
              const readJobs = JSON.parse(localStorage.getItem('readJobs')) || [];
              return readJobs.includes(job_id);
            }

            // 標記 job_id 為已讀
            function markJobAsRead(job_id) {
              const readJobs = JSON.parse(localStorage.getItem('readJobs')) || [];
              if (!readJobs.includes(job_id)) {
                readJobs.push(job_id);
                localStorage.setItem('readJobs', JSON.stringify(readJobs));
              }
            }
            if (isJobRead(job.job_id)) {
              // jobItem.style.backgroundColor = '#e0e0e0'; // 灰底
              jobItem.classList.add('read'); // 添加 "read" class 來改變背景顏色
            }

            title.addEventListener('click', () => {
              // jobItem.classList.add('read'); // 添加 "read" class 來改變背景顏色
              markJobAsRead(job.job_id);
              // jobItem.style.backgroundColor = '#e0e0e0';
              jobItem.classList.add('read'); // 添加 "read" class 來改變背景顏色
            });

            const subscribeButtonTitle = document.createElement('button');
            subscribeButtonTitle.className = 'subscribe-button';
            subscribeButtonTitle.textContent = '訂閱職缺';
            subscribeButtonTitle.className = 'subscribe-button';
            const isJobSubscribed = subscribedJobIds.includes(job.job_id);
            subscribeButtonTitle.textContent = isJobSubscribed ? '已訂閱' : '訂閱職缺';
            // subscribeButtonTitle.disabled = isJobSubscribed; // 已訂閱的職缺禁用按鈕
            subscribeButtonTitle.addEventListener('click', async () => {
              const job_ids = [job.job_id];
              const company_names = [];
              if (isJobSubscribed) {
                await subscribeToJob(token, job_plugin_id, job_ids, company_names, 2);
              } else {
                await subscribeToJob(token, job_plugin_id, job_ids, company_names, 1);
              }
              await openJobs(notifications, notificationId);
              // await openJobs(notification.notification_id);
            });

            jobItem.appendChild(jobNumber);
            jobItem.appendChild(title);
            jobItem.appendChild(subscribeButtonTitle);

            // 公司名稱
            const company = document.createElement('div');
            company.className = 'job-company';
            company.textContent = job.company_name;
            const subscribeButtonCompany = document.createElement('button');
            subscribeButtonCompany.className = 'subscribe-button';
            const isCompanySubscribed = subscribedCompanyNames.includes(job.company_name);
            subscribeButtonCompany.textContent = isCompanySubscribed ? '已訂閱' : '訂閱公司';
            // subscribeButtonCompany.disabled = isCompanySubscribed; // 已訂閱的公司禁用按鈕
            subscribeButtonCompany.addEventListener('click', async () => {
              const company_names = [job.company_name];
              const job_ids = [];
              // await subscribeToJob(job_ids, company_names);
              if (isCompanySubscribed) {
                // 如果已訂閱，調用取消訂閱 API
                await subscribeToJob(token, job_plugin_id, job_ids, company_names, 2);
                // 這裡可以添加代碼來更新 UI 或處理取消訂閱的結果
              } else {
                // 如果未訂閱，調用訂閱 API
                await subscribeToJob(token, job_plugin_id, job_ids, company_names, 1);
                // 這裡可以添加代碼來更新 UI 或處理訂閱的結果
              }
              await openJobs(notifications, notificationId);
            });

            company.appendChild(subscribeButtonCompany);
            jobItem.appendChild(company);

            // 職位描述
            const desc = document.createElement('div');
            desc.className = 'job-desc';
            const truncatedDesc = job.job_desc.length > 100 ? `${job.job_desc.substring(0, 100)}...` : job.job_desc;
            desc.textContent = truncatedDesc;

            // 更新日期
            const updateDate = document.createElement('div');
            updateDate.className = 'job-date';
            updateDate.textContent = `更新日期: ${formatDate(job.update_date)}`;

            // 來源
            const source = document.createElement('div');
            source.className = 'job-source';
            source.textContent = `來源: ${job.source}`;

            // 職位資訊
            const jobInfo = document.createElement('div');
            jobInfo.className = 'job-info';
            jobInfo.textContent = `職位資訊: ${job.job_info}`;

            // 將所有內容加入 jobItem
            jobItem.appendChild(company);
            jobItem.appendChild(desc);
            jobItem.appendChild(updateDate);
            jobItem.appendChild(source);
            jobItem.appendChild(jobInfo);

            // 將 jobItem 加入 jobListElement
            jobListElement.appendChild(jobItem);
          });
          const infoText = document.createElement('div');
          infoText.className = 'info-text'; // 添加樣式類名
          // infoText.textContent = '是否希望查看所有非今日更新結果？（查找所有後暫存然後filter今日後呈現）';

          jobListElement.appendChild(infoText);
        })
        .catch(() => {
          const jobListElement = document.getElementById('job-list');
          jobListElement.innerHTML = '消息過期或無最新職缺';
          // jobListElement.innerHTML = '消息過期或無最新職缺，是否需要開放全局查詢並緩存結果？<br>而不應該直接傳結果暫存傳輸壓力太大<br>這裡的資料算是靜態資料，而且jwt不讓查';
          // console.error('消息過期或無最新職缺，是否需要開放全局查詢並緩存結果？而不應該直接傳結果暫存傳輸壓力太大');
        });
      // .catch((error) => console.error('獲取職位資訊時發生錯誤:', error));
    }
  }

  async function openJobInfo(notifications, notificationId) {
    const notification = notifications.find((n) => n.notification_id === notificationId);
    const job = notification.link.data.data;// 命名可能要改過
    console.log(job); // 修正變數名

    const jobListElement = document.getElementById('job-list');
    jobListElement.innerHTML = '';

    const jobItem = document.createElement('div');
    jobItem.className = 'job-item';

    const title = document.createElement('a');
    title.className = 'job-title';
    title.textContent = job.job_title;
    title.href = job.job_link;
    title.target = '_blank'; // 讓鏈接在新窗口打開
    const subscribeButtonTitle = document.createElement('button');
    subscribeButtonTitle.className = 'subscribe-button';
    subscribeButtonTitle.textContent = '訂閱職缺';
    subscribeButtonTitle.addEventListener('click', async () => {
      const job_ids = [job.job_id];
      console.log(job.job_id);
      const company_names = [];
      await subscribeToJob(token, job_plugin_id, job_ids, company_names);
      await openJobs(notification.notification_id, notification);
    });

    jobItem.appendChild(title);
    jobItem.appendChild(subscribeButtonTitle);

    // 公司名稱
    const company = document.createElement('div');
    company.className = 'job-company';
    company.textContent = job.company_name;

    const subscribeButtonCompany = document.createElement('button');
    subscribeButtonCompany.className = 'subscribe-button';
    subscribeButtonCompany.textContent = '訂閱公司';
    subscribeButtonCompany.addEventListener('click', async () => {
      const company_names = [job.company_name];
      const job_ids = []; // 或者設置你希望的默認值
      await subscribeToJob(token, job_plugin_id, job_ids, company_names);
      await openJobs(notificationId);
    });

    company.appendChild(subscribeButtonCompany);
    jobItem.appendChild(company);

    // 職位描述
    const desc = document.createElement('div');
    desc.className = 'job-desc';
    const truncatedDesc = job.job_desc.length > 100 ? `${job.job_desc.substring(0, 100)}...` : job.job_desc;
    desc.textContent = truncatedDesc;

    // 更新日期
    const updateDate = document.createElement('div');
    updateDate.className = 'job-date';
    updateDate.textContent = `更新日期: ${formatDate(job.update_date)}`;

    // 來源
    const source = document.createElement('div');
    source.className = 'job-source';
    source.textContent = `來源: ${job.source}`;

    // 職位資訊
    const jobInfo = document.createElement('div');
    jobInfo.className = 'job-info';
    jobInfo.textContent = `職位資訊: ${job.job_info}`;

    // 將所有內容加入 jobItem
    jobItem.appendChild(company);
    jobItem.appendChild(desc);
    jobItem.appendChild(updateDate);
    jobItem.appendChild(source);
    jobItem.appendChild(jobInfo);

    // 將 jobItem 加入 jobListElement
    jobListElement.appendChild(jobItem);
  }

  return {
    openJobInfo, openJobs,
  };
}

function getDomElement() {
  const sideBarContainer = document.getElementById('side-bar-container');

  const pluginHtml = ` <div class="job-plugin-container" id="job-plugin-container">
            <h2>Job SideBar</h2>
            <button id="toggle-subscribe-form">訂閱職缺條件</button>
            <!-- TODO 加入下拉選單  -->
            <div class="subscribe-form" id="subscribe-form" style="display: none;">
                <label for="industries">行業:</label> 
                <input type="text" id="industries" placeholder="輸入行業名稱">
                <br>
                <label for="job_info">職位資訊:</label>
                <input type="text" id="job_info" placeholder="輸入職位關鍵詞，用逗號或空格分隔" size="50">
                <br>
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

  // 移除後按鈕沒反應
  toggleSubscribeFormButton.addEventListener('click', () => {
    console.log(123);
    if (subscribeForm.style.display === 'none' || subscribeForm.style.display === '') {
      subscribeForm.style.display = 'block';
      fetchSubscriptionData(token, job_plugin_id);
    } else {
      subscribeForm.style.display = 'none';
    }
  });

  document.getElementById('subscribe-button').addEventListener('click', () => {
    // TODO 以,空格區分，是否設定字串總長度上限？
    const industries = document.getElementById('industries').value
      .split(/[\s,]+/) // 使用正則表達式拆分字串
      .filter((industry) => industry.trim() !== '') // 過濾掉空的項目
      .map((industry) => industry.replace(/^["']|["']$/g, '')); // 去除前後的單引號或雙引號

    const job_info = document.getElementById('job_info').value
      .split(/[\s,]+/)
      .filter((info) => info.trim() !== '')
      .map((industry) => industry.replace(/^["']|["']$/g, '')); // 去除前後的單引號或雙引號

    const subscriptionData = {
      type: 1,
      data: {
        sub: {
          industries: industries.map((industry) => industry.trim()),
          job_info: job_info.map((info) => info.trim()),
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

    fetchJobPluginSubInfo(token, job_plugin_id);
  });

  instance = { pluginSideBarContainer: jobPluginContainer };// TODO 一起匯出還是分開

  return instance;
}
