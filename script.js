document.addEventListener('DOMContentLoaded', function () {
    // 隐藏所有内容
    document.querySelectorAll('.part').forEach(content => {
        content.style.display = 'none';
    });
    // 显示主页
    document.querySelector('#home').style.display = 'flex';


    // 显示某个界面
    function showPart(id) {
        document.querySelectorAll('.part').forEach(p => p.style.display = 'none');
        const part = document.getElementById(id);
        if (part) part.style.display = id === 'home' ? 'flex' : 'block';
    }

    //设置常数
    let timerInterval;
    let seconds = 0;
    let correctCharacter = null; // 当前正确答案
    let foundCount = 0; // 已找出的正确数
    let totalCorrect = 0; // 当前游戏总正确数
    let container = null;

    const allImagePaths = [
        'source/宁宁.jpg',
        'source/丛雨.jpg',
        'source/妃爱.jpg',
        'source/美咕噜.jpg',
        'source/夏目.jpg',
        'source/天音.jpg',
        'source/弥荣.jpg',
    ];

    //计时器设置
    function updateTimer(timerElement) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        const centiseconds = Math.floor((seconds % 1) * 100);
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}:${centiseconds.toString().padStart(2, '0')}`;
        seconds += 0.01;
    }

    function startTimer(timerElement) {
        seconds = 0;
        updateTimer(timerElement);
        timerInterval = setInterval(() => updateTimer(timerElement), 10);
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }


    // 图片悬停效果
    const CharacterImages = document.querySelectorAll('.bar-img');
    CharacterImages.forEach(img => {
        img.classList.add('inactive');
        const hoverSrc = img.getAttribute('data-hover');
        const originalSrc = img.src;

        img.addEventListener('mouseover', function () {
            img.src = hoverSrc;
        });

        img.addEventListener('mouseout', function () {
            img.src = originalSrc;
        });
        // 图片点击效果
        img.addEventListener('click', function () {
            // 切换active状态
            this.classList.add('active');
            this.classList.remove('inactive');

            // 使用统一的playVoice函数播放语音
            const imgName = originalSrc.split('/').pop();
            playVoice(imgName).finally(() => {
                // 播放结束切回inactive状态
                img.classList.remove('active');
                img.classList.add('inactive');
            });
        });
    });


    // 语音管理
    let activeAudios = [];

    function stopAllVoices() {
        activeAudios.forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
        activeAudios = [];
    }

    // 检查浏览器是否支持Audio API
    function isAudioSupported() {
        return typeof Audio !== 'undefined';
    }

    // 获取编码后的语音文件路径
    function getVoicePath(character, type) {
        try {
            // 处理两种情况：完整路径(source/美咕噜.jpg)或单纯文件名(美咕噜.jpg)
            const baseName = character.includes('/') ? 
                character.split('/').pop().replace('.jpg', '') :
                character.replace('.jpg', '');
            
            // 直接使用原文件名，不进行编码（文件系统能识别中文）
            return `source/${baseName}语音${type}.mp3`;
        } catch (e) {
            console.error('生成语音文件路径失败:', e);
            return null;
        }
    }

    // 播放语音函数
    function playVoice(character) {
        return new Promise((resolve) => {
            if (!isAudioSupported()) {
                console.warn('浏览器不支持Audio API');
                return resolve();
            }

            const voicePath = getVoicePath(character, 1);
            if (!voicePath) return resolve();

            try {
                const audio = new Audio(voicePath);
                activeAudios.push(audio);
                
                audio.play().catch(e => {
                    console.error('语音播放失败:', e, '文件路径:', voicePath);
                    activeAudios = activeAudios.filter(a => a !== audio);
                    resolve();
                });
                
                audio.addEventListener('ended', () => {
                    activeAudios = activeAudios.filter(a => a !== audio);
                    resolve();
                });
                
                audio.addEventListener('error', (e) => {
                    console.error('语音加载失败:', e, '文件路径:', voicePath);
                    activeAudios = activeAudios.filter(a => a !== audio);
                    resolve();
                });
            } catch (e) {
                console.error('语音播放异常:', e, '文件路径:', voicePath);
                resolve();
            }
        });
    }

    // 播放错误语音
    function playErrorVoice(character) {
        return new Promise((resolve) => {
            if (!isAudioSupported()) {
                console.warn('浏览器不支持Audio API');
                return resolve();
            }

            const voicePath = getVoicePath(character, 2);
            if (!voicePath) return resolve();

            try {
                const audio = new Audio(voicePath);
                activeAudios.push(audio);
                
                audio.play().catch(e => {
                    console.error('错误语音播放失败:', e, '文件路径:', voicePath);
                    activeAudios = activeAudios.filter(a => a !== audio);
                    resolve();
                });
                
                audio.addEventListener('ended', () => {
                    activeAudios = activeAudios.filter(a => a !== audio);
                    resolve();
                });
                
                audio.addEventListener('error', (e) => {
                    console.error('错误语音加载失败:', e, '文件路径:', voicePath);
                    activeAudios = activeAudios.filter(a => a !== audio);
                    resolve();
                });
            } catch (e) {
                console.error('错误语音播放异常:', e, '文件路径:', voicePath);
                resolve();
            }
        });
    }

    // 开始游戏逻辑
    function startGame(difficulty) {

        stopAllVoices();
        stopTimer();
        showPart(difficulty);

        const part = document.getElementById(difficulty);
        container = part.querySelector('.grid-container');
        const timerElement = part.querySelector('.timer');

        // 根据难度选择角色数量和每角色重复次数
        let selectedChars = [];
        let repeatCount = 0;
        if (difficulty === 'easy') {
            selectedChars = allImagePaths.slice(0, 3);
            repeatCount = 3; // 3*3=9格

            container.style.gridTemplateColumns = 'repeat(3, 1fr)';
            container.style.gridTemplateRows = 'repeat(3, 1fr)';
        } else if (difficulty === 'adv') {
            selectedChars = allImagePaths.slice(0, 7);
            repeatCount = 7; // 7*7=49格

            container.style.gridTemplateColumns = 'repeat(7, 1fr)';
            container.style.gridTemplateRows = 'repeat(7, 1fr)';
        }

        totalCorrect = selectedChars.length;
        foundCount = 0;

        // 准备图池
        let imagePool = [];
        selectedChars.forEach(char => {
            for (let i = 0; i < repeatCount; i++) {
                imagePool.push(char);
            }
        });

        // 洗牌
        for (let i = imagePool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [imagePool[i], imagePool[j]] = [imagePool[j], imagePool[i]];
        }

        // 清空容器
        container.innerHTML = '';


        // 渲染格子
        imagePool.forEach(imgSrc => {
            const div = document.createElement('div');
            div.classList.add('grid-item');
            div.dataset.character = imgSrc;

            const img = document.createElement('img');
            img.src = imgSrc;
            img.alt = imgSrc;
            img.classList.add('grid-img');
            div.appendChild(img);

            container.appendChild(div);
        });

        // 随机选一个角色为正确答案，播放语音提示
        correctCharacter = selectedChars[Math.floor(Math.random() * selectedChars.length)];
        playVoice(correctCharacter);

        // 启动计时器
        startTimer(timerElement);
    }

    // 游戏结束
    async function gameOver(win) {
        const finalSeconds = seconds; // 在停止计时前保存时间
        stopTimer();
        // 禁用所有图片点击
        document.querySelectorAll('.grid-item').forEach(item => {
            item.classList.add('disabled');
        });
        // 等待1s确保当前语音可以播放完成
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (win) {
            const finalTime = finalSeconds.toFixed(2);
            alert(`恭喜！你找到了所有 ${totalCorrect} 个正确角色！用时 ${finalTime}秒`);
        } else {
            alert('游戏失败，点错了角色！');
        }
        showPart('home');
    }

    // 点击事件代理：判断点击的格子
    document.body.addEventListener('click', e => {
        if (!container) return;
        const item = e.target.closest('.grid-item');
        if (!item) return;

        // 防止重复点击已找到的
        if (item.classList.contains('found')) return;

        // 获取角色并判断对错
        const character = item.dataset.character;
        if (character === correctCharacter) {
            playVoice(character);

            item.classList.add('found');
            item.classList.remove('error-click');
            foundCount++;
            if (foundCount === totalCorrect) {
                gameOver(true);
            }
        } else {
            stopAllVoices();
            playErrorVoice(character);

            item.classList.add('error');
            item.classList.add('error-click');
            item.classList.remove('found');
            gameOver(false);
        }
    });

    // 难度按钮点击事件
    document.querySelectorAll('button[difficult]').forEach(button => {
        button.addEventListener('click', () => {
            const diff = button.getAttribute('difficult');
            if (diff === 'home') {
                stopTimer();
                showPart('home');
            } else {
                startGame(diff);
            }
        });
    });
});