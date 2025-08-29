/**
 * Password Master - 智能密码生成器
 * 核心功能模块
 */

class PasswordGenerator {
    constructor() {
        this.currentLanguage = 'zh';
        this.currentTheme = 'light';
        this.passwordHistory = JSON.parse(localStorage.getItem('passwordHistory') || '[]');
        
        // 字符集定义
        this.charsets = {
            uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            lowercase: 'abcdefghijklmnopqrstuvwxyz',
            numbers: '0123456789',
            symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
        };
        
        // 易混淆字符
        this.similarChars = '0O1lI';
        this.ambiguousChars = '{}[]()/\\\'"`~,;.<>';
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadSettings();
        this.updateLanguage();
        this.updateTheme();
    }
    
    bindEvents() {
        // 主要功能按钮
        document.getElementById('generatePassword').addEventListener('click', () => this.generatePassword());
        document.getElementById('regeneratePassword').addEventListener('click', () => this.generatePassword());
        document.getElementById('copyPassword').addEventListener('click', () => this.copyToClipboard());
        document.getElementById('showHistory').addEventListener('click', () => this.showHistoryModal());
        
        // 批量生成
        document.getElementById('generateBatch').addEventListener('click', () => this.generateBatchPasswords());
        
        // 设置控制
        document.getElementById('lengthSlider').addEventListener('input', (e) => this.updateLengthInput(e.target.value));
        document.getElementById('lengthInput').addEventListener('input', (e) => this.updateLengthSlider(e.target.value));
        
        // 字符类型复选框
        const checkboxes = ['includeUppercase', 'includeLowercase', 'includeNumbers', 'includeSymbols'];
        checkboxes.forEach(id => {
            document.getElementById(id).addEventListener('change', () => this.validateCharsetSelection());
        });
        
        // 主题和语言切换
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('languageToggle').addEventListener('click', () => this.toggleLanguage());
        
        // 模态框事件
        this.bindModalEvents();
        
        // 键盘快捷键
        this.bindKeyboardShortcuts();
    }
    
    bindModalEvents() {
        // 历史记录模态框
        const historyModal = document.getElementById('historyModal');
        const batchModal = document.getElementById('batchModal');
        
        // 关闭按钮
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').classList.remove('show');
            });
        });
        
        // 点击背景关闭
        [historyModal, batchModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                }
            });
        });
        
        // 历史记录操作
        document.getElementById('clearHistory').addEventListener('click', () => this.clearHistory());
        document.getElementById('exportHistory').addEventListener('click', () => this.exportHistory());
        
        // 批量结果操作
        document.getElementById('copyAllPasswords').addEventListener('click', () => this.copyAllPasswords());
        document.getElementById('exportBatch').addEventListener('click', () => this.exportBatchResults());
    }
    
    bindKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + G: 生成密码
            if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
                e.preventDefault();
                this.generatePassword();
            }
            
            // Ctrl/Cmd + C: 复制密码 (当密码输入框聚焦时)
            if ((e.ctrlKey || e.metaKey) && e.key === 'c' && document.activeElement.id === 'generatedPassword') {
                e.preventDefault();
                this.copyToClipboard();
            }
            
            // Ctrl/Cmd + H: 显示历史记录
            if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
                e.preventDefault();
                this.showHistoryModal();
            }
            
            // Escape: 关闭模态框
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal.show').forEach(modal => {
                    modal.classList.remove('show');
                });
            }
        });
    }
    
    generatePassword() {
        const config = this.getGenerationConfig();
        
        if (!config.charset) {
            this.showToast('请至少选择一种字符类型', 'error');
            return;
        }
        
        const password = this.createPassword(config);
        this.displayPassword(password);
        this.analyzePassword(password);
        this.saveToHistory(password);
        
        // 启用复制按钮
        document.getElementById('copyPassword').disabled = false;
    }
    
    getGenerationConfig() {
        const length = parseInt(document.getElementById('lengthInput').value);
        const includeUppercase = document.getElementById('includeUppercase').checked;
        const includeLowercase = document.getElementById('includeLowercase').checked;
        const includeNumbers = document.getElementById('includeNumbers').checked;
        const includeSymbols = document.getElementById('includeSymbols').checked;
        const excludeSimilar = document.getElementById('excludeSimilar').checked;
        const excludeAmbiguous = document.getElementById('excludeAmbiguous').checked;
        
        let charset = '';
        if (includeUppercase) charset += this.charsets.uppercase;
        if (includeLowercase) charset += this.charsets.lowercase;
        if (includeNumbers) charset += this.charsets.numbers;
        if (includeSymbols) charset += this.charsets.symbols;
        
        // 排除字符
        if (excludeSimilar) {
            charset = charset.split('').filter(char => !this.similarChars.includes(char)).join('');
        }
        
        if (excludeAmbiguous) {
            charset = charset.split('').filter(char => !this.ambiguousChars.includes(char)).join('');
        }
        
        return {
            length,
            charset,
            includeUppercase,
            includeLowercase,
            includeNumbers,
            includeSymbols
        };
    }
    
    createPassword(config) {
        const { length, charset, includeUppercase, includeLowercase, includeNumbers, includeSymbols } = config;
        
        if (length < 4 || length > 128) {
            throw new Error('密码长度必须在4-128位之间');
        }
        
        let password = '';
        const charArray = charset.split('');
        
        // 确保每种选中的字符类型至少包含一个字符
        const requiredChars = [];
        if (includeUppercase) requiredChars.push(this.getRandomChar(this.charsets.uppercase));
        if (includeLowercase) requiredChars.push(this.getRandomChar(this.charsets.lowercase));
        if (includeNumbers) requiredChars.push(this.getRandomChar(this.charsets.numbers));
        if (includeSymbols) requiredChars.push(this.getRandomChar(this.charsets.symbols));
        
        // 添加必需字符
        for (let i = 0; i < requiredChars.length && i < length; i++) {
            password += requiredChars[i];
        }
        
        // 填充剩余长度
        for (let i = password.length; i < length; i++) {
            password += this.getRandomChar(charset);
        }
        
        // 打乱密码字符顺序
        return this.shuffleString(password);
    }
    
    getRandomChar(charset) {
        const array = new Uint32Array(1);
        crypto.getRandomValues(array);
        return charset[array[0] % charset.length];
    }
    
    shuffleString(str) {
        const array = str.split('');
        for (let i = array.length - 1; i > 0; i--) {
            const randomValues = new Uint32Array(1);
            crypto.getRandomValues(randomValues);
            const j = randomValues[0] % (i + 1);
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array.join('');
    }
    
    displayPassword(password) {
        const passwordInput = document.getElementById('generatedPassword');
        passwordInput.value = password;
        
        // 添加动画效果
        passwordInput.style.transform = 'scale(1.02)';
        setTimeout(() => {
            passwordInput.style.transform = 'scale(1)';
        }, 200);
    }
    
    analyzePassword(password) {
        const analysis = this.calculatePasswordStrength(password);
        this.updateStrengthIndicator(analysis);
        this.displayAnalysisDetails(analysis);
    }
    
    calculatePasswordStrength(password) {
        let score = 0;
        let feedback = [];
        
        const length = password.length;
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumbers = /[0-9]/.test(password);
        const hasSymbols = /[^A-Za-z0-9]/.test(password);
        const hasRepeating = /(.)\1{2,}/.test(password);
        const hasSequential = this.hasSequentialChars(password);
        
        // 长度评分
        if (length >= 12) score += 25;
        else if (length >= 8) score += 15;
        else if (length >= 6) score += 10;
        else score += 5;
        
        // 字符类型评分
        if (hasUpper) score += 15;
        if (hasLower) score += 15;
        if (hasNumbers) score += 15;
        if (hasSymbols) score += 20;
        
        // 多样性评分
        const uniqueChars = new Set(password).size;
        const diversity = uniqueChars / length;
        if (diversity > 0.8) score += 10;
        else if (diversity > 0.6) score += 5;
        
        // 扣分项
        if (hasRepeating) {
            score -= 10;
            feedback.push('包含重复字符');
        }
        
        if (hasSequential) {
            score -= 10;
            feedback.push('包含连续字符');
        }
        
        if (length < 8) {
            feedback.push('密码长度偏短');
        }
        
        // 计算强度等级
        let level, levelText, color;
        if (score >= 80) {
            level = 'strong';
            levelText = this.currentLanguage === 'zh' ? '极强' : 'Very Strong';
            color = 'strong';
        } else if (score >= 60) {
            level = 'good';
            levelText = this.currentLanguage === 'zh' ? '强' : 'Strong';
            color = 'good';
        } else if (score >= 40) {
            level = 'fair';
            levelText = this.currentLanguage === 'zh' ? '中等' : 'Fair';
            color = 'fair';
        } else {
            level = 'weak';
            levelText = this.currentLanguage === 'zh' ? '弱' : 'Weak';
            color = 'weak';
        }
        
        return {
            score: Math.min(100, Math.max(0, score)),
            level,
            levelText,
            color,
            feedback,
            details: {
                length,
                hasUpper,
                hasLower,
                hasNumbers,
                hasSymbols,
                uniqueChars,
                diversity: Math.round(diversity * 100)
            }
        };
    }
    
    hasSequentialChars(password) {
        const sequences = [
            'abcdefghijklmnopqrstuvwxyz',
            'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            '0123456789',
            'qwertyuiop',
            'asdfghjkl',
            'zxcvbnm'
        ];
        
        for (const sequence of sequences) {
            for (let i = 0; i <= sequence.length - 3; i++) {
                if (password.includes(sequence.substr(i, 3))) {
                    return true;
                }
            }
        }
        return false;
    }
    
    updateStrengthIndicator(analysis) {
        const strengthBar = document.getElementById('strengthBar');
        const strengthText = document.getElementById('strengthText');
        
        strengthBar.style.width = `${analysis.score}%`;
        strengthBar.className = `strength-fill ${analysis.color}`;
        strengthText.textContent = analysis.levelText;
        
        // 添加动画效果
        strengthBar.style.transition = 'width 0.5s ease, background-color 0.3s ease';
    }
    
    displayAnalysisDetails(analysis) {
        const analysisContent = document.getElementById('analysisContent');
        const { details, feedback } = analysis;
        
        const items = [
            { label: '密码长度', value: `${details.length} 字符`, status: details.length >= 12 ? 'good' : details.length >= 8 ? 'warning' : 'danger' },
            { label: '大写字母', value: details.hasUpper ? '✓' : '✗', status: details.hasUpper ? 'good' : 'danger' },
            { label: '小写字母', value: details.hasLower ? '✓' : '✗', status: details.hasLower ? 'good' : 'danger' },
            { label: '数字', value: details.hasNumbers ? '✓' : '✗', status: details.hasNumbers ? 'good' : 'danger' },
            { label: '特殊符号', value: details.hasSymbols ? '✓' : '✗', status: details.hasSymbols ? 'good' : 'warning' },
            { label: '字符多样性', value: `${details.diversity}%`, status: details.diversity >= 80 ? 'good' : details.diversity >= 60 ? 'warning' : 'danger' }
        ];
        
        let html = items.map(item => `
            <div class="analysis-item">
                <span>${item.label}</span>
                <span class="analysis-value ${item.status}">${item.value}</span>
            </div>
        `).join('');
        
        if (feedback.length > 0) {
            html += `
                <div class="analysis-item">
                    <span>改进建议</span>
                    <span class="analysis-value warning">${feedback.join(', ')}</span>
                </div>
            `;
        }
        
        analysisContent.innerHTML = html;
    }
    
    generateBatchPasswords() {
        const count = parseInt(document.getElementById('batchCount').value);
        
        if (count < 1 || count > 100) {
            this.showToast('批量数量必须在1-100之间', 'error');
            return;
        }
        
        const config = this.getGenerationConfig();
        if (!config.charset) {
            this.showToast('请至少选择一种字符类型', 'error');
            return;
        }
        
        const passwords = [];
        for (let i = 0; i < count; i++) {
            passwords.push(this.createPassword(config));
        }
        
        this.showBatchResults(passwords);
    }
    
    showBatchResults(passwords) {
        const modal = document.getElementById('batchModal');
        const resultsContainer = document.getElementById('batchResults');
        
        const html = passwords.map((password, index) => `
            <div class="batch-item">
                <span class="batch-password">${password}</span>
                <div class="history-actions">
                    <button class="btn-icon" onclick="passwordGenerator.copyText('${password}')" title="复制">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        resultsContainer.innerHTML = html;
        modal.classList.add('show');
        
        // 保存到历史记录
        passwords.forEach(password => this.saveToHistory(password));
        
        this.showToast(`成功生成 ${passwords.length} 个密码`, 'success');
    }
    
    copyToClipboard() {
        const password = document.getElementById('generatedPassword').value;
        if (!password) {
            this.showToast('没有密码可复制', 'error');
            return;
        }
        
        this.copyText(password);
    }
    
    async copyText(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('密码已复制到剪贴板', 'success');
        } catch (err) {
            // 降级处理
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showToast('密码已复制到剪贴板', 'success');
        }
    }
    
    saveToHistory(password) {
        const historyItem = {
            password,
            timestamp: Date.now(),
            strength: this.calculatePasswordStrength(password).levelText
        };
        
        // 避免重复
        const existingIndex = this.passwordHistory.findIndex(item => item.password === password);
        if (existingIndex !== -1) {
            this.passwordHistory.splice(existingIndex, 1);
        }
        
        this.passwordHistory.unshift(historyItem);
        
        // 限制历史记录数量
        if (this.passwordHistory.length > 100) {
            this.passwordHistory = this.passwordHistory.slice(0, 100);
        }
        
        localStorage.setItem('passwordHistory', JSON.stringify(this.passwordHistory));
    }
    
    showHistoryModal() {
        const modal = document.getElementById('historyModal');
        const historyList = document.getElementById('historyList');
        
        if (this.passwordHistory.length === 0) {
            historyList.innerHTML = '<p class="history-empty">暂无生成记录</p>';
        } else {
            const html = this.passwordHistory.map(item => `
                <div class="history-item">
                    <span class="history-password">${item.password}</span>
                    <div class="history-actions">
                        <button class="btn-icon" onclick="passwordGenerator.copyText('${item.password}')" title="复制">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="btn-icon" onclick="passwordGenerator.removeFromHistory('${item.password}')" title="删除">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
            
            historyList.innerHTML = html;
        }
        
        modal.classList.add('show');
    }
    
    removeFromHistory(password) {
        this.passwordHistory = this.passwordHistory.filter(item => item.password !== password);
        localStorage.setItem('passwordHistory', JSON.stringify(this.passwordHistory));
        this.showHistoryModal(); // 刷新显示
    }
    
    clearHistory() {
        if (confirm('确定要清除所有历史记录吗？')) {
            this.passwordHistory = [];
            localStorage.removeItem('passwordHistory');
            this.showHistoryModal(); // 刷新显示
            this.showToast('历史记录已清除', 'success');
        }
    }
    
    exportHistory() {
        if (this.passwordHistory.length === 0) {
            this.showToast('没有历史记录可导出', 'error');
            return;
        }
        
        const csvContent = this.generateCSV(this.passwordHistory);
        this.downloadFile(csvContent, 'password-history.csv', 'text/csv');
        this.showToast('历史记录已导出', 'success');
    }
    
    copyAllPasswords() {
        const passwords = Array.from(document.querySelectorAll('.batch-password'))
            .map(el => el.textContent)
            .join('\n');
        
        this.copyText(passwords);
    }
    
    exportBatchResults() {
        const passwords = Array.from(document.querySelectorAll('.batch-password'))
            .map((el, index) => ({
                password: el.textContent,
                timestamp: Date.now(),
                index: index + 1
            }));
        
        const csvContent = this.generateCSV(passwords);
        this.downloadFile(csvContent, 'batch-passwords.csv', 'text/csv');
        this.showToast('批量密码已导出', 'success');
    }
    
    generateCSV(data) {
        const headers = ['密码', '生成时间', '强度'];
        const csvRows = [headers.join(',')];
        
        data.forEach(item => {
            const row = [
                `"${item.password}"`,
                new Date(item.timestamp).toLocaleString(),
                item.strength || 'N/A'
            ];
            csvRows.push(row.join(','));
        });
        
        return csvRows.join('\n');
    }
    
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    
    updateLengthInput(value) {
        document.getElementById('lengthInput').value = value;
    }
    
    updateLengthSlider(value) {
        const clampedValue = Math.max(4, Math.min(128, parseInt(value) || 4));
        document.getElementById('lengthSlider').value = clampedValue;
        document.getElementById('lengthInput').value = clampedValue;
    }
    
    validateCharsetSelection() {
        const checkboxes = ['includeUppercase', 'includeLowercase', 'includeNumbers', 'includeSymbols'];
        const checkedCount = checkboxes.filter(id => document.getElementById(id).checked).length;
        
        if (checkedCount === 0) {
            // 如果没有选择任何字符类型，自动选择小写字母
            document.getElementById('includeLowercase').checked = true;
            this.showToast('至少需要选择一种字符类型', 'error');
        }
    }
    
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.updateTheme();
        this.saveSettings();
    }
    
    updateTheme() {
        const body = document.body;
        const themeIcon = document.querySelector('#themeToggle i');
        
        if (this.currentTheme === 'dark') {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            themeIcon.className = 'fas fa-sun';
        } else {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            themeIcon.className = 'fas fa-moon';
        }
    }
    
    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'zh' ? 'en' : 'zh';
        this.updateLanguage();
        this.saveSettings();
    }
    
    updateLanguage() {
        const elements = document.querySelectorAll('[data-zh][data-en]');
        elements.forEach(el => {
            const text = this.currentLanguage === 'zh' ? el.dataset.zh : el.dataset.en;
            if (el.tagName === 'INPUT' && el.type === 'text') {
                el.placeholder = text;
            } else {
                el.textContent = text;
            }
        });
        
        // 更新页面标题
        document.title = this.currentLanguage === 'zh' 
            ? 'Password Master - 智能密码生成器'
            : 'Password Master - Smart Password Generator';
        
        // 更新语言图标
        const langIcon = document.querySelector('#languageToggle i');
        langIcon.className = this.currentLanguage === 'zh' ? 'fas fa-globe' : 'fas fa-language';
    }
    
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    loadSettings() {
        const settings = JSON.parse(localStorage.getItem('passwordSettings') || '{}');
        this.currentTheme = settings.theme || 'light';
        this.currentLanguage = settings.language || 'zh';
    }
    
    saveSettings() {
        const settings = {
            theme: this.currentTheme,
            language: this.currentLanguage
        };
        localStorage.setItem('passwordSettings', JSON.stringify(settings));
    }
}

// 初始化应用
const passwordGenerator = new PasswordGenerator();

// 页面加载完成后的额外初始化
document.addEventListener('DOMContentLoaded', () => {
    // 自动生成一个示例密码
    setTimeout(() => {
        passwordGenerator.generatePassword();
    }, 500);
    
    // 添加加载动画
    document.body.classList.add('loaded');
});

// 导出到全局作用域供HTML调用
window.passwordGenerator = passwordGenerator;
