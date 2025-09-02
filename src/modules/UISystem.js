import * as THREE from 'three';

export class UISystem {
    constructor(fourjs) {
        this.fourjs = fourjs;
        this.panels = [];
        this.fps = 0;
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.uiContainer = null;
        this.initUI();
    }

    initUI() {
        // Create UI container
        this.uiContainer = document.createElement('div');
        this.uiContainer.id = 'fourjs-ui';
        this.uiContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1000;
            font-family: 'Courier New', monospace;
        `;
        document.body.appendChild(this.uiContainer);
    }

    // Show FPS counter
    showFPS(options = {}) {
        const config = {
            position: 'top-left',
            color: '#00ff00',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            fontSize: '14px',
            ...options
        };

        const fpsPanel = document.createElement('div');
        fpsPanel.id = 'fps-panel';
        fpsPanel.style.cssText = `
            position: absolute;
            ${this.getPositionCSS(config.position)}
            color: ${config.color};
            background: ${config.backgroundColor};
            padding: 8px 12px;
            border-radius: 4px;
            font-size: ${config.fontSize};
            pointer-events: auto;
            min-width: 80px;
        `;
        fpsPanel.innerHTML = 'FPS: --';

        this.uiContainer.appendChild(fpsPanel);
        this.fpsPanel = fpsPanel;

        return fpsPanel;
    }

    // Info panel for displaying data
    infoPanel(options = {}) {
        const config = {
            title: 'Info',
            data: {},
            position: 'top-right',
            color: '#ffffff',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            fontSize: '12px',
            width: '200px',
            ...options
        };

        const panel = document.createElement('div');
        panel.className = 'info-panel';
        panel.style.cssText = `
            position: absolute;
            ${this.getPositionCSS(config.position)}
            color: ${config.color};
            background: ${config.backgroundColor};
            padding: 12px;
            border-radius: 6px;
            font-size: ${config.fontSize};
            pointer-events: auto;
            width: ${config.width};
            border: 1px solid rgba(255, 255, 255, 0.2);
        `;

        const title = document.createElement('div');
        title.style.cssText = `
            font-weight: bold;
            margin-bottom: 8px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.3);
            padding-bottom: 4px;
        `;
        title.textContent = config.title;

        const content = document.createElement('div');
        content.className = 'panel-content';

        panel.appendChild(title);
        panel.appendChild(content);
        this.uiContainer.appendChild(panel);

        const panelObj = {
            element: panel,
            content: content,
            data: config.data,
            update: (newData) => {
                panelObj.data = { ...panelObj.data, ...newData };
                panelObj.render();
            },
            render: () => {
                content.innerHTML = '';
                Object.entries(panelObj.data).forEach(([key, value]) => {
                    const row = document.createElement('div');
                    row.style.cssText = `
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 4px;
                    `;
                    row.innerHTML = `
                        <span>${key}:</span>
                        <span style="color: #00ff88;">${value}</span>
                    `;
                    content.appendChild(row);
                });
            }
        };

        panelObj.render();
        this.panels.push(panelObj);
        return panelObj;
    }

    // Interactive controls panel
    controlPanel(options = {}) {
        const config = {
            title: 'Controls',
            controls: {},
            position: 'bottom-left',
            color: '#ffffff',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            fontSize: '12px',
            width: '250px',
            ...options
        };

        const panel = document.createElement('div');
        panel.className = 'control-panel';
        panel.style.cssText = `
            position: absolute;
            ${this.getPositionCSS(config.position)}
            color: ${config.color};
            background: ${config.backgroundColor};
            padding: 12px;
            border-radius: 6px;
            font-size: ${config.fontSize};
            pointer-events: auto;
            width: ${config.width};
            border: 1px solid rgba(255, 255, 255, 0.2);
        `;

        const title = document.createElement('div');
        title.style.cssText = `
            font-weight: bold;
            margin-bottom: 8px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.3);
            padding-bottom: 4px;
        `;
        title.textContent = config.title;

        const content = document.createElement('div');
        content.className = 'control-content';

        panel.appendChild(title);
        panel.appendChild(content);
        this.uiContainer.appendChild(panel);

        const controlObj = {
            element: panel,
            content: content,
            controls: config.controls,
            callbacks: {},
            addSlider: (name, min, max, value, callback) => {
                const container = document.createElement('div');
                container.style.marginBottom = '8px';

                const label = document.createElement('label');
                label.textContent = name;
                label.style.display = 'block';
                label.style.marginBottom = '4px';

                const slider = document.createElement('input');
                slider.type = 'range';
                slider.min = min;
                slider.max = max;
                slider.value = value;
                slider.style.width = '100%';

                const valueDisplay = document.createElement('span');
                valueDisplay.textContent = value;
                valueDisplay.style.color = '#00ff88';
                valueDisplay.style.float = 'right';

                slider.addEventListener('input', (e) => {
                    const val = parseFloat(e.target.value);
                    valueDisplay.textContent = val.toFixed(2);
                    if (callback) callback(val);
                });

                container.appendChild(label);
                container.appendChild(slider);
                container.appendChild(valueDisplay);
                content.appendChild(container);

                controlObj.callbacks[name] = callback;
            },
            addButton: (name, callback) => {
                const button = document.createElement('button');
                button.textContent = name;
                button.style.cssText = `
                    width: 100%;
                    padding: 6px;
                    margin-bottom: 8px;
                    background: rgba(0, 255, 136, 0.2);
                    border: 1px solid #00ff88;
                    color: #ffffff;
                    border-radius: 3px;
                    cursor: pointer;
                `;

                button.addEventListener('click', callback);
                button.addEventListener('mouseenter', () => {
                    button.style.background = 'rgba(0, 255, 136, 0.4)';
                });
                button.addEventListener('mouseleave', () => {
                    button.style.background = 'rgba(0, 255, 136, 0.2)';
                });

                content.appendChild(button);
                controlObj.callbacks[name] = callback;
            },
            addCheckbox: (name, checked, callback) => {
                const container = document.createElement('div');
                container.style.cssText = `
                    display: flex;
                    align-items: center;
                    margin-bottom: 8px;
                `;

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = checked;
                checkbox.style.marginRight = '8px';

                const label = document.createElement('label');
                label.textContent = name;
                label.style.cursor = 'pointer';

                checkbox.addEventListener('change', (e) => {
                    if (callback) callback(e.target.checked);
                });

                label.addEventListener('click', () => {
                    checkbox.checked = !checkbox.checked;
                    if (callback) callback(checkbox.checked);
                });

                container.appendChild(checkbox);
                container.appendChild(label);
                content.appendChild(container);

                controlObj.callbacks[name] = callback;
            }
        };

        this.panels.push(controlObj);
        return controlObj;
    }

    // Loading screen
    showLoadingScreen(options = {}) {
        const config = {
            message: 'Loading...',
            color: '#ffffff',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            spinnerColor: '#00ff88',
            ...options
        };

        const loadingScreen = document.createElement('div');
        loadingScreen.id = 'loading-screen';
        loadingScreen.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: ${config.backgroundColor};
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: ${config.color};
            font-size: 18px;
            pointer-events: auto;
            z-index: 2000;
        `;

        const spinner = document.createElement('div');
        spinner.style.cssText = `
            width: 40px;
            height: 40px;
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid ${config.spinnerColor};
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
        `;

        const message = document.createElement('div');
        message.textContent = config.message;

        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);

        loadingScreen.appendChild(spinner);
        loadingScreen.appendChild(message);
        document.body.appendChild(loadingScreen);

        return {
            element: loadingScreen,
            updateMessage: (newMessage) => {
                message.textContent = newMessage;
            },
            hide: () => {
                document.body.removeChild(loadingScreen);
            }
        };
    }

    // Crosshair
    showCrosshair(options = {}) {
        const config = {
            size: 20,
            thickness: 2,
            color: '#ffffff',
            opacity: 0.8,
            ...options
        };

        const crosshair = document.createElement('div');
        crosshair.id = 'crosshair';
        crosshair.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            width: ${config.size}px;
            height: ${config.size}px;
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 1500;
        `;

        const horizontal = document.createElement('div');
        horizontal.style.cssText = `
            position: absolute;
            top: 50%;
            left: 0;
            width: 100%;
            height: ${config.thickness}px;
            background: ${config.color};
            opacity: ${config.opacity};
            transform: translateY(-50%);
        `;

        const vertical = document.createElement('div');
        vertical.style.cssText = `
            position: absolute;
            left: 50%;
            top: 0;
            width: ${config.thickness}px;
            height: 100%;
            background: ${config.color};
            opacity: ${config.opacity};
            transform: translateX(-50%);
        `;

        crosshair.appendChild(horizontal);
        crosshair.appendChild(vertical);
        this.uiContainer.appendChild(crosshair);

        return crosshair;
    }

    // Notification system
    showNotification(message, options = {}) {
        const config = {
            duration: 3000,
            type: 'info', // info, success, warning, error
            position: 'top-center',
            ...options
        };

        const colors = {
            info: '#00aaff',
            success: '#00ff88',
            warning: '#ffaa00',
            error: '#ff4444'
        };

        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.style.cssText = `
            position: absolute;
            ${this.getPositionCSS(config.position)}
            background: rgba(0, 0, 0, 0.9);
            color: ${colors[config.type]};
            padding: 12px 20px;
            border-radius: 6px;
            border-left: 4px solid ${colors[config.type]};
            font-size: 14px;
            pointer-events: auto;
            transform: translateY(-20px);
            opacity: 0;
            transition: all 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;
        notification.textContent = message;

        this.uiContainer.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateY(0)';
            notification.style.opacity = '1';
        }, 10);

        // Auto remove
        setTimeout(() => {
            notification.style.transform = 'translateY(-20px)';
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    this.uiContainer.removeChild(notification);
                }
            }, 300);
        }, config.duration);

        return notification;
    }

    // Helper function to get CSS positioning
    getPositionCSS(position) {
        const positions = {
            'top-left': 'top: 10px; left: 10px;',
            'top-center': 'top: 10px; left: 50%; transform: translateX(-50%);',
            'top-right': 'top: 10px; right: 10px;',
            'center-left': 'top: 50%; left: 10px; transform: translateY(-50%);',
            'center': 'top: 50%; left: 50%; transform: translate(-50%, -50%);',
            'center-right': 'top: 50%; right: 10px; transform: translateY(-50%);',
            'bottom-left': 'bottom: 10px; left: 10px;',
            'bottom-center': 'bottom: 10px; left: 50%; transform: translateX(-50%);',
            'bottom-right': 'bottom: 10px; right: 10px;'
        };
        return positions[position] || positions['top-left'];
    }

    // Update FPS counter
    updateFPS() {
        this.frameCount++;
        const now = performance.now();
        
        if (now - this.lastTime >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (now - this.lastTime));
            this.frameCount = 0;
            this.lastTime = now;
            
            if (this.fpsPanel) {
                this.fpsPanel.innerHTML = `FPS: ${this.fps}`;
            }
        }
    }

    // Update all UI elements
    update(deltaTime) {
        this.updateFPS();
        
        // Update info panels with scene stats if they exist
        this.panels.forEach(panel => {
            if (panel.data && panel.data.objects !== undefined) {
                const stats = this.fourjs.getStats();
                panel.update(stats);
            }
        });
    }

    // Hide all UI elements
    hideAll() {
        if (this.uiContainer) {
            this.uiContainer.style.display = 'none';
        }
    }

    // Show all UI elements
    showAll() {
        if (this.uiContainer) {
            this.uiContainer.style.display = 'block';
        }
    }

    // Remove specific panel
    removePanel(panel) {
        if (panel.element && panel.element.parentNode) {
            this.uiContainer.removeChild(panel.element);
        }
        const index = this.panels.indexOf(panel);
        if (index > -1) {
            this.panels.splice(index, 1);
        }
    }

    // Clear all panels
    clearPanels() {
        this.panels.forEach(panel => {
            if (panel.element && panel.element.parentNode) {
                this.uiContainer.removeChild(panel.element);
            }
        });
        this.panels = [];
    }

    // Cleanup
    dispose() {
        if (this.uiContainer && this.uiContainer.parentNode) {
            document.body.removeChild(this.uiContainer);
        }
    }
}
