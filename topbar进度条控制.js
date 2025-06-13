document.addEventListener('DOMContentLoaded', () => {
    const 角色导航栏 = document.querySelector(".topbar");
    const 进度条 = document.querySelector(".topbar进度条");
    const 进度点 = document.querySelector('div[data-进度点]');
    let 滚动 = false;
    const 滚动灵敏度 = 1.75;
    if (!角色导航栏 || !进度条 || !进度点) return;
    角色导航栏.addEventListener("wheel", (事件) => {
        事件.preventDefault();
        const 目标滚动位置 = 角色导航栏.scrollLeft + 事件.deltaY * 滚动灵敏度;
        const 滚动步骤 = () => {
            if (Math.abs(角色导航栏.scrollLeft - 目标滚动位置) > 0.1) {
                角色导航栏.scrollLeft += (目标滚动位置 - 角色导航栏.scrollLeft) * 0.3;
                requestAnimationFrame(滚动步骤);
            } else {
                角色导航栏.scrollLeft = 目标滚动位置;
            }
            更新进度条();
        };
        if (!滚动) {
            滚动 = true;
            滚动步骤();
            setTimeout(() => (滚动 = false), 1);
        }
    });
    function 更新进度条() {
        const scrollLeft = 角色导航栏.scrollLeft;
        const clientWidth = 角色导航栏.clientWidth;
        const scrollWidth = 角色导航栏.scrollWidth;
        const 进度 = scrollLeft / (scrollWidth - clientWidth);
        const 进度值 = Math.max(0, Math.min(1, 进度));
        进度条.style.setProperty('--after-left', `${-1 + 93 * 进度值}%`);
        const 容器宽度 = 进度条.offsetWidth;
        const 点宽度 = 进度点.offsetWidth;
        const 可移动范围 = 容器宽度 - 点宽度;
        const 进度点left值 = 进度值 * 可移动范围;
        进度点.style.left = `${Math.min(Math.max(进度点left值, 0), 可移动范围)}px`;
    }
    let 是否拖拽 = false;
    let 起始X坐标 = 0;
    let 起始滚动位置 = 0;
    const 拖拽处理 = (e) => {
        if (!是否拖拽) return;
        e.preventDefault();
        const 移动距离 = e.clientX - 起始X坐标;
        const 新滚动位置 = 起始滚动位置 - 移动距离 * 2;
        角色导航栏.scrollLeft = Math.max(0, Math.min(新滚动位置,角色导航栏.scrollWidth - 角色导航栏.clientWidth));
        更新进度条();
    };
    const 结束拖拽 = () => {
        是否拖拽 = false;
        document.removeEventListener('mousemove', 拖拽处理);
        document.removeEventListener('mouseup', 结束拖拽);
    };
    进度点.addEventListener('mousedown', (e) => {
        e.preventDefault();
        是否拖拽 = true;
        起始X坐标 = e.clientX;
        起始滚动位置 = 角色导航栏.scrollLeft;
        document.addEventListener('mousemove', 拖拽处理);
        document.addEventListener('mouseup', 结束拖拽);
    });
    window.addEventListener('resize', 更新进度条);
    更新进度条();
});
