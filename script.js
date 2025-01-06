// 页面加载时显示已保存的网站列表，默认收起状态
window.onload = function() {
    displayWebsiteList();
    document.getElementById('websiteList').style.display = 'none'; // 默认隐藏列表
    document.getElementById('results').style.display = 'none'; // 默认隐藏结果
};

// 添加新网站到本地存储
function addWebsiteToList(url, name) {
    let websites = JSON.parse(localStorage.getItem('websites')) || [];
    websites.push({ url, name });
    localStorage.setItem('websites', JSON.stringify(websites));
}

// 显示当前监测的网站列表
function displayWebsiteList() {
    const websiteList = document.getElementById('websiteList');
    websiteList.innerHTML = ''; // 清空列表
    const websites = JSON.parse(localStorage.getItem('websites')) || [];
    
    websites.forEach((website, index) => {
        const listItem = document.createElement('li');
        
        const checkButton = document.createElement('button');
        checkButton.textContent = '检测';
        checkButton.className = 'check';
        checkButton.onclick = () => { checkWebsite(website); }; // 添加检测功能

        const link = document.createElement('span');
        link.textContent = website.name; // 显示网站名称
        link.title = website.url; // 鼠标悬停时显示网址

        listItem.appendChild(checkButton); // 将检测按钮放在前面
        listItem.appendChild(link);
        
        const editButton = document.createElement('button');
        editButton.textContent = '修改';
        editButton.className = 'modify';
        editButton.onclick = () => { modifyWebsite(index); };
        
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '删除';
        deleteButton.className = 'delete';
        deleteButton.onclick = () => { deleteWebsite(index); };

        // 将其他按钮添加到列表项中
        listItem.appendChild(editButton);
        listItem.appendChild(deleteButton);
        
        websiteList.appendChild(listItem);
    });
}

// 删除网站
function deleteWebsite(index) {
    let websites = JSON.parse(localStorage.getItem('websites')) || [];
    websites.splice(index, 1); // 删除指定索引的网站
    localStorage.setItem('websites', JSON.stringify(websites)); // 更新本地存储
    displayWebsiteList(); // 更新显示列表
}

// 修改网站
function modifyWebsite(index) {
    let websites = JSON.parse(localStorage.getItem('websites')) || [];
    const newUrl = prompt("请输入新的网址", websites[index].url);
    const newName = prompt("请输入新的网站名称", websites[index].name);
    
    if (newUrl && newName) {
        websites[index] = { url: newUrl, name: newName }; // 更新指定索引的网站信息
        localStorage.setItem('websites', JSON.stringify(websites)); // 更新本地存储
        displayWebsiteList(); // 更新显示列表
    }
}

// 检测单个网站的逻辑
async function checkWebsite(website) {
    const resultsDiv = document.getElementById('results');
    
    try {
        const response = await fetch(`https://jiance.baoge.us.kg/?target=${encodeURIComponent(website.url)},${encodeURIComponent(website.name)}`);
        const resultText = await response.text();
        
        displayResult(website.name, resultText); // 显示结果时使用网站名称

        // 保存最近一次检测记录到 localStorage
        localStorage.setItem("lastChecked", JSON.stringify({ name: website.name, resultText }));
        
    } catch (error) {
        console.error(`检测 ${website.name} 时出错`, error);
        displayResult(website.name, "检测失败");
    }
}

// 显示检测结果的函数
function displayResult(name, resultText) {
    const resultsDiv = document.getElementById('results');
    
    resultsDiv.style.display = 'block'; // 显示结果区域

    const resultElement = document.createElement('div');
    resultElement.innerText = `${name}: ${resultText}`; // 显示结果文本
    
    if (resultText.includes("正常运行")) {
        resultElement.className = 'status-normal';
    } else {
        resultElement.className = 'status-error';
    }
    
    resultsDiv.appendChild(resultElement);
}

// 显示总结结果的函数
function displaySummaryResults(total, success, failure, failedUrls) {
    const summaryDiv = document.createElement('div');
    
    summaryDiv.innerHTML = `
       总网址个数：${total}<br/>
       成功连通：${success}<br/>
       检测失败：${failure}<br/>
       失败的网址名称：${failedUrls.join(', ') || '无'}`;
    
    // 清除之前的总结结果（如果存在）
    const existingSummaryDiv = document.querySelector('#summaryResults');
    
    if (existingSummaryDiv) existingSummaryDiv.remove();
    
    summaryDiv.id = 'summaryResults'; // 设置ID以便后续清除或更新

    // 将总结插入到主面板的前端
    const container = document.querySelector('.container');
    container.insertBefore(summaryDiv, container.firstChild);
}

// 检测全部网址的逻辑，使用Promise.all并行处理请求
document.getElementById('startMonitoring').addEventListener('click', async function() {
    const websites = JSON.parse(localStorage.getItem('websites')) || [];
    
    if (websites.length === 0) {
        alert("没有可检测的网址。");
        return;
    }

    // 隐藏结果区域
    document.getElementById('results').style.display = 'none';

    let totalCount = websites.length;
    let successCount = 0;
    let failureCount = 0;
    let failedUrls = [];

    for (const website of websites) {
        try {
            const response = await fetch(`https://jiance.baoge.us.kg/?target=${encodeURIComponent(website.url)},${encodeURIComponent(website.name)}`);
            const resultText = await response.text();
            displayResult(website.name, resultText); // 显示结果时使用网站名称

            if (resultText.includes("正常运行")) {
                successCount++;
            } else {
                failureCount++;
                failedUrls.push(website.name); // 添加到失败网址列表
            }
            
            localStorage.setItem("lastChecked", JSON.stringify({ name: website.name, resultText })); // 保存最近一次检测记录

        } catch (error) {
            console.error(`检测 ${website.name} 时出错`, error);
            failureCount++;
            failedUrls.push(website.name); // 将出错的网址也视为失败
            displayResult(website.name, "检测失败");
        }
    }

    // 显示总结结果
    displaySummaryResults(totalCount, successCount, failureCount, failedUrls);
});

// 展开/收起按钮逻辑 
document.getElementById('toggleWebsiteList').addEventListener('click', function() { 
     const websiteList = document.getElementById('websiteList'); 
     if (websiteList.style.display === 'none' || websiteList.style.display === '') { 
         websiteList.style.display = 'block'; // 展开列表 
         this.textContent = '收起列表'; // 改变按钮文本 
     } else { 
         websiteList.style.display = 'none'; // 收起列表 
         this.textContent = '展开列表'; // 改变按钮文本 
     } 
});

// 显示/隐藏检测记录的逻辑 
document.getElementById('toggleResults').addEventListener('click', function() { 
     const resultsDiv = document.getElementById('results'); 
     if (resultsDiv.style.display === 'none' || resultsDiv.style.display === '') { 
         resultsDiv.style.display = 'block'; // 展示记录 
         this.textContent = '隐藏检测记录'; // 改变按钮文本 
     } else { 
         resultsDiv.style.display = 'none'; // 隐藏记录 
         this.textContent = '显示检测记录'; // 改变按钮文本 
     } 
});

// 监听表单提交事件 
document.getElementById('monitorForm').addEventListener('submit', function(event) { 
     event.preventDefault(); // 阻止默认提交行为 
     const url = document.getElementById('url').value; // 获取输入的网址 
     const name = document.getElementById('name').value; // 获取输入的网站名称 

     // 检查是否为重复网址 
     const websites = JSON.parse(localStorage.getItem('websites')) || []; 
     const isDuplicate = websites.some(website => website.url === url); 
     
     if (isDuplicate) { 
         alert("该网址已存在，请输入不同的网址。"); 
         return; 
     } 

     addWebsiteToList(url, name); // 将新网站添加到本地存储 
     displayWebsiteList(); // 显示当前监测的网站列表 
});
