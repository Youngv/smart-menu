// 菜单数据，初始化为空对象
let dishes = {};
// 存储锁定的菜品
let lockedDishes = {
    meat: [],
    vegetarian: [],
    soup: []
};

// 页面加载时从 API 获取菜单数据
document.addEventListener('DOMContentLoaded', async function () {
    // 检查是否需要添加隐藏的编辑 ID 字段
    if (document.getElementById('editForm') && !document.getElementById('editDishId')) {
        const editForm = document.getElementById('editForm');
        const hiddenField = document.createElement('input');
        hiddenField.type = 'hidden';
        hiddenField.id = 'editDishId';
        hiddenField.name = 'editDishId';
        editForm.appendChild(hiddenField);
    }

    await loadDishesData();

    // 重置锁定的菜品（每次刷新或打开页面时）
    lockedDishes = { meat: [], vegetarian: [], soup: [] };
    localStorage.removeItem('lockedDishes'); // Keep locked dishes local for now

    // refreshDishLists(); // No need to call here, loadDishesData does it
    // refreshDishCounts(); // No need to call here, loadDishesData does it
});

// 获取当前访问地址的基础 URL
function getBaseUrl() {
    return window.location.origin;
}

// 从 API 加载菜单数据并刷新界面
async function loadDishesData() {
    try {
        const baseUrl = getBaseUrl();
        const response = await fetch(`${baseUrl}/api/dishes`);
        dishes = await response.json(); // Update the global dishes object
        refreshDishLists(); // Refresh UI after fetching
        refreshDishCounts(); // Refresh counts after fetching
    } catch (error) {
        console.error('获取菜品数据失败：', error);
        alert('无法加载菜品数据，请检查网络连接或联系管理员');
    }
}

// 保存菜单数据到 API
async function saveDishesData() {
    try {
        const baseUrl = getBaseUrl();
        await fetch(`${baseUrl}/api/dishes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dishes)
        });
        console.log('菜品数据已保存到服务器');
    } catch (error) {
        console.error('保存到服务器失败：', error);
    }
}

// 标签页切换功能
function switchTab(tabName) {
    // 移除所有标签页按钮的 active 类
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });

    // 为当前点击的标签页按钮添加 active 类
    const activeButton = document.querySelector(`.tab-button[onclick*="${tabName}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }

    // 隐藏所有标签页内容
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });

    // 显示选中的标签页内容
    document.getElementById(`${tabName}Content`).style.display = 'block';

    // 如果是管理标签页，刷新菜品列表
    if (tabName === 'manage') {
        refreshDishLists();
    }
}

// 更新菜品数量显示
function refreshDishCounts() {
    document.getElementById('meatCount').max = dishes.meat ? dishes.meat.length : 0;
    document.getElementById('vegCount').max = dishes.vegetarian ? dishes.vegetarian.length : 0;
    document.getElementById('soupCount').max = dishes.soup ? dishes.soup.length : 0;
}

// 洗牌算法，随机打乱数组
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// 生成菜单功能
function generateMenu() {
    const meatCount = parseInt(document.getElementById('meatCount').value) || 0;
    const vegCount = parseInt(document.getElementById('vegCount').value) || 0;
    const soupCount = parseInt(document.getElementById('soupCount').value) || 0;

    // 检查输入值是否超过可用菜品数量
    if (meatCount > dishes.meat.length) {
        alert(`荤菜数量不能超过${dishes.meat.length}！`);
        return;
    }
    if (vegCount > dishes.vegetarian.length) {
        alert(`素菜数量不能超过${dishes.vegetarian.length}！`);
        return;
    }
    if (soupCount > dishes.soup.length) {
        alert(`汤类数量不能超过${dishes.soup.length}！`);
        return;
    }

    // 根据锁定状态获取菜品
    let selectedMeat = [];
    let selectedVeg = [];
    let selectedSoup = [];

    // 首先添加已锁定的菜品
    selectedMeat = [...lockedDishes.meat];
    selectedVeg = [...lockedDishes.vegetarian];
    selectedSoup = [...lockedDishes.soup];

    // 计算还需要多少菜品
    const neededMeat = Math.max(0, meatCount - selectedMeat.length);
    const neededVeg = Math.max(0, vegCount - selectedVeg.length);
    const neededSoup = Math.max(0, soupCount - selectedSoup.length);

    // 过滤掉已经锁定的菜品，避免重复
    const availableMeat = dishes.meat.filter(dish =>
        !lockedDishes.meat.some(lockedDish => lockedDish.name === dish.name));
    const availableVeg = dishes.vegetarian.filter(dish =>
        !lockedDishes.vegetarian.some(lockedDish => lockedDish.name === dish.name));
    const availableSoup = dishes.soup.filter(dish =>
        !lockedDishes.soup.some(lockedDish => lockedDish.name === dish.name));

    // 随机选择剩余需要的菜品
    if (neededMeat > 0) {
        selectedMeat = [...selectedMeat, ...shuffleArray(availableMeat).slice(0, neededMeat)];
    }
    if (neededVeg > 0) {
        selectedVeg = [...selectedVeg, ...shuffleArray(availableVeg).slice(0, neededVeg)];
    }
    if (neededSoup > 0) {
        selectedSoup = [...selectedSoup, ...shuffleArray(availableSoup).slice(0, neededSoup)];
    }

    const menuDisplay = document.getElementById('menuDisplay');
    menuDisplay.innerHTML = '';

    const displayDishes = (dishes, type, category) => {
        dishes.forEach(dish => {
            const dishElement = document.createElement('div');
            dishElement.className = 'dish';
            dishElement.setAttribute('data-type', category);

            // 检查菜品是否被锁定
            const isLocked = lockedDishes[category].some(lockedDish => lockedDish.name === dish.name);

            dishElement.innerHTML = `
                <span class="dish-name">${dish.name}</span>
                <div class="dish-info">
                    <span class="dish-type">${type}</span>
                    <span class="dish-description">${dish.description}</span>
                </div>
                <button class="lock-button ${isLocked ? 'locked' : ''}" 
                    onclick="toggleLock('${category}', '${dish.name}', '${dish.description}')">
                    ${isLocked ? '🔒' : '🔓'}
                </button>
            `;
            menuDisplay.appendChild(dishElement);
        });
    };

    displayDishes(selectedMeat, '荤菜', 'meat');
    displayDishes(selectedVeg, '素菜', 'vegetarian');
    displayDishes(selectedSoup, '汤类', 'soup');

    // 显示复制按钮
    document.getElementById('copyMenuBtn').style.display = 'block';
}

// 刷新所有菜品列表显示
function refreshDishLists() {
    refreshCategoryList('meat', '荤菜', 'meatDishList');
    refreshCategoryList('vegetarian', '素菜', 'vegDishList');
    refreshCategoryList('soup', '汤类', 'soupDishList');
}

// 刷新指定类别的菜品列表
function refreshCategoryList(category, typeName, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    if (!dishes[category] || dishes[category].length === 0) {
        container.innerHTML = `<p>暂无${typeName}，请添加</p>`;
        return;
    }

    dishes[category].forEach((dish) => {
        // Use dish.id or dish._id from API response
        const dishId = dish.id || dish._id;
        if (!dishId) {
            console.warn('Dish missing ID:', dish);
            return; // Skip dishes without an ID
        }
        const dishElement = document.createElement('div');
        dishElement.className = 'dish';
        dishElement.dataset.id = dishId;
        dishElement.innerHTML = `
            <span class="dish-name">${dish.name}</span>
            <div class="dish-info">
                <span class="dish-type">${typeName}</span>
                <span class="dish-description">${dish.description}</span>
            </div>
            <div class="dish-actions">
                <button class="action-button" onclick="editDish('${dishId}')">编辑</button>
                <button class="action-button" onclick="deleteDish('${dishId}')">删除</button>
            </div>
        `;
        container.appendChild(dishElement);
    });
}

// 添加新菜品
async function addDish() {
    const type = document.getElementById('newDishType').value;
    const name = document.getElementById('newDishName').value.trim();
    const description = document.getElementById('newDishDesc').value.trim();

    if (!name) {
        alert('菜品名称不能为空！');
        return;
    }

    try {
        const baseUrl = getBaseUrl();
        await fetch(`${baseUrl}/api/dishes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, description, type })
        });

        // 清空输入框
        document.getElementById('newDishName').value = '';
        document.getElementById('newDishDesc').value = '';
        alert('菜品添加成功！');

        await loadDishesData(); // Reload data from API to refresh UI
    } catch (error) {
        console.error('添加菜品失败：', error);
        alert('添加菜品失败，请稍后再试');
    }
}

// 准备编辑菜品 (获取数据并填充表单)
async function editDish(id) {
    try {
        const baseUrl = getBaseUrl();
        const response = await fetch(`${baseUrl}/api/dishes/${id}`);
        if (!response.ok) {
            throw new Error(`获取菜品信息失败：${response.statusText}`);
        }
        const dish = await response.json();

        // 填充编辑表单
        document.getElementById('editDishName').value = dish.name;
        document.getElementById('editDishDesc').value = dish.description;
        document.getElementById('editDishType').value = dish.type;
        document.getElementById('editDishId').value = id;

        // 显示编辑表单和遮罩
        document.getElementById('editForm').style.display = 'block';
        document.getElementById('editOverlay').style.display = 'block';
    } catch (error) {
        console.error('准备编辑菜品失败：', error);
        alert('无法加载菜品信息进行编辑');
    }
}

// 保存编辑的菜品
async function saveDishEdit() {
    const name = document.getElementById('editDishName').value.trim();
    const description = document.getElementById('editDishDesc').value.trim();
    const type = document.getElementById('editDishType').value;
    const id = document.getElementById('editDishId').value;

    if (!name) {
        alert('菜品名称不能为空！');
        return;
    }

    try {
        const baseUrl = getBaseUrl();
        await fetch(`${baseUrl}/api/dishes/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, description, type })
        });

        // 关闭编辑表单
        cancelEdit();
        alert('菜品更新成功！');

        await loadDishesData(); // Reload data from API to refresh UI
    } catch (error) {
        console.error('更新菜品失败：', error);
        alert('更新菜品失败，请稍后再试');
        cancelEdit(); // Close form even on error
    }
}

// 删除菜品
async function deleteDish(id) {
    if (confirm('确定要删除这个菜品吗？')) {
        try {
            const baseUrl = getBaseUrl();
            await fetch(`${baseUrl}/api/dishes/${id}`, {
                method: 'DELETE'
            });

            alert('菜品已删除！');
            await loadDishesData(); // Reload data from API to refresh UI
        } catch (error) {
            console.error('删除菜品失败：', error);
            alert('删除菜品失败，请稍后再试');
        }
    }
}

// 取消编辑
function cancelEdit() {
    document.getElementById('editForm').style.display = 'none';
    document.getElementById('editOverlay').style.display = 'none';
}

// 导出菜单数据到文件
async function exportData() {
    // Fetch current data from API for export
    try {
        const baseUrl = getBaseUrl();
        const response = await fetch(`${baseUrl}/api/dishes`);
        const currentDishes = await response.json();

        // 创建要下载的数据
        const dataStr = JSON.stringify(currentDishes, null, 2); // 使用缩进格式化 JSON
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileName = 'dishes_' + new Date().toISOString().slice(0, 10) + '.json';

        // 创建一个用于下载的链接元素
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileName);
        linkElement.style.display = 'none';

        // 添加到文档中并触发点击
        document.body.appendChild(linkElement);
        linkElement.click();

        // 清理
        document.body.removeChild(linkElement);

        alert('菜单数据已导出！');
    } catch (error) {
        console.error('导出数据失败：', error);
        alert('导出数据失败，请检查网络连接');
    }
}

// 从文件导入菜单数据
async function importData(event) {
    const file = event.target.files[0];
    if (!file) {
        return; // 没有选择文件
    }

    const reader = new FileReader();
    reader.onload = async function (e) {
        try {
            // 解析 JSON 数据
            const importedData = JSON.parse(e.target.result);

            // 验证数据结构
            if (!importedData.meat || !importedData.vegetarian || !importedData.soup) {
                throw new Error('数据格式不正确，必须包含 meat, vegetarian, soup 分类');
            }

            const baseUrl = getBaseUrl();
            // 这里需要一个 API 端点来接收整个数据结构并替换服务器上的数据
            // 假设有一个 POST /api/dishes/import 端点
            await fetch(`${baseUrl}/api/dishes/import`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(importedData)
            });

            // 清除 file input 的值，允许重新选择同一文件
            document.getElementById('importFile').value = '';
            alert('菜单数据导入成功！');

            await loadDishesData(); // Reload data from API to refresh UI

        } catch (error) {
            alert('导入失败：' + (error.message || '无效的数据格式或服务器错误'));
            console.error('导入错误：', error);

            // 清除 file input 的值
            document.getElementById('importFile').value = '';
        }
    };

    // 读取文件内容
    reader.readAsText(file);
}

// 增加数值的函数
function incrementValue(id) {
    const input = document.getElementById(id);
    input.value = parseInt(input.value) + 1;
}

// 减少数值的函数
function decrementValue(id) {
    const input = document.getElementById(id);
    const currentValue = parseInt(input.value);
    if (currentValue > 0) {
        input.value = currentValue - 1;
    }
}

// 修改复制菜单功能，添加后备方案
function copyMenu() {
    const menuDisplay = document.getElementById('menuDisplay');
    let menuText = '';

    // 分类名称映射
    const categoryMap = {
        'meat': '荤菜',
        'vegetarian': '素菜',
        'soup': '汤类'
    };

    // 存储不同类型的菜品
    const dishByType = {
        'meat': [],
        'vegetarian': [],
        'soup': []
    };

    // 获取所有菜品
    const dishes = menuDisplay.querySelectorAll('.dish');

    // 如果没有菜品，不执行复制
    if (dishes.length === 0) {
        return;
    }

    // 将菜品按类型分类
    dishes.forEach(dish => {
        const dishName = dish.querySelector('.dish-name').textContent;
        // 尝试从 data-type 属性获取类型，如果没有则从 dish-type 元素中推断
        let dishType = dish.getAttribute('data-type');
        if (!dishType) {
            const typeElem = dish.querySelector('.dish-type');
            if (typeElem) {
                const typeText = typeElem.textContent;
                if (typeText.includes('荤菜')) dishType = 'meat';
                else if (typeText.includes('素菜')) dishType = 'vegetarian';
                else dishType = 'soup';
            } else {
                // 如果无法确定类型，默认为荤菜
                dishType = 'meat';
            }
        }

        // 添加菜品到对应类型数组
        if (dishByType[dishType]) {
            dishByType[dishType].push(dishName);
        }
    });

    // 按照要求的格式组合文本
    for (const [type, typeNames] of Object.entries(dishByType)) {
        if (typeNames.length > 0) {
            menuText += `${categoryMap[type]}：${typeNames.join('，')}`;
            menuText += '\n';
        }
    }

    // 尝试使用现代 Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(menuText)
            .then(() => showCopySuccess())
            .catch(err => {
                console.error('Clipboard API failed: ', err);
                fallbackCopy(menuText);
            });
    } else {
        // 后备方案
        fallbackCopy(menuText);
    }

    // 复制成功后的 UI 反馈
    function showCopySuccess() {
        const copyBtn = document.getElementById('copyMenuBtn');
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '复制成功✅';
        copyBtn.style.backgroundColor = '#48bb78';

        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.backgroundColor = '#38a169';
        }, 2000);
    }

    // 后备复制方法
    function fallbackCopy(text) {
        // 创建一个临时文本区域
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        let success = false;
        try {
            // 执行复制命令
            success = document.execCommand('copy');
        } catch (err) {
            console.error('Fallback copy failed:', err);
        }

        // 移除临时元素
        document.body.removeChild(textArea);

        if (success) {
            showCopySuccess();
        } else {
            alert('复制失败，请手动复制');
        }
    }
}

// 切换菜品锁定状态
function toggleLock(category, name, description) {
    // 查找菜品是否已锁定
    const lockIndex = lockedDishes[category].findIndex(dish => dish.name === name);

    if (lockIndex >= 0) {
        // 如果已锁定，解锁它
        lockedDishes[category].splice(lockIndex, 1);
    } else {
        // 如果未锁定，锁定它
        lockedDishes[category].push({ name, description });
    }

    // 保存锁定状态到本地存储
    localStorage.setItem('lockedDishes', JSON.stringify(lockedDishes));

    // 刷新菜单显示，更新锁定图标
    const menuDishes = document.querySelectorAll('.dish');
    menuDishes.forEach(dishElement => {
        if (dishElement.querySelector('.dish-name').textContent === name) {
            const lockButton = dishElement.querySelector('.lock-button');
            if (lockIndex >= 0) {
                // 已经解锁
                lockButton.textContent = '🔓';
                lockButton.classList.remove('locked');
            } else {
                // 已经锁定
                lockButton.textContent = '🔒';
                lockButton.classList.add('locked');
            }
        }
    });
}
