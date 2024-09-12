import formatDate from './dateUtils.js';

export default function initializeJobPlugin(token, job_plugin_id) {
  // JOB 訂閱模組
  const jobPluginContainer = document.getElementById('job-plugin-container');
  const toggleSubscribeFormButton = document.getElementById('toggle-subscribe-form');
  const subscribeForm = document.getElementById('subscribe-form');
  subscribeForm.style.display = 'none';

  function fetchSubscriptionData() {
    // Fetch current subscription data
    fetch(`api/plugins/${job_plugin_id}/jobSubInfo`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        // Populate form with the fetched data
        console.log(data);
        if (data) {
          document.getElementById('industries').value = data.industries.join(', ');
          document.getElementById('job_info').value = data.job_info.join(', ');
        }
      })
      .catch((error) => console.error('獲取訂閱數據時發生錯誤:', error));
  }

  toggleSubscribeFormButton.addEventListener('click', () => {
    if (subscribeForm.style.display === 'none' || subscribeForm.style.display === '') {
      subscribeForm.style.display = 'block';
      // this.textContent = '隱藏訂閱表單';
      fetchSubscriptionData();
    } else {
      subscribeForm.style.display = 'none';
      // this.textContent = '顯示訂閱表單';
    }
  });

  // 將 fetch 請求包裝成函式，並將結果存入 localStorage
  function fetchJobPluginSubInfo(job_plugin_id, token) {
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

  // fetchJobPluginSubInfo(job_plugin_id, token);

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

    fetchJobPluginSubInfo(job_plugin_id, token);
  });

  // JOB查看模組
  async function openJobs(notifications, notificationId) {
    // 查找通知對象
    const notification = notifications.find((n) => n.notification_id === notificationId);
    // 可能需要加入type區隔不同通知操作（即時通知、定時通知、系統通知）
    // 如果有 link 屬性，根據 url 和 data 發送 API 請求

    // 從 localStorage 中提取已訂閱的 job_ids 和 company_names
    // console.log(JSON.parse(localStorage.getItem('pluginSubInfo')).job_ids,123)
    let subscribedJobIds = [];
    let subscribedCompanyNames = [];

    // console.log(subscribedJobIds)

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
      console.log('link');
      const { url } = notification.link;
      const data = notification.link.data || {};
      const { authToken } = notification.link;
      console.log(url);
      console.log(data);

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
          console.log(data); // 修正變數名
          const jobListElement = document.getElementById('job-list');
          jobListElement.innerHTML = '';

          // Sort jobs by update_date
          data.items.sort((a, b) => new Date(b.update_date) - new Date(a.update_date));

          data.items.forEach((job) => {
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
            subscribeButtonTitle.className = 'subscribe-button';
            const isJobSubscribed = subscribedJobIds.includes(job.job_id);
            subscribeButtonTitle.textContent = isJobSubscribed ? '已訂閱' : '訂閱職缺';
            // subscribeButtonTitle.disabled = isJobSubscribed; // 已訂閱的職缺禁用按鈕
            subscribeButtonTitle.addEventListener('click', async () => {
              const job_ids = [job.job_id];
              const company_names = [];
              if (isJobSubscribed) {
                await subscribeToJob(job_ids, company_names, 2);
              } else {
                await subscribeToJob(job_ids, company_names, 1);
              }
              await openJobs(notifications, notificationId);
              // await openJobs(notification.notification_id);
            });

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
                await subscribeToJob(job_ids, company_names, 2);
                // 這裡可以添加代碼來更新 UI 或處理取消訂閱的結果
              } else {
                // 如果未訂閱，調用訂閱 API
                await subscribeToJob(job_ids, company_names, 1);
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
        })
        .catch((error) => console.error('獲取職位資訊時發生錯誤:', error));
    }
  }

  async function subscribeToJob(job_ids, company_names, type) {
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
      // .then(data => {
      //     // alert(`已訂閱成功`);
      // })
      .catch((error) => console.error('訂閱職位時發生錯誤:', error));
    await fetchJobPluginSubInfo(job_plugin_id, token);
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
      await subscribeToJob(job_ids, company_names);
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
      await subscribeToJob(job_ids, company_names);
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
    openJobInfo, openJobs, pluginSideBarContainer: jobPluginContainer,
  };
}
