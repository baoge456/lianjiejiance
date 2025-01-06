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
    displayWebsiteList(); // 更新显示列表
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
        
        const dele
