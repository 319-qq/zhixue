// 智学AI - 主应用脚本

// 测试函数是否正确加载
console.log('app.js 已加载');
console.log('所有函数定义:', Object.keys(window).filter(k => typeof window[k] === 'function'));

// ==================== 页面导航 ====================
function navigateTo(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    document.getElementById(`page-${pageId}`).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==================== 智谱AI API调用 ====================
const API_KEY = '28bc5d0ffdad4ae487870c1c47bb566f.PrLwhizf4MBlxwM6';

async function callZhipuAI(messages, temperature = 0.7) {
    try {
        console.log('调用智谱AI API...');
        console.log('请求消息:', messages);
        
        const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'glm-4',
                messages: messages,
                temperature: temperature
            })
        });
        
        console.log('API响应状态:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API错误响应:', errorText);
            throw new Error(`API调用失败(${response.status}): ${errorText}`);
        }
        
        const data = await response.json();
        console.log('API响应数据:', data);
        return data.choices[0].message.content;
    } catch (error) {
        console.error('智谱AI API调用错误:', error);
        throw error;
    }
}

// ==================== 智能问答 ====================
let qaMessages = [];
let qaInputText = '';

async function sendQAMessage() {
    const input = document.getElementById('qa-input').value.trim();
    if (!input) return;
    
    const messagesContainer = document.getElementById('qa-messages');
    const time = getTime();
    
    // 添加用户消息
    messagesContainer.innerHTML += `
        <div class="message-item is-user">
            <div class="avatar">
                <span>👤</span>
            </div>
            <div class="message-content">
                <span class="message-text">${input}</span>
                <span class="message-time">${time}</span>
            </div>
        </div>
    `;
    
    // 清空输入框
    document.getElementById('qa-input').value = '';
    updateCharCount('qa-input', 'qa-char-count', 2000);
    
    // 显示加载状态
    messagesContainer.innerHTML += `
        <div class="loading-item">
            <div class="avatar">
                <span>🤖</span>
            </div>
            <div class="loading-dots">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
        </div>
    `;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // 调用智谱AI API
    const systemPrompt = '你是一个智能学习助手，名为"智学AI"。你擅长回答各种学习相关的问题，包括学科知识、概念解释、学习方法等。请用友好、专业的方式回答用户的问题。如果问题不够明确，请给出合理的解释和相关的知识点。';
    const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: input }
    ];
    
    try {
        const response = await callZhipuAI(messages);
        const loadingItem = messagesContainer.querySelector('.loading-item');
        if (loadingItem) loadingItem.remove();
        
        messagesContainer.innerHTML += `
            <div class="message-item">
                <div class="avatar">
                    <span>🤖</span>
                </div>
                <div class="message-content">
                    <span class="message-text">${response}</span>
                    <span class="message-time">${time}</span>
                </div>
            </div>
        `;
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } catch (error) {
        const loadingItem = messagesContainer.querySelector('.loading-item');
        if (loadingItem) loadingItem.remove();
        
        messagesContainer.innerHTML += `
            <div class="message-item">
                <div class="avatar">
                    <span>🤖</span>
                </div>
                <div class="message-content">
                    <span class="message-text">抱歉，发生了错误，请稍后重试。</span>
                    <span class="message-time">${time}</span>
                </div>
            </div>
        `;
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// ==================== 文本摘要 ====================
async function generateSummary() {
    console.log('generateSummary 函数被调用');
    const input = document.getElementById('summary-input').value.trim();
    console.log('输入内容:', input);
    if (!input) {
        alert('请输入需要摘要的文本');
        return;
    }
    
    document.getElementById('summary-loading').style.display = 'block';
    document.getElementById('summary-result').style.display = 'none';
    
    const systemPrompt = '你是一个文本摘要助手。请仔细阅读用户提供的文本，提取核心内容和关键信息，生成一段简洁准确的摘要。摘要应该包含文章的主要观点、核心论据和重要结论。请用清晰的结构组织摘要内容。';
    const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: input }
    ];
    
    try {
        const summary = await callZhipuAI(messages, 0.3);
        document.getElementById('summary-loading').style.display = 'none';
        document.getElementById('summary-result').style.display = 'block';
        document.getElementById('summary-content').textContent = summary;
    } catch (error) {
        console.error('摘要生成错误:', error);
        document.getElementById('summary-loading').style.display = 'none';
        document.getElementById('summary-result').style.display = 'block';
        document.getElementById('summary-content').textContent = `抱歉，发生了错误: ${error.message}`;
    }
}

function copySummary() {
    const text = document.getElementById('summary-content').textContent;
    copyToClipboard(text, '摘要已复制');
}

function copyPlan() {
    const text = document.getElementById('plan-text').textContent;
    copyToClipboard(text, '计划已复制');
}

function clearPlan() {
    document.getElementById('plan-result').style.display = 'none';
}

function copyExplain() {
    const text = document.getElementById('explain-text').textContent;
    copyToClipboard(text, '解释已复制');
}

function clearExplain() {
    document.getElementById('explain-result').style.display = 'none';
}

function copyTranslate() {
    const text = document.getElementById('translate-text').textContent;
    copyToClipboard(text, '翻译已复制');
}

function clearTranslate() {
    document.getElementById('translate-result').style.display = 'none';
}

function clearWriting() {
    document.getElementById('writing-result').style.display = 'none';
}

function copyMindmap() {
    const text = document.getElementById('mindmap-text').textContent;
    copyToClipboard(text, '思维导图已复制');
}

function clearMindmap() {
    document.getElementById('mindmap-result').style.display = 'none';
}

// ==================== 学习计划 ====================
let planDuration = 'week';
let planDirection = 'exam';

function selectDuration(opt, value) {
    planDuration = value;
    document.querySelectorAll('.duration-option').forEach(o => o.classList.remove('active'));
    opt.classList.add('active');
    
    const customInput = document.getElementById('custom-duration-wrapper');
    if (value === 'other') {
        customInput.style.display = 'block';
    } else {
        customInput.style.display = 'none';
    }
}

function selectDirection(opt, value) {
    planDirection = value;
    document.querySelectorAll('.direction-option').forEach(o => o.classList.remove('active'));
    opt.classList.add('active');
    
    const customInput = document.getElementById('custom-direction-wrapper');
    if (value === 'other') {
        customInput.style.display = 'block';
    } else {
        customInput.style.display = 'none';
    }
}

async function generatePlan() {
    console.log('generatePlan 函数被调用');
    const goal = document.getElementById('plan-goal').value.trim();
    console.log('学习目标:', goal);
    if (!goal) {
        alert('请输入学习目标');
        return;
    }
    
    // 获取实际值
    let durationText = planDuration;
    if (planDuration === 'other') {
        durationText = document.getElementById('plan-custom-duration').value || '7';
    }
    
    let directionText = getDirectionText(planDirection);
    if (planDirection === 'other') {
        directionText = document.getElementById('plan-custom-direction').value || '其他';
    }
    
    // 默认每日学习时长为2小时
    let dailyTimeText = '2';
    
    document.getElementById('plan-loading').style.display = 'block';
    document.getElementById('plan-result').style.display = 'none';
    
    const systemPrompt = `你是一个学习规划专家。请根据用户提供的以下信息，生成一个详细的学习计划。

学习目标：${goal}
计划周期：${durationText}
学习方向：${directionText}
每日学习时长：${dailyTimeText}小时

请生成一个JSON格式的每日学习任务清单，格式如下：
{
    "days": [
        {
            "day": "第1天",
            "tasks": ["任务1", "任务2", "任务3"]
        },
        ...
    ]
}

请根据周期生成对应天数，每天3-5个具体任务。只返回JSON数据，不要其他内容。`;
    
    try {
        const messages = [
            { role: 'system', content: '你是一个专业的学习规划专家，擅长根据用户需求制定科学、实用的学习计划。' },
            { role: 'user', content: systemPrompt }
        ];
        const plan = await callZhipuAI(messages);
        
        // 尝试解析JSON
        let planData;
        try {
            const jsonMatch = plan.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                planData = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('无法解析计划数据');
            }
        } catch (e) {
            // 如果解析失败，生成默认结构
            const days = parseInt(durationText) || 7;
            planData = { days: [] };
            for (let i = 1; i <= days; i++) {
                planData.days.push({
                    day: '第' + i + '天',
                    tasks: [
                        '复习相关概念和原理',
                        '完成练习题和实践项目',
                        '总结学习笔记'
                    ]
                });
            }
        }
        
        // 生成可视化任务列表
        let html = '<div class="task-list">';
        planData.days.forEach((dayData, dayIndex) => {
            html += '<div class="task-section">';
            html += '<div class="task-section-title">' + dayData.day + '</div>';
            
            dayData.tasks.forEach((task, taskIndex) => {
                const taskId = 'task-' + dayIndex + '-' + taskIndex;
                html += '<div class="task-item">';
                html += '<div class="task-checkbox" id="' + taskId + '" onclick="toggleTask(this)"></div>';
                html += '<span class="task-text" id="' + taskId + '-text">' + task + '</span>';
                html += '</div>';
            });
            
            html += '</div>';
        });
        html += '</div>';
        
        document.getElementById('plan-loading').style.display = 'none';
        document.getElementById('plan-result').style.display = 'block';
        document.getElementById('plan-tasks').innerHTML = html;
        document.getElementById('plan-text').textContent = plan;
    } catch (error) {
        document.getElementById('plan-loading').style.display = 'none';
        document.getElementById('plan-result').style.display = 'block';
        document.getElementById('plan-text').textContent = '抱歉，发生了错误，请稍后重试。';
    }
}

// 任务勾选功能
function toggleTask(checkbox) {
    checkbox.classList.toggle('checked');
    const textId = checkbox.id + '-text';
    const textElement = document.getElementById(textId);
    if (textElement) {
        textElement.classList.toggle('completed');
    }
}

function getDirectionText(value) {
    const directions = {
        'programming': '编程开发',
        'data': '数据科学',
        'ai': '人工智能',
        'language': '语言学习',
        'exam': '考试备考',
        'career': '职业技能',
        'other': '其他'
    };
    return directions[value] || '其他';
}

// ==================== 知识点解释 ====================
async function explainConcept() {
    console.log('explainConcept 函数被调用');
    const keyword = document.getElementById('explain-input').value.trim();
    console.log('知识点:', keyword);
    if (!keyword) {
        alert('请输入要解释的知识点');
        return;
    }
    
    document.getElementById('explain-loading').style.display = 'block';
    document.getElementById('explain-result').style.display = 'none';
    document.getElementById('explain-title').textContent = `📚 ${keyword}`;
    
    const systemPrompt = '你是一个知识点解释专家。请对用户提出的概念或术语进行详细、易懂的解释。首先给出基本定义，然后从多个角度深入分析，结合实际例子帮助理解。如果涉及相关概念，也一并解释。';
    const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: keyword }
    ];
    
    try {
        const explanation = await callZhipuAI(messages);
        document.getElementById('explain-loading').style.display = 'none';
        document.getElementById('explain-result').style.display = 'block';
        document.getElementById('explain-text').textContent = explanation;
    } catch (error) {
        document.getElementById('explain-loading').style.display = 'none';
        document.getElementById('explain-result').style.display = 'block';
        document.getElementById('explain-text').textContent = '抱歉，发生了错误，请稍后重试。';
    }
}

function setExplainKeyword(keyword) {
    document.getElementById('explain-input').value = keyword;
    explainConcept();
}

// ==================== 文本翻译 ====================
let sourceLang = 'zh';

function selectSourceLang(lang) {
    sourceLang = lang;
    document.getElementById('lang-zh').classList.toggle('active', lang === 'zh');
    document.getElementById('lang-en').classList.toggle('active', lang === 'en');
    
    const placeholder = lang === 'zh' ? '请输入需要翻译的中文...' : 'Please enter text to translate...';
    document.getElementById('translate-input').placeholder = placeholder;
}

function exchangeLanguages() {
    sourceLang = sourceLang === 'zh' ? 'en' : 'zh';
    selectSourceLang(sourceLang);
    
    // 如果有翻译结果，交换输入和输出
    const input = document.getElementById('translate-input');
    const output = document.getElementById('translate-text');
    if (input.value && output.textContent) {
        const temp = input.value;
        input.value = output.textContent;
        output.textContent = temp;
    }
}

async function translateText() {
    console.log('translateText 函数被调用');
    const input = document.getElementById('translate-input').value.trim();
    console.log('翻译内容:', input);
    if (!input) {
        alert('请输入要翻译的文本');
        return;
    }
    
    document.getElementById('translate-loading').style.display = 'block';
    document.getElementById('translate-result').style.display = 'none';
    
    const systemPrompt = sourceLang === 'zh' 
        ? '你是一个专业翻译助手，请将用户输入的中文文本准确翻译成英文。保持原文语义和风格，翻译要自然流畅，符合英文表达习惯。'
        : '你是一个专业翻译助手，请将用户输入的英文文本准确翻译成中文。保持原文语义和风格，翻译要自然流畅，符合中文表达习惯。';
    
    const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: input }
    ];
    
    try {
        const translation = await callZhipuAI(messages, 0.3);
        document.getElementById('translate-loading').style.display = 'none';
        document.getElementById('translate-result').style.display = 'block';
        document.getElementById('translate-text').textContent = translation;
    } catch (error) {
        document.getElementById('translate-loading').style.display = 'none';
        document.getElementById('translate-result').style.display = 'block';
        document.getElementById('translate-text').textContent = '抱歉，发生了错误，请稍后重试。';
    }
}

function copyTranslation() {
    const text = document.getElementById('translate-text').textContent;
    copyToClipboard(text, '翻译已复制');
}

// ==================== 创意写作 ====================
let writingType = 'article';
let wordLength = '500';
let writingStyle = 'formal';

function selectWritingType(opt, value) {
    writingType = value;
    document.querySelectorAll('.type-option').forEach(o => o.classList.remove('active'));
    opt.classList.add('active');
    
    const customInput = document.getElementById('custom-type-wrapper');
    if (value === 'other') {
        customInput.style.display = 'block';
    } else {
        customInput.style.display = 'none';
    }
}

function selectLength(opt, value) {
    wordLength = value;
    document.querySelectorAll('.length-option').forEach(o => o.classList.remove('active'));
    opt.classList.add('active');
    
    const customInput = document.getElementById('custom-length-wrapper');
    if (value === 'other') {
        customInput.style.display = 'block';
    } else {
        customInput.style.display = 'none';
    }
}

function selectWordLength(value) {
    wordLength = value;
    document.querySelectorAll('.length-option').forEach(opt => opt.classList.remove('active'));
    event.target.classList.add('active');
}

function selectWritingStyle(value) {
    writingStyle = value;
    document.querySelectorAll('.style-option').forEach(opt => opt.classList.remove('active'));
    event.target.classList.add('active');
}

async function generateWriting() {
    console.log('generateWriting 函数被调用');
    const topic = document.getElementById('writing-topic').value.trim();
    console.log('写作主题:', topic);
    if (!topic) {
        alert('请输入写作主题');
        return;
    }
    
    // 获取实际值
    let typeText = getTypeText(writingType);
    if (writingType === 'other') {
        typeText = document.getElementById('writing-custom-type').value || '文章';
    }
    
    let lengthText = wordLength;
    if (wordLength === 'other') {
        lengthText = document.getElementById('writing-custom-length').value || '1000字';
    }
    
    const additionalInfo = document.getElementById('writing-additional')?.value?.trim() || '';
    
    document.getElementById('writing-loading').style.display = 'block';
    document.getElementById('writing-result').style.display = 'none';
    
    const lengthMap = {
        'short': '500-800字',
        'medium': '1000-1500字',
        'long': '2000-3000字',
        'other': lengthText
    };
    
    const styleMap = {
        'formal': '正式、严谨',
        'casual': '轻松、随性',
        'academic': '学术、专业',
        'humorous': '幽默、风趣'
    };
    
    const systemPrompt = `你是一个创意写作助手。请根据用户的要求创作内容：

写作主题：${topic}
文章类型：${typeText}
内容长度：${lengthMap[wordLength] || lengthText}
文章风格：${styleMap[writingStyle] || '正式'}
${additionalInfo ? `补充要求：${additionalInfo}` : ''}

请创作一篇结构完整、内容丰富的文章。开头要吸引读者，正文要有逻辑性，结尾要有总结和升华。请确保内容原创、有深度、有价值。`;
    
    try {
        const messages = [
            { role: 'system', content: '你是一个专业作家，擅长多种类型的创意写作，包括文章、作文、文案、故事、诗歌等。' },
            { role: 'user', content: systemPrompt }
        ];
        const content = await callZhipuAI(messages, 0.8);
        document.getElementById('writing-loading').style.display = 'none';
        document.getElementById('writing-result').style.display = 'block';
        document.getElementById('writing-text').textContent = content;
    } catch (error) {
        document.getElementById('writing-loading').style.display = 'none';
        document.getElementById('writing-result').style.display = 'block';
        document.getElementById('writing-text').textContent = '抱歉，发生了错误，请稍后重试。';
    }
}

function copyWriting() {
    const text = document.getElementById('writing-text').textContent;
    copyToClipboard(text, '内容已复制');
}

function getTypeText(value) {
    const types = {
        'article': '文章',
        'story': '故事',
        'poem': '诗歌',
        'speech': '演讲稿',
        'other': '其他'
    };
    return types[value] || '文章';
}

function getStyleText(value) {
    const styles = {
        'formal': '正式',
        'casual': '轻松',
        'academic': '学术',
        'humorous': '幽默'
    };
    return styles[value] || '正式';
}

// ==================== 思维导图 ====================
let mapStyle = 'modern';

function selectMapStyle(value) {
    mapStyle = value;
    document.querySelectorAll('.style-option').forEach(opt => opt.classList.remove('active'));
    event.target.classList.add('active');
}

function selectStyle(opt, value) {
    mapStyle = value;
    document.querySelectorAll('.style-option').forEach(o => o.classList.remove('active'));
    opt.classList.add('active');
}

async function generateMindmap() {
    console.log('generateMindmap 函数被调用');
    const topic = document.getElementById('mindmap-topic').value.trim();
    const description = document.getElementById('mindmap-desc')?.value?.trim() || '';
    console.log('思维导图主题:', topic);
    if (!topic) {
        alert('请输入中心主题');
        return;
    }
    
    document.getElementById('mindmap-loading').style.display = 'block';
    document.getElementById('mindmap-result').style.display = 'none';
    
    const styleMap = {
        'modern': '现代简约风格',
        'simple': '简洁清晰风格',
        'colorful': '绚丽多彩风格',
        'professional': '专业商务风格'
    };
    
    const systemPrompt = `你是一个思维导图生成专家。请根据用户提供的中心主题和内容描述，生成一个结构化的思维导图。

中心主题：${topic}
内容描述：${description || '请自行扩展相关分支内容'}
导图风格：${styleMap[mapStyle] || '现代简约风格'}

请生成一个JSON格式的思维导图数据，格式如下：
{
    "center": "中心主题名称",
    "branches": [
        {
            "name": "分支1名称",
            "subBranches": ["子节点1", "子节点2", "子节点3"]
        },
        ...
    ]
}

请生成4-6个主要分支，每个分支2-4个子节点。只返回JSON数据，不要其他内容。`;
    
    try {
        const messages = [
            { role: 'system', content: '你是一个思维导图专家，擅长将复杂主题结构化，帮助用户理清思路、梳理知识框架。' },
            { role: 'user', content: systemPrompt }
        ];
        const content = await callZhipuAI(messages, 0.7);
        
        // 尝试解析JSON
        let mindmapData;
        try {
            // 提取JSON
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                mindmapData = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('无法解析思维导图数据');
            }
        } catch (e) {
            // 如果解析失败，使用默认结构
            mindmapData = {
                center: topic,
                branches: [
                    { name: '概述', subBranches: [description || '主要内容'] },
                    { name: '核心概念', subBranches: ['基础知识', '进阶内容'] },
                    { name: '实践应用', subBranches: ['案例分析', '动手实践'] },
                    { name: '学习资源', subBranches: ['文档教程', '视频课程'] }
                ]
            };
        }
        
        // 生成可视化思维导图
        let html = '<div class="mindmap-center"><div class="mindmap-center-node">' + mindmapData.center + '</div></div>';
        html += '<div class="mindmap-branches">';
        
        mindmapData.branches.forEach((branch, index) => {
            const colors = ['#818cf8', '#f472b6', '#34d399', '#fbbf24', '#60a5fa', '#a78bfa'];
            const color = colors[index % colors.length];
            const gradient = `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`;
            
            html += '<div class="mindmap-branch">';
            html += '<div class="branch-line"></div>';
            html += '<div class="mindmap-branch-node" style="background:' + gradient + ';">' + branch.name + '</div>';
            
            if (branch.subBranches && branch.subBranches.length > 0) {
                html += '<div class="mindmap-sub-branches">';
                branch.subBranches.forEach(sub => {
                    html += '<div class="mindmap-sub-branch">';
                    html += '<div class="sub-branch-line"></div>';
                    html += '<div class="mindmap-sub-node">' + sub + '</div>';
                    html += '</div>';
                });
                html += '</div>';
            }
            html += '</div>';
        });
        
        html += '</div>';
        
        document.getElementById('mindmap-loading').style.display = 'none';
        document.getElementById('mindmap-result').style.display = 'block';
        document.getElementById('mindmap-visual').innerHTML = html;
        document.getElementById('mindmap-text').textContent = content;
    } catch (error) {
        document.getElementById('mindmap-loading').style.display = 'none';
        document.getElementById('mindmap-result').style.display = 'block';
        document.getElementById('mindmap-text').textContent = '抱歉，发生了错误，请稍后重试。';
    }
}

// ==================== AI猜数字大战 ====================
let gameState = {
    userSecret: 0,
    aiSecret: 0,
    userGuesses: 0,
    aiGuesses: 0,
    userMin: 1,
    userMax: 100,
    aiMin: 1,
    aiMax: 100,
    isUserTurn: true,
    guessHistory: [],
    aiCurrentGuess: 0
};

function startGame() {
    const userSecret = parseInt(document.getElementById('user-secret').value);
    if (isNaN(userSecret) || userSecret < 1 || userSecret > 100) {
        alert('请输入1-100之间的数字');
        return;
    }
    
    // 初始化游戏状态
    gameState = {
        userSecret: userSecret,
        aiSecret: Math.floor(Math.random() * 100) + 1,
        userGuesses: 0,
        aiGuesses: 0,
        userMin: 1,
        userMax: 100,
        aiMin: 1,
        aiMax: 100,
        isUserTurn: true,
        guessHistory: [],
        aiCurrentGuess: 0
    };
    
    // 更新UI
    document.getElementById('user-guesses').textContent = '0次';
    document.getElementById('ai-guesses').textContent = '0次';
    document.getElementById('user-range').textContent = '范围：1 - 100';
    document.getElementById('guess-history').innerHTML = '';
    
    // 切换到游戏进行界面
    document.getElementById('game-setup').style.display = 'none';
    document.getElementById('game-playing').style.display = 'block';
    document.getElementById('game-ended').style.display = 'none';
    
    updateTurnIndicator();
}

function updateTurnIndicator() {
    const indicator = document.getElementById('turn-indicator');
    const text = document.getElementById('turn-text');
    
    if (gameState.isUserTurn) {
        indicator.className = 'turn-indicator user-turn';
        text.textContent = '👤 你的回合 - 猜AI的数字';
        document.getElementById('user-turn-card').style.display = 'block';
        document.getElementById('ai-turn-card').style.display = 'none';
        document.getElementById('ai-guess-card').style.display = 'none';
    } else {
        indicator.className = 'turn-indicator ai-turn';
        text.textContent = '🤖 AI的回合 - 猜你的数字';
        document.getElementById('user-turn-card').style.display = 'none';
        document.getElementById('ai-turn-card').style.display = 'block';
        document.getElementById('ai-guess-card').style.display = 'none';
    }
}

function userMakeGuess() {
    const guess = parseInt(document.getElementById('user-guess-input').value);
    if (isNaN(guess) || guess < gameState.userMin || guess > gameState.userMax) {
        alert(`请输入${gameState.userMin}-${gameState.userMax}之间的数字`);
        return;
    }
    
    gameState.userGuesses++;
    document.getElementById('user-guesses').textContent = `${gameState.userGuesses}次`;
    
    let result = '';
    let resultText = '';
    
    if (guess === gameState.aiSecret) {
        result = 'correct';
        resultText = '猜中了！';
        endGame('user');
    } else if (guess > gameState.aiSecret) {
        result = 'big';
        resultText = '太大了';
        gameState.userMax = guess - 1;
        document.getElementById('user-range').textContent = `范围：${gameState.userMin} - ${gameState.userMax}`;
    } else {
        result = 'small';
        resultText = '太小了';
        gameState.userMin = guess + 1;
        document.getElementById('user-range').textContent = `范围：${gameState.userMin} - ${gameState.userMax}`;
    }
    
    addGuessHistory('user', guess, result, resultText);
    document.getElementById('user-guess-input').value = '';
    
    // 如果没猜中，切换到AI回合
    if (result !== 'correct') {
        gameState.isUserTurn = false;
        updateTurnIndicator();
        aiMakeGuess();
    }
}

function aiMakeGuess() {
    document.getElementById('ai-turn-card').style.display = 'block';
    document.getElementById('ai-guess-card').style.display = 'none';
    
    setTimeout(() => {
        // AI使用二分法策略
        gameState.aiCurrentGuess = Math.floor((gameState.aiMin + gameState.aiMax) / 2);
        
        document.getElementById('ai-turn-card').style.display = 'none';
        document.getElementById('ai-guess-card').style.display = 'block';
        document.getElementById('ai-guess-number').textContent = gameState.aiCurrentGuess;
    }, 500);
}

function giveFeedback(feedback) {
    gameState.aiGuesses++;
    document.getElementById('ai-guesses').textContent = `${gameState.aiGuesses}次`;
    
    let result = '';
    let resultText = '';
    
    if (feedback === 'correct') {
        result = 'correct';
        resultText = '猜中了！';
        endGame('ai');
    } else if (feedback === 'big') {
        result = 'big';
        resultText = '太大了';
        gameState.aiMax = gameState.aiCurrentGuess - 1;
    } else {
        result = 'small';
        resultText = '太小了';
        gameState.aiMin = gameState.aiCurrentGuess + 1;
    }
    
    addGuessHistory('ai', gameState.aiCurrentGuess, result, resultText);
    
    // 如果没猜中，切换到用户回合
    if (feedback !== 'correct') {
        gameState.isUserTurn = true;
        updateTurnIndicator();
    }
}

function addGuessHistory(player, guess, result, resultText) {
    gameState.guessHistory.push({
        player: player,
        guess: guess,
        result: result,
        resultText: resultText
    });
    
    const historyContainer = document.getElementById('guess-history');
    const historyHtml = `
        <div class="history-item ${player}">
            <span class="history-player">${player === 'user' ? '👤 你' : '🤖 AI'}</span>
            <span class="history-guess">猜 ${guess}</span>
            <span class="history-result ${result}">${resultText}</span>
        </div>
    `;
    historyContainer.innerHTML += historyHtml;
}

function endGame(winner) {
    document.getElementById('game-playing').style.display = 'none';
    document.getElementById('game-ended').style.display = 'block';
    
    const resultCard = document.getElementById('result-card');
    const resultTitle = document.getElementById('result-title');
    const resultDesc = document.getElementById('result-desc');
    
    if (winner === 'user') {
        resultCard.className = 'result-card win';
        resultTitle.textContent = '🎉 你赢了！';
        resultDesc.textContent = '你先猜中了AI的数字！';
    } else {
        resultCard.className = 'result-card lose';
        resultTitle.textContent = '🤖 AI赢了！';
        resultDesc.textContent = 'AI先猜中了你的数字！';
    }
    
    // 更新统计数据
    document.getElementById('final-user-guesses').textContent = gameState.userGuesses;
    document.getElementById('final-ai-guesses').textContent = gameState.aiGuesses;
    document.getElementById('final-ai-number').textContent = gameState.aiSecret;
    document.getElementById('final-user-number').textContent = gameState.userSecret;
    
    // 显示AI评价
    setTimeout(() => {
        document.getElementById('ai-comment').style.display = 'block';
        const comment = winner === 'user' 
            ? '哼，下次我一定会赢回来的！你的策略很不错！' 
            : '哈哈，我赢了！下次再来挑战吧，我可是用了最优的二分法策略哦！';
        document.getElementById('comment-text').textContent = comment;
    }, 1000);
}

function restartGame() {
    document.getElementById('user-secret').value = '';
    document.getElementById('game-setup').style.display = 'block';
    document.getElementById('game-playing').style.display = 'none';
    document.getElementById('game-ended').style.display = 'none';
    document.getElementById('ai-comment').style.display = 'none';
}

// ==================== 宣传视频 ====================
function openVideoModal() {
    document.getElementById('video-modal').style.display = 'flex';
}

function closeVideoModal() {
    const video = document.getElementById('video-player');
    if (video) {
        video.pause();
    }
    document.getElementById('video-modal').style.display = 'none';
}

// ==================== 辅助函数 ====================
function getTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

function updateCharCount(inputId, countId, maxLength) {
    const input = document.getElementById(inputId);
    const count = document.getElementById(countId);
    if (input && count) {
        count.textContent = `${input.value.length}/${maxLength}`;
    }
}

function copyToClipboard(text, message) {
    navigator.clipboard.writeText(text).then(() => {
        alert(message);
    }).catch(() => {
        // 备用方案
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert(message);
    });
}

// ==================== 初始化事件监听 ====================
document.addEventListener('DOMContentLoaded', function() {
    // 智能问答输入监听
    const qaInput = document.getElementById('qa-input');
    if (qaInput) {
        qaInput.addEventListener('input', function() {
            updateCharCount('qa-input', 'qa-char-count', 2000);
        });
    }
    
    // 文本摘要输入监听
    const summaryInput = document.getElementById('summary-input');
    if (summaryInput) {
        summaryInput.addEventListener('input', function() {
            updateCharCount('summary-input', 'summary-char-count', 5000);
        });
    }
    
    // 翻译输入监听
    const translateInput = document.getElementById('translate-input');
    if (translateInput) {
        translateInput.addEventListener('input', function() {
            updateCharCount('translate-input', 'translate-char-count', 5000);
        });
    }
    
    // 创意写作补充说明监听
    const writingAdditional = document.getElementById('writing-additional');
    if (writingAdditional) {
        writingAdditional.addEventListener('input', function() {
            updateCharCount('writing-additional', 'writing-additional-count', 500);
        });
    }
    
    // 思维导图内容监听
    const mindmapContent = document.getElementById('mindmap-content');
    if (mindmapContent) {
        mindmapContent.addEventListener('input', function() {
            updateCharCount('mindmap-content', 'mindmap-content-count', 2000);
        });
    }
});