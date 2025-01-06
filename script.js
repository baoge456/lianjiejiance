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
        checkButton.onclick = () => { checkWebsite(website, listItem); }; // 添加检测功能

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
async function checkWebsite(website, listItem) {
    const resultElement = document.createElement('div');
    listItem.appendChild(resultElement); // 将结果显示在网址下方

    try {
        const response = await fetch(`https://jiance.baoge.us.kg/?target=${encodeURIComponent(website.url)},${encodeURIComponent(website.name)}`);
        const resultText = await response.text();
        
        displayResult(resultElement, website.name, resultText); // 显示结果时使用网站名称

    } catch (error) {
        console.error(`检测 ${website.name} 时出错`, error);
        displayResult(resultElement, website.name, "返回错误状态码: 500"); // 显示错误状态
    }
}

// 显示检测结果的函数
function displayResult(element, name, resultText) {
    const errorCodeMatch = resultText.match(/状态码: (\d+)/); // 匹配状态码
    const errorCode = errorCodeMatch ? errorCodeMatch[1] : '未知错误';

    if (resultText.includes("正常运行")) {
        element.innerText = `${name}: 正常`; // 显示正常状态
        element.className = 'status-normal'; // 设置类名为正常状态
    } else {
        element.innerText = `${name}: 返回错误状态码: ${errorCode}`; // 显示错误状态
        element.className = 'status-error'; // 设置类名为错误状态
    }
}

// 检测全部网址的逻辑
document.getElementById('startMonitoring').addEventListener('click', async function() {
    const websites = JSON.parse(localStorage.getItem('websites')) || [];
    
    if (websites.length === 0) {
        alert("没有可检测的网址。");
        return;
    }

    // 隐藏结果区域和进度条
    document.getElementById('results').style.display = 'none';
    document.getElementById('progressContainer').style.display = 'block';
    document.getElementById('progressBar').style.width = '0%';
    document.getElementById('progressText').innerText = '检测进度: 0%';
    document.getElementById('progressStats').innerText = `总数量: ${websites.length}, 成功: 0, 失败: 0`;

    let totalCount = websites.length;
    let successCount = 0;
    let failureCount = 0;
    let failedUrls = [];

    for (let i = 0; i < totalCount; i++) {
        const website = websites[i];

        try {
            const response = await fetch(`https://jiance.baoge.us.kg/?target=${encodeURIComponent(website.url)},${encodeURIComponent(website.name)}`);
            const resultText = await response.text();
            const listItem = document.getElementById('websiteList').children[i];
            displayResult(listItem.lastChild, website.name, resultText); // 显示结果时使用网站名称

            if (resultText.includes("正常运行")) {
                successCount++;
            } else {
                failureCount++;
                failedUrls.push(website.name); // 添加到失败网址列表
            }

        } catch (error) {
            console.error(`检测 ${website.name} 时出错`, error);
            failureCount++;
            failedUrls.push(website.name); // 将出错的网址也视为失败
            const listItem = document.getElementById('websiteList').children[i];
            displayResult(listItem.lastChild, website.name, "返回错误状态码: 500"); // 显示错误状态
        }

        // 更新进度条和统计信息
        const progressPercentage = ((i + 1) / totalCount) * 100;
        document.getElementById('progressBar').style.width = `${progressPercentage}%`;
        document.getElementById('progressText').innerText = `检测进度: ${Math.round(progressPercentage)}%`;
        document.getElementById('progressStats').innerText = `总数量: ${totalCount}, 成功: ${successCount}, 失败: ${failureCount}`;
    }

    // 检测完成
    alert("检测已完成");
    document.getElementById('progressContainer').style.display = 'none'; // 隐藏进度条
    if (failureCount > 0) {
        alert(`失败的网址名称: ${failedUrls.join(', ')}`); // 显示失败网址
    }
});

// 下载网站列表为文本文件
function downloadWebsiteList() {
    const websites = JSON.parse(localStorage.getItem('websites')) || [];
    if (websites.length === 0) {
        alert("没有可下载的网址。");
        return;
    }

    // 创建文本内容
    const content = websites.map(website => `${website.url},${website.name}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain' }); // 创建Blob对象
    const url = URL.createObjectURL(blob); // 创建文件的URL

    // 创建下载链接
    const a = document.createElement('a');
    a.href = url;
    a.download = 'websites.txt'; // 设置下载文件名
    document.body.appendChild(a); // 将链接添加到文档
    a.click(); // 模拟点击下载
    document.body.removeChild(a); // 下载后移除链接
    URL.revokeObjectURL(url); // 释放URL对象
}

// 监听下载按钮的点击事件
document.getElementById('downloadButton').addEventListener('click', downloadWebsiteList);

// 导入网址列表
document.getElementById('uploadButton').addEventListener('click', function() {
    document.getElementById('fileInput').click(); // 模拟点击文件输入
});

// 监听文件选择事件
document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0]; // 获取选择的文件
    if (!file) {
        return;
    }

    const reader = new FileReader(); // 创建文件读取器
    reader.onload = function(e) {
        const content = e.target.result; // 获取文件内容
        const lines = content.split('\n'); // 按行分割内容

        const websites = lines.map(line => {
            const [url, name] = line.split(','); // 分割URL和名称
            return { url, name }; // 返回对象
        });

        // 将导入的网址添加到本地存储
        const existingWebsites = JSON.parse(localStorage.getItem('websites')) || [];
        const updatedWebsites = [...existingWebsites, ...websites];
        localStorage.setItem('websites', JSON.stringify(updatedWebsites)); // 更新本地存储

        alert("网址列表导入成功！");
        displayWebsiteList(); // 更新显示列表
    };

    reader.readAsText(file); // 读取文件内容
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
