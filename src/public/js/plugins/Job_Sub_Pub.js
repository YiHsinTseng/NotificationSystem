import formatDate from '../dateUtils.js';

//SECTION 插件的API處理層

const upsertJobTagsFromProxy = async ({ token, plugin_id},{ tagNames:tagNames,jobId:jobId }) => {
  const response = await fetch(`api/plugins/${plugin_id}/upsertJobIdTags`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      method: 'POST',
      data: { tagNames:tagNames, jobId:jobId},
    }),
  });

  if (response.ok) {
    try {
      const data = await response.json();
      console.log('Response data:', data);
      alert('修改標籤成功！');
    } catch (error) {
      console.error('Failed to parse response as JSON:', error);
    }
  } else {
    console.error('Failed to send request:', response.statusText);
  }
};

const fetchJobIdTagsFromProxy = async ({ token, plugin_id}, jobId) => {
  const response = await fetch(`api/plugins/${plugin_id}/fetchJobIdTags`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      method: 'GET',
      data: { jobId: jobId },
    }),
  });

  if (response.ok) {
    try {
      const data = await response.json();
      console.log('Response data:', data);
      return data;
    } catch (error) {
      console.error('Failed to parse response as JSON:', error);
    }
  } else {
    console.error('Failed to send request:', response.statusText);
  }
};

//TODO被獨創寫法搞死
const filterJobsByTagsFromProxy = async ({ token, plugin_id}, tagNames) => {
  const response = await fetch(`api/plugins/${plugin_id}/filterJobsByTags`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      method: 'POST',
      data: { tagNames: tagNames },
    }),
  });

  if (response.ok) {
    try {
      const data = await response.json();
      console.log('Response data:', data);
      return data
    } catch (error) {
      console.error('Failed to parse response as JSON:', error);
    }
  } else {
    console.error('Failed to send request:', response.statusText);
  }
};
    
//-- ANCHOR - Tag in Job API
// const upsertJobTagAPI = async (token,tagNames,jobId) => {
//   const url='http://localhost:5050/api/fav/job-tag'
//   console.log(tagNames)
//   tagNames=tagNames.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

//   const response = await fetch(url, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify({ tagNames,jobId })
//   });

//   if (response.ok) {
//     try {
//       const data = await response.json();
//       console.log('Response data:', data);
//       alert('修改標籤成功！');
//     } catch (error) {
//       console.error('Failed to parse response as JSON:', error);
//     }
//   } else {
//     console.error('Failed to send request:', response.statusText);
//   }
// };

// const fetchJobTagAPI = async (token,jobId) => {
//   const url=`http://localhost:5050/api/fav/job-tag/${jobId}`
  
//   const response = await fetch(url, {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${token}`,
//     }
//   });

//   if (response.ok) {
//     try {
//       const data = await response.json();
//       console.log('Response data:', data);
//       return data;
//     } catch (error) {
//       console.error('Failed to parse response as JSON:', error);
//     }
//   } else {
//     console.error('Failed to send request:', response.statusText);
//   }
// };

//-- ANCHOR - Fav/sub Job API
// const postFilterFavJobAPI = async (token,tagNames) => {
//   const url='http://localhost:5050/api/fav/jobs'
//   const response = await fetch(url, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify({tagNames})
//   });

//   if (response.ok) {
//     try {
//       const data = await response.json();
//       console.log('Response data:', data);
//       return data
//     } catch (error) {
//       console.error('Failed to parse response as JSON:', error);
//     }
//   } else {
//     console.error('Failed to send request:', response.statusText);
//   }
// };

//-- ANCHOR -  Pub Job API
// 職缺資料操作
const fetchTodayPublishedJobsFromProxy = async (url, subscribedConditionInfo) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscribedConditionInfo),
  });

  // 記憶頁面避免跳轉
  MemoLastJobPage=subscribedConditionInfo.page

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
      document.getElementById('min_exp').value = data.job_exp_range.minExp;
      document.getElementById('max_exp').value = data.job_exp_range.maxExp;
      document.getElementById('exclude_job_title').value = data.exclude_job_title.join(', ');
    }
  } catch (error) { console.error('獲取訂閱數據時發生錯誤:', error); }
};

//-- ANCHOR - Sub Condition/Entites API
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

const fetchSubscribedJobsFromProxy= async({ token, plugin_id})=>{
  try {
    const response = await fetch(`api/plugins/${plugin_id}/getSubJobs`, {
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
    return result
  } catch (error) {
    console.error('顯示時發生錯誤:', error);
  }
}

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

//!SECTION
//SECTION 插件的狀態管理層
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

//!SECTION
//SECTION 插件的UI層(局部)
//  //SECTION (局部元素創建)

// -- ANCHOR - 局部 Job Item Element(純粹)

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
  infoElement.textContent = `職位資訊: ${info.join(', ')}`;
  return infoElement;
};

const createJobTagsElement = (tags) => {
  const tagsElement = document.createElement('div');
  tagsElement.className = 'job-tags';
  tagsElement.textContent = `自訂標籤:`;
  if(tags){
    tagsElement.textContent = `自訂標籤: ${tags.join(', ')}`;
  }
  return tagsElement;
};

// -- ANCHOR - 局部 Job Item Element(封裝監聽器)

const createSubscribeJobButton = (
  updateSubscribeJobFromProxy,
  subscribedEntity,
  subscribedEntities,
  { token, plugin_id },
  refreshAllJobLists,
) => {
  const button = document.createElement('button');
  button.className = 'subscribe-button';
  const isSubscribed = subscribedEntities.includes(String(subscribedEntity));
  button.textContent = isSubscribed ? '已訂閱' : '訂閱職缺';
  //TODO 已訂閱也要已讀嗎？

  button.addEventListener('click', async () => {
    const action = isSubscribed ? 'DELETE' : 'POST'; // 1: 訂閱, 2: 取消訂閱
    await updateSubscribeJobFromProxy(
      { token, plugin_id },
      subscribedEntity,
      action,
    );
      await refreshAllJobLists();
  });

  return button;
};

const createSubscribeCompanyButton = (
  updateSubscribeCompanyFromProxy,
  subscribedEntity,
  subscribedEntities,
  { token, plugin_id },
  refreshAllJobLists
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
    await refreshAllJobLists();
  });

  return button;
};

// 創建內容包含有監聽器的按鈕
const createJobItem = (
  job,
  indexOfItem,
  { subscribedJobIds, subscribedCompanyNames },
  { token, plugin_id },
  // { openJobs, notification },
  refreshAllJobLists
) => {

  //  console.log("有共同修改方法:",refreshAllJobLists)
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
    // { openJobs, notification },
    refreshAllJobLists
  );

  const createCompanyElement = (
    companyName,
    subscribedCompanyNames,
    { token, plugin_id },
    refreshAllJobLists
  ) => {
    const companyElement = document.createElement('div');
    companyElement.className = 'job-company';
    companyElement.textContent = companyName;

    const subscribeButtonCompany = createSubscribeCompanyButton(
      updateSubscribeCompanyFromProxy,
      companyName,
      subscribedCompanyNames,
      { token, plugin_id },
      refreshAllJobLists
    );

    companyElement.appendChild(subscribeButtonCompany);
    return companyElement;
  };

  const companyElement = createCompanyElement(
    job.company_name,
    subscribedCompanyNames,
    { token, plugin_id },
    refreshAllJobLists
  );

  const jobExperienceElement = createJobExperienceElement(job.job_exp);
  const jobDescriptionElement = createJobDescriptionElement(job.job_desc);
  const updateDate = createJobUpdateDateElement(job.update_date);
  const source = createJobSourceElement(job.source);
  const jobInfoElement = createJobInfoElement(job.job_info);
  const jobTagsElement = createJobTagsElement(job.job_tags);

  const readButton = document.createElement('button');
  readButton.className = 'read-button';
  readButton.textContent = '已讀';

  const tagButton = document.createElement('button');
  tagButton.className = 'tag-button';
  tagButton.textContent = '標記';

  // const saveButton = document.createElement('button');
  // saveButton.className = 'save-button';
  // saveButton.textContent = '最愛';

  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'button-container';


  //這個函式再創造階段影響自己
  tagButton.addEventListener('click', async() => {
    //TODO 思考回傳資料階層格式，重新整理函式，目前還是考慮有messsage嗎？
    // const olddata=await fetchJobTagAPI(token,job.job_id);
    const olddata=await fetchJobIdTagsFromProxy({token,plugin_id},job.job_id);
    const oldTagList=olddata.data
    const oldtag=oldTagList.join(', ');
    const tags= prompt('請輸入篩選標籤（用逗號分隔）：',oldtag);
    console.log(tags)
    if(tags!=null){
      const tagNamesList = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
      console.log("job id-"+job.job_id+"加入標籤:"+tags)
      // await upsertJobTagAPI(token,tags,job.job_id)
      await upsertJobTagsFromProxy({token,plugin_id},{tagNames:tagNamesList,jobId:job.job_id})
      // const data=await fetchJobTagAPI(token,job.job_id);
      const data=await fetchJobIdTagsFromProxy({token,plugin_id},job.job_id);
      //局部重新絢染
      const newtagList=data.data
      const newtag=newtagList.join(', ');
      jobTagsElement.textContent=`自訂標籤: ${newtag}`
      refreshAllJobLists()
    }
  });

  readButton.addEventListener('click', () => {
    markJobAsRead(job.job_id);
    jobItem.classList.add('read');
  });
  // buttonContainer.appendChild(saveButton);
  buttonContainer.appendChild(readButton);
  buttonContainer.appendChild(tagButton);

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
    jobTagsElement
  );
  return jobItem;
};

// //!SECTION
// //SECTION (操作邏輯)

//-- ANCHOR - ITEM UI 操作
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

const handleFetchError = () => {
  const jobListElement = document.getElementById('job-list');
  jobListElement.innerHTML = '消息過期或無最新職缺';
};


//-- ANCHOR - List UI 操作
/**
*額外渲染上下一頁按鈕，需要傳遞查詢API以及Page資訊
*/
//像這樣批量渲染是不是效能比較不好
// 意思是說我要另外有一個方法找到特定tree下的節點單獨渲染
const displayJobList = (
  url,
  { authToken, data },
  jobData,
  { subscribedJobIds, subscribedCompanyNames },
  { token, plugin_id },
  refreshAllJobLists,
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
      refreshAllJobLists
    );
    jobListElement.appendChild(jobItem);
    handleJobItemReadStatus(jobItem, job.job_id);
  });

  const infoText = document.createElement('div');
  infoText.className = 'info-text';
  jobListElement.appendChild(infoText);

  //暫時這樣處理，之後再修改
  const tagButtons = jobListElement.querySelectorAll('.button-container .tag-button');
  tagButtons.forEach(tagButton => {
      tagButton.style.display = 'none';
  });

  renderPaginationControls(
    jobListElement,
    url,
    { authToken, data },
    jobData,
    { token, plugin_id },
    refreshAllJobLists
  );
};

//借用displayJobList 
const displayFavJobList = (
  jobData,
  { subscribedJobIds, subscribedCompanyNames },
  { token, plugin_id },
  refreshAllJobLists
) => {
  const FavJobListElement = document.getElementById('fav-job-list');// 注意可以考慮抽離（html已有job-list EL）
  FavJobListElement.innerHTML = '';

  const sortedJobData =  jobData.data.sort(
    (a, b) => new Date(b.update_date) - new Date(a.update_date),
  );

  sortedJobData.forEach((job, index) => {
  //共用 createJobItem 函式
    const jobItem = createJobItem (
      job,
      index + 1,
      { subscribedJobIds, subscribedCompanyNames },
      { token, plugin_id },
      refreshAllJobLists
    );
    FavJobListElement.appendChild(jobItem);
    handleJobItemReadStatus(jobItem, job.job_id);
  });

  const infoText = document.createElement('div');
  infoText.className = 'info-text';
  FavJobListElement.appendChild(infoText);

  // renderPaginationControls(
  //   jobListElement,
  //   url,
  //   { authToken},
  //   jobData,
  //   { token, plugin_id },
  //   { openJobs},
  // );
};

/**
 * 切換頁數並重新載入資料
 */
const changePage = async (
  url,
  { authToken, data },
  newPage,
  { token, plugin_id },
  refreshAllJobLists
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
      refreshAllJobLists,
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
  refreshAllJobLists
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
    refreshAllJobLists
  ));

  const nextButton = document.createElement('button');
  nextButton.textContent = '下一頁';
  nextButton.disabled = jobData.currentPage === jobData.totalPages;
  nextButton.addEventListener('click', () => changePage(
    url,
    { authToken, data },
    jobData.currentPage + 1,
    { token, plugin_id },
    refreshAllJobLists
  ));

  if (jobData.currentPage > 1) paginationContainer.appendChild(prevButton);
  if (jobData.currentPage < jobData.updateItemsPages) paginationContainer.appendChild(nextButton);
  parentElement.appendChild(paginationContainer);
};

//  //!SECTION
//!SECTION

//SECTION - 插件的業務邏輯層(封裝輸出利於讀取)
// 封裝輸出讓plugin動態讀取

let currentFunction = null;  // 用來記錄當前觸發的函式名稱
//因為共用container所以要狀態管理
let currentNotification = null;
let currentInfoNotification = null;
//因為點擊展開欄位會引用initializePlugin，就會init currentFunction = null，所以最好放到全局

// 用於點擊訂閱與取消訂閱時刷新JobList維持在先前頁面
let MemoLastJobPage=1

export const initializePlugin = async({ token, plugin_id }) => {


  const refreshAllJobLists = async () => {
    console.log("currentFunction:",currentFunction)
    if (currentFunction == "openJobs"){
      await openFavJobs();
      await openJobs(currentNotification,MemoLastJobPage); 
    }
    if (currentFunction == "openJobsInfo"){
    await openFavJobs();
    await openJobsInfo(currentInfoNotification); 
    }
  };

  //TODO 如何搭配篩選機制
  const openFavJobs = async (filterFavJobs) => {
    const { subscribedJobIds, subscribedCompanyNames } = getSubscribedEntities();
    // try {
      const subbedJobData = await fetchSubscribedJobsFromProxy({ token, plugin_id });
      console.log("FavJobs有無篩選結果傳入：",filterFavJobs)
      let jobData
      if(filterFavJobs==undefined||filterFavJobs==null){
        jobData=subbedJobData
      }else{   
        jobData=filterFavJobs
      }
      //TODO 加入篩選機制
      await displayFavJobList(
        jobData,
        { subscribedJobIds, subscribedCompanyNames },
        { token, plugin_id },
        refreshAllJobLists
      );
    // } catch (error) {
    //   handleFetchError();
    // }
  }

  // 開啟已定時推播符合條件之職缺清單(指定分頁)
  const openJobs = async (notification,MemoLastJobPage=1) => {
    // 從 localStorage 中提取已訂閱的 job_ids 和 company_names
    currentFunction = "openJobs";  // 用來記錄當前觸發的函式名稱
    currentNotification = notification; // 儲存當前 notification
    const { subscribedJobIds, subscribedCompanyNames } = getSubscribedEntities();
    console.log(notification.link)

    if (notification.link?.url) {
      const { url, data = {}, authToken } = notification.link;
      const page = MemoLastJobPage

      try {
        // 給定分頁資訊爬取資料並渲染
        const pubbedJobData = await fetchTodayPublishedJobsFromProxy(url, { authToken, data, page });
        displayJobList(
          url,
          { authToken, data, page },
          pubbedJobData,
          { subscribedJobIds, subscribedCompanyNames },
          { token, plugin_id },
          refreshAllJobLists,
          page
        );
      } catch (error) {
        handleFetchError();
      }
    }
  };
  // 開啟已即時推播有更新內容之單一職缺或公司名下有更新的所有職缺
  const openJobsInfo = async (notification) => {
    currentFunction = "openJobsInfo";  // 用來記錄當前觸發的函式名稱
    currentInfoNotification = notification; // 儲存當前 notification
    console.log(notification)
    const job = notification.link.data.data; // 命名可能要改過
    const { subscribedJobIds, subscribedCompanyNames } = getSubscribedEntities();
    const jobListElement = document.getElementById('job-list');
    jobListElement.innerHTML = '';
    const jobItem = createJobItem(
      job, 
      1, 
      { subscribedJobIds, subscribedCompanyNames },
      { token, plugin_id },
      refreshAllJobLists);
    jobListElement.appendChild(jobItem);
    handleJobItemReadStatus(jobItem, job.job_id);
  };

  return {
    openFavJobs,
    openJobs,
    openJobsInfo,
    refreshAllJobLists
  };
};

//!SECTION -  被封裝的業務邏輯層

//SECTION 插件的UI層(全局)
// //SECTION (全局元素)

const createPluginHtml = () => `
    <div class="job-plugin-container" id="job-plugin-container">
      <h2>Job SideBar</h2>
      <button class="toggle-button" id="toggle-subscribe-form">訂閱職缺條件</button>
      <div class="subscribe-form" id="condition-subscribe-form" style="display: none;">
        <h3>篩選條件</h3>
        <p><small> HINT: 以 , 或 空白鍵 分隔文字。<br>全空白預設無限制。<br>支持模糊匹配不區分大小寫</small></p>
        <label for="industries">行業:</label> 
        <input type="text" id="industries" placeholder="輸入行業名稱">
        <br>
        <label for="job_info">職位資訊（Tech Stack）:</label>
        <input type="text" id="job_info" placeholder="輸入職位關鍵詞，用逗號或空格分隔" size="50">
        <br>
        <label for="job_exp">年資條件範圍:</label>
        <p><small> HINT: 0代表不拘，而非狹義的年資0;<br>兩欄全空預設不篩選;只空下限預設0,只空上限預設最大值</small></p>
        <div style="display: flex; gap: 10px;">
          <div>
            <label for="min_exp">最低年資：</label>
            <input type="number" id="min_exp" name="min_exp" placeholder="例如：0(空白為無下限)" min="0" step="1">
          </div>
          <div>
            <label for="max_exp">最高年資：</label>
            <input type="number" id="max_exp" name="max_exp" placeholder="例如：10(空白為無上限)" min="0" step="1">
          </div>
          <p id="result"></p>
        </div>
        <h3>排除條件</h3>
        <label for="job_info">職位名稱:</label>
        <input type="text" id="exclude_job_title" placeholder="輸入職位關鍵詞，用逗號或空格分隔" size="50">
        <button id="condition-subscribe-button">訂閱</button>
      </div>
      <button class="toggle-button" id="toggle-fav-job-list">收藏職缺資料</button>
      <div class="job-list-div" id="fav-job-list-div">
        <div id="filter-input-container">
          <p><small>以,分隔代表"OR"</small></p>
          <input type="text" id="filter-text" placeholder="請輸入篩選標籤(以,分隔)" />
          <button id="filter-btn">篩選</button>
        </div>
        <br>
        <div class="job-list-container" id="fav-job-list-container">
          <div id="fav-job-list"></div>
        </div>
      </div>
      <button class="toggle-button" id="toggle-job-list">符合的職缺資料</button>
      <div class="job-list-container" id="job-list-container">
        <div id="job-list"></div>
      </div>
    </div>`;

////!SECTION
//  //SECTION (全局指定DOM對象)

const getDomElement = () => {
  const sideBarContainer = document.getElementById('side-bar-container');
  sideBarContainer.innerHTML += createPluginHtml();
  sideBarContainer.style.maxWidth = `${window.innerWidth}px`;

  //插入腳本規則
  const script = document.createElement('script');
  script.type = 'text/javascript';  // 設置腳本類型
  script.text = `
    // 更新結果邏輯
    function submitExperienceRange() {
      const minExp = document.getElementById('min_exp').value;
      const maxExp = document.getElementById('max_exp').value;
      let resultMessage = '';
      const subscribeButton = document.getElementById('condition-subscribe-button');

      // 當 min_exp 和 max_exp 都有值時，確保 min_exp <= max_exp
      if (minExp && maxExp) {
        if (parseInt(minExp) > parseInt(maxExp)) {
          // resultMessage = '最低年資不能大於最高年資';
          alert("請給予正確的年資區間"); // 彈出提示框
          document.getElementById('max_exp').value=minExp
          resultMessage = '選擇的最低年資：' + minExp + ' 年 (最高年資無限制)';
          // subscribeButton.disabled = true;  // 禁用訂閱按鈕
        } else {
          resultMessage = '選擇的年資範圍：' + minExp + ' - ' + maxExp + ' 年';
          // subscribeButton.disabled = false;  // 啟用訂閱按鈕
        }
      } else if (minExp && !maxExp) {
        resultMessage = '選擇的最低年資：' + minExp + ' 年 (最高年資無限制)';
        // subscribeButton.disabled = false;  // 啟用訂閱按鈕
      } else if (!minExp && maxExp) {
        resultMessage = '選擇的最高年資：' + maxExp + ' 年 (最低年資無限制)';
        // subscribeButton.disabled = false;  // 啟用訂閱按鈕
      } else {
        resultMessage = '請填寫完整的年資範圍(全空預設不篩選)';
        // subscribeButton.disabled = true;  // 禁用訂閱按鈕
      }

      document.getElementById('result').textContent = resultMessage;
    }

    // 為年資輸入框添加事件監聽器
    document.getElementById('min_exp').addEventListener('input', submitExperienceRange);
    document.getElementById('max_exp').addEventListener('input', submitExperienceRange);
  `;
  sideBarContainer.appendChild(script);   

  return {
    jobPluginContainer: document.getElementById('job-plugin-container'),
    toggleSubscribeFormButton: document.getElementById('toggle-subscribe-form'),
    subscribeForm: document.getElementById('condition-subscribe-form'),
    toggleFavJobListButton: document.getElementById('toggle-fav-job-list'),
    filterFavJobTextInput:document.getElementById('filter-text'),
    toggleFavJobFilterButton: document.getElementById('filter-btn'),
    toggleJobListButton: document.getElementById('toggle-job-list'),
    favJobListDiv: document.getElementById('fav-job-list-div'),
    jobListContainer: document.getElementById('job-list-container'),
    conditionSubscribeButton: document.getElementById('condition-subscribe-button'),
    industriesInput: document.getElementById('industries'),
    jobInfoInput: document.getElementById('job_info'),
    minExpInputElement: document.getElementById('min_exp'),
    maxExpInputElement: document.getElementById('max_exp'),
    excludeJobTitleInput: document.getElementById('exclude_job_title'),
  };
};

//  //!SECTION
//  //SECTION (全局單例添加DOM監聽器)

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
    toggleFavJobListButton,
    filterFavJobTextInput,
    toggleFavJobFilterButton,
    favJobListDiv,
    toggleJobListButton,
    jobListContainer,
    conditionSubscribeButton,
    industriesInput,
    jobInfoInput,
    minExpInputElement,
    maxExpInputElement,
    excludeJobTitleInput,
  } = getDomElement(); // 不是純函數


  //預設顯示狀態
  subscribeForm.style.display = 'none';
  favJobListDiv.style.display = 'none';
  jobListContainer.style.display = 'block';

  toggleSubscribeFormButton.addEventListener('click', () => {
    if (subscribeForm.style.display === 'none' || subscribeForm.style.display === '') {
      subscribeForm.style.display = 'block';
      fetchSubscribedJobCriteriaFromProxy({ token, plugin_id });
    } else {
      subscribeForm.style.display = 'none';
    }
  });
  let jobExpRangeInput={minExp:null,maxExp:null}
  let MinExpInput
  let MaxExpInput
  // 當minExp或maxExp改變時，更新它們的值
  minExpInputElement.addEventListener('input', () => {
    console.log("最低年資:", minExpInputElement.value);
    MinExpInput = parseInt(minExpInputElement.value);
    MaxExpInput = parseInt(maxExpInputElement.value);
    jobExpRangeInput={ minExp:MinExpInput,maxExp:MaxExpInput }
    console.log("年資範圍:", jobExpRangeInput);
  });

  maxExpInputElement.addEventListener('input', () => {
    console.log("最高年資:", maxExpInputElement.value);
    MinExpInput = parseInt(minExpInputElement.value);
    MaxExpInput = parseInt(maxExpInputElement.value);
    jobExpRangeInput={ minExp:MinExpInput,maxExp:MaxExpInput }
    console.log("年資範圍:",jobExpRangeInput );
  })

  conditionSubscribeButton.addEventListener('click', async () => {
    const processInputString = (input) => input
      .split(/[\s,]+/) // 使用正則表達式拆分字串
      .filter((item) => item.trim() !== '') // 過濾掉空白或空的項目
      .map((item) => item.replace(/^["']|["']$/g, '')); // 去除前後的單引號或雙引號
    const industries = processInputString(industriesInput.value);
    const job_info = processInputString(jobInfoInput.value);
    const job_exp_range=jobExpRangeInput
    const exclude_job_title = processInputString(excludeJobTitleInput.value);

    const subscriptionData = {
      type: 1,
      data: {
        sub: {
          industries,
          job_info,
          job_exp_range,
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


  const getfilterFavJobTextAndRefreshUI=async()=>{
    const tagNames = filterFavJobTextInput.value.split(',').map(tag => tag.trim());
    // const data = await postFilterFavJobAPI(token, tagNames);
    const data = await  filterJobsByTagsFromProxy({ token, plugin_id}, tagNames) 
    const plugin = await initializePlugin({ token, plugin_id });
    console.log("FavJobTextInput當前數值：", filterFavJobTextInput.value);
    const filterFavJobText=filterFavJobTextInput.value

    if (!filterFavJobText) {
      await plugin.openFavJobs();
    } else {
      const filterFavJobs = data;
      await plugin.openFavJobs(filterFavJobs);
    }
  }

  toggleFavJobListButton.addEventListener('click', async() => {
    if (favJobListDiv.style.display === 'none' || favJobListDiv.style.display === '') {
      favJobListDiv.style.display = 'block';
      toggleFavJobListButton.textContent = '收藏的職缺資料';
      await getfilterFavJobTextAndRefreshUI()
      
    } else {
      favJobListDiv.style.display = 'none';
      toggleFavJobListButton.textContent = '收藏的職缺資料(隱藏)';
    }
  });

  filterFavJobTextInput.addEventListener('keydown', async(event) => {
    if (event.key === 'Enter') {
      await getfilterFavJobTextAndRefreshUI()
    }
  });

  toggleFavJobFilterButton.addEventListener('click', async() => {
    await getfilterFavJobTextAndRefreshUI()
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

  //重整時預設操作
  fetchSubscribedEntitiesFromProxy({ token, plugin_id });

  instance = { pluginSideBarContainer: jobPluginContainer };

  return instance;
};
// //!SECTION
//!SECTION