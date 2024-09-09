# Notification System

基於 [TabColab](https://github.com/YiHsinTseng/tabcolab-api) 延伸設計之通知系統，藉由外掛功能的添加，用於擴展SideBar以及卡片可涵蓋資訊的可能性。

## 前置作業

需要搭配Job_Sub_Pub的伺服器開啟使用

https://github.com/YiHsinTseng/JobSubPub

啟動後會立刻執行爬蟲（其後是每天9:00定時爬蟲）

## 啟動應用

```
node server.js
```

## 登入帳密(管理員)
```
帳號： admin123@gmail.com
密碼： admin123
```

## 初始化設定

![](./img/sample.png)

### 添加插件(管理員)

Plugin Name:
```
Job_Sub_Pub
```
Plugin APIs (JSON):
```
{
"routine_sub":"http://localhost:4000/api/jobs_subscriptions",
"instant_sub":"http://localhost:4000/api/id_subscriptions",
"search":"http://localhost:4000/api/filterJobsBySub",
"subInfo":"http://localhost:4000/api/id_subscriptions",
"jobSubInfo":"http://localhost:4000/api/filterJobsBySub"
}
```

### 輸入訂閱條件範例（定時條件推播）

行業:
```
消費性電子產品製造業, 電腦軟體服務業
```
職位資訊:
```
Node.js MySQL
```


## 測試功能

### 以API立刻觸發推播

利用postman發送 POST api： http://localhost:4010/api/trigger-push

用於立即根據訂閱條件取得推送通知

點擊通知顯示職缺詳情，並可根據有興趣的職缺或公司個別訂閱，如有更新內容或是新增職缺會個別立即推送

### 以API立刻觸發爬蟲並測試即時職缺或公司推播

利用postman發送 POST api：http://localhost:5060/go_job

如有職缺有變動或公司有任何新職缺會獨立以單條通知推送