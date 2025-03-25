// 菜单数据，初始化为空对象
let dishes = {};

// 页面加载时从 JSON 文件获取菜单数据
document.addEventListener('DOMContentLoaded', async function () {
    await loadDishesData();
    refreshDishLists();
});

// 从 JSON 文件加载菜单数据
async function loadDishesData() {
    const response = await fetch('dishes.json');
    dishes = await response.json();
    refreshDishCounts();
}

// 保存菜单数据到 localStorage
function saveDishesData() {
    localStorage.setItem('smartMenuDishes', JSON.stringify(dishes));
    console.log('菜品数据已保存到 localStorage');
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
    document.getElementById('meatCount').max = dishes.meat.length;
    document.getElementById('vegCount').max = dishes.vegetarian.length;
    document.getElementById('soupCount').max = dishes.soup.length;
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

    const selectedMeat = shuffleArray(dishes.meat).slice(0, meatCount);
    const selectedVeg = shuffleArray(dishes.vegetarian).slice(0, vegCount);
    const selectedSoup = shuffleArray(dishes.soup).slice(0, soupCount);

    const menuDisplay = document.getElementById('menuDisplay');
    menuDisplay.innerHTML = '';

    const displayDishes = (dishes, type) => {
        dishes.forEach(dish => {
            const dishElement = document.createElement('div');
            dishElement.className = 'dish';
            dishElement.innerHTML = `
                <span class="dish-name">${dish.name}</span>
                <div class="dish-info">
                    <span class="dish-type">${type}</span>
                    <span class="dish-description">${dish.description}</span>
                </div>
            `;
            menuDisplay.appendChild(dishElement);
        });
    };

    displayDishes(selectedMeat, '荤菜');
    displayDishes(selectedVeg, '素菜');
    displayDishes(selectedSoup, '汤类');
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

    dishes[category].forEach((dish, index) => {
        const dishElement = document.createElement('div');
        dishElement.className = 'dish';
        dishElement.innerHTML = `
            <span class="dish-name">${dish.name}</span>
            <div class="dish-info">
                <span class="dish-type">${typeName}</span>
                <span class="dish-description">${dish.description}</span>
            </div>
            <div class="dish-actions">
                <button class="action-button" onclick="editDish('${category}', ${index})">编辑</button>
                <button class="action-button" onclick="deleteDish('${category}', ${index})">删除</button>
            </div>
        `;
        container.appendChild(dishElement);
    });
}

// 添加新菜品
function addDish() {
    const type = document.getElementById('newDishType').value;
    const name = document.getElementById('newDishName').value.trim();
    const description = document.getElementById('newDishDesc').value.trim();

    if (!name) {
        alert('菜品名称不能为空！');
        return;
    }

    dishes[type].push({ name, description });
    saveDishesData();
    refreshDishLists();
    refreshDishCounts();

    // 清空输入框
    document.getElementById('newDishName').value = '';
    document.getElementById('newDishDesc').value = '';

    alert('菜品添加成功！');
}

// 编辑菜品
function editDish(type, index) {
    const dish = dishes[type][index];

    // 填充编辑表单
    document.getElementById('editDishName').value = dish.name;
    document.getElementById('editDishDesc').value = dish.description;
    document.getElementById('editDishType').value = type;
    document.getElementById('editDishIndex').value = index;

    // 显示编辑表单和遮罩
    document.getElementById('editForm').style.display = 'block';
    document.getElementById('editOverlay').style.display = 'block';
}

// 保存编辑的菜品
function saveDishEdit() {
    const name = document.getElementById('editDishName').value.trim();
    const description = document.getElementById('editDishDesc').value.trim();
    const type = document.getElementById('editDishType').value;
    const index = parseInt(document.getElementById('editDishIndex').value);

    if (!name) {
        alert('菜品名称不能为空！');
        return;
    }

    dishes[type][index] = { name, description };
    saveDishesData();
    refreshDishLists();

    // 关闭编辑表单
    cancelEdit();

    alert('菜品更新成功！');
}

// 删除菜品
function deleteDish(type, index) {
    if (confirm('确定要删除这个菜品吗？')) {
        dishes[type].splice(index, 1);
        saveDishesData();
        refreshDishLists();
        refreshDishCounts();
        alert('菜品已删除！');
    }
}

// 取消编辑
function cancelEdit() {
    document.getElementById('editForm').style.display = 'none';
    document.getElementById('editOverlay').style.display = 'none';
}

// 尝试从 localStorage 加载数据
function loadFromLocalStorage() {
    const savedData = localStorage.getItem('smartMenuDishes');
    if (savedData) {
        try {
            dishes = JSON.parse(savedData);
            console.log('从 localStorage 加载菜品数据成功');
            return true;
        } catch (e) {
            console.error('解析 localStorage 数据失败', e);
        }
    }
    return false;
}

// 初始化：先尝试从 localStorage 加载，失败则从 JSON 文件加载
document.addEventListener('DOMContentLoaded', async function () {
    if (!loadFromLocalStorage()) {
        await loadDishesData();
    }
    refreshDishLists();
    refreshDishCounts();
});

// 导出菜单数据到文件
function exportData() {
    // 创建要下载的数据
    const dataStr = JSON.stringify(dishes, null, 2); // 使用缩进格式化 JSON
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
}

// 从文件导入菜单数据
function importData(event) {
    const file = event.target.files[0];
    if (!file) {
        return; // 没有选择文件
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            // 解析 JSON 数据
            const importedData = JSON.parse(e.target.result);

            // 验证数据结构
            if (!importedData.meat || !importedData.vegetarian || !importedData.soup) {
                throw new Error('数据格式不正确');
            }

            // 更新菜单数据
            dishes = importedData;

            // 刷新界面
            refreshDishLists();
            refreshDishCounts();

            // 清除 file input 的值，允许重新选择同一文件
            document.getElementById('importFile').value = '';

            alert('菜单数据导入成功！');
        } catch (error) {
            alert('导入失败：' + (error.message || '无效的数据格式'));
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
