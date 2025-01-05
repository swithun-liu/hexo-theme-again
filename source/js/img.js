class Pixel {
    constructor(canvas, context, x, y, color, speed, delay) {
      this.width = canvas.width;
      this.height = canvas.height;
      this.ctx = context;
      this.x = x;
      this.y = y;
      this.color = color;
      this.speed = this.getRandomValue(0.1, 0.9) * speed;
      this.size = 0;
      this.sizeStep = Math.random() * 0.4;
      this.minSize = 0.5;
      this.maxSizeInteger = 2;
      this.maxSize = this.getRandomValue(this.minSize, this.maxSizeInteger);
      this.delay = delay;
      this.counter = 0;
      this.counterStep = Math.random() * 4 + (this.width + this.height) * 0.01;
      this.isIdle = false;
      this.isReverse = false;
      this.isShimmer = false;
    }
  
    getRandomValue(min, max) {
      return Math.random() * (max - min) + min;
    }
  
    draw() {
      const centerOffset = this.maxSizeInteger * 0.5 - this.size * 0.5;
  
      this.ctx.fillStyle = this.color;
      this.ctx.fillRect(
        this.x + centerOffset,
        this.y + centerOffset,
        this.size,
        this.size
      );
    }
  
    appear() {
      this.isIdle = false;
  
      if (this.counter <= this.delay) {
        this.counter += this.counterStep;
        return;
      }
  
      if (this.size >= this.maxSize) {
        this.isShimmer = true;
      }
  
      if (this.isShimmer) {
        this.shimmer();
      } else {
        this.size += this.sizeStep;
      }
  
      this.draw();
    }
  
    disappear() {
      this.isShimmer = false;
      this.counter = 0;
  
      if (this.size <= 0) {
        this.isIdle = true;
        return;
      } else {
        this.size -= 0.1;
      }
  
      this.draw();
    }
  
    shimmer() {
      if (this.size >= this.maxSize) {
        this.isReverse = true;
      } else if (this.size <= this.minSize) {
        this.isReverse = false;
      }
  
      if (this.isReverse) {
        this.size -= this.speed;
      } else {
        this.size += this.speed;
      }
    }
  }
  
  class PixelCanvas extends HTMLElement {
    static register(tag = "pixel-canvas") {
      if ("customElements" in window) {
        customElements.define(tag, this);
      }
    }
  
    static css = `
      :host {
        display: grid;
        inline-size: 100%;
        block-size: 100%;
        overflow: hidden;
      }
    `;
  
    // get colors() {
    //   return ["#f8fafc", "#f1f5f9", "#cbd5e1"];
    // //   return this.dataset.colors?.split(",") || ["#f8fafc", "#f1f5f9", "#cbd5e1"];
    // }
      // 颜色组
  get colors() {
    const colorGroups = [
      ["#f8fafc", "#f1f5f9", "#cbd5e1"],    // 蓝色组
      ["#e0f2fe", "#7dd3fc", "#0ea5e9"],    // 另一组蓝色
      ["#f8fafc", "#ff6347", "#ff4500"],    // 橙色组
      ["#f8fafc", "#32cd32", "#228b22"],    // 绿色组
      ["#f8fafc", "#db7093", "#ff69b4"]     // 粉色组
    ];

    // 随机从颜色组中选择一个
    var i = Math.floor(Math.random() * colorGroups.length);
    console.log(i);
    console.log(colorGroups[i]);
    const randomGroup = colorGroups[i];
    
    return randomGroup;
  }
  
    get gap() {
      const value = this.dataset.gap || 5;
      const min = 4;
      const max = 50;
  
      if (value <= min) {
        return min;
      } else if (value >= max) {
        return max;
      } else {
        return parseInt(value);
      }
    }
  
    get speed() {
      const value = this.dataset.speed || 35;
      const min = 0;
      const max = 100;
      const throttle = 0.001;
  
      if (value <= min || this.reducedMotion) {
        return min;
      } else if (value >= max) {
        return max * throttle;
      } else {
        return parseInt(value) * throttle;
      }
    }
  
    get noFocus() {
      return this.hasAttribute("data-no-focus");
    }
  
    connectedCallback() {
      const canvas = document.createElement("canvas");
      const sheet = new CSSStyleSheet();
  
      this._parent = this.parentNode;
      this.shadowroot = this.attachShadow({ mode: "open" });
  
      sheet.replaceSync(PixelCanvas.css);
  
      this.shadowroot.adoptedStyleSheets = [sheet];
      this.shadowroot.append(canvas);
      this.canvas = this.shadowroot.querySelector("canvas");
      this.ctx = this.canvas.getContext("2d");
      this.timeInterval = 1000 / 60;
      this.timePrevious = performance.now();
      this.reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
  
      this.init();
  
      // 立即启动动画
      this.handleAnimation("appear");
    }
  
    disconnectedCallback() {
      delete this._parent;
    }
  
    handleAnimation(name) {
      cancelAnimationFrame(this.animation);
      this.animation = this.animate(name);
    }
  
    init() {
      const rect = this.getBoundingClientRect();
      const width = Math.floor(rect.width);
      const height = Math.floor(rect.height);
  
      this.pixels = [];
      this.canvas.width = width;
      this.canvas.height = height;
      this.canvas.style.width = `${width}px`;
      this.canvas.style.height = `${height}px`;
      this.createPixels();
    }
  
    getDistanceToCanvasCenter(x, y) {
      const dx = x - this.canvas.width / 2;
      const dy = y - this.canvas.height / 2;
      const distance = Math.sqrt(dx * dx + dy * dy);
  
      return distance;
    }
  
    // createPixels() {
    //   for (let x = 0; x < this.canvas.width; x += this.gap) {
    //     for (let y = 0; y < this.canvas.height; y += this.gap) {
    //       const color = this.colors[
    //         Math.floor(Math.random() * this.colors.length)
    //       ];
    //       const delay = this.reducedMotion
    //         ? 0
    //         : this.getDistanceToCanvasCenter(x, y);
  
    //       this.pixels.push(
    //         new Pixel(this.canvas, this.ctx, x, y, color, this.speed, delay)
    //       );
    //     }
    //   }
    // }

    createPixels() {
        // 随机选择一个颜色组
        const selectedColorGroup = this.colors;  // this.colors 已经是随机选择的组
      
        for (let x = 0; x < this.canvas.width; x += this.gap) {
          for (let y = 0; y < this.canvas.height; y += this.gap) {
            // 每个像素选择颜色组中的一个颜色
            const color = selectedColorGroup[Math.floor(Math.random() * selectedColorGroup.length)];
            const delay = this.reducedMotion
              ? 0
              : this.getDistanceToCanvasCenter(x, y);
      
            this.pixels.push(
              new Pixel(this.canvas, this.ctx, x, y, color, this.speed, delay)
            );
          }
        }
      }
  
    animate(fnName) {
      this.animation = requestAnimationFrame(() => this.animate(fnName));
  
      const timeNow = performance.now();
      const timePassed = timeNow - this.timePrevious;
  
      if (timePassed < this.timeInterval) return;
  
      this.timePrevious = timeNow - (timePassed % this.timeInterval);
  
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  
      for (let i = 0; i < this.pixels.length; i++) {
        this.pixels[i][fnName]();
      }
  
      // 检查所有像素是否已经静止，如果是，则停止动画
      if (this.pixels.every((pixel) => pixel.isIdle)) {
        cancelAnimationFrame(this.animation);
      }
    }
  }
  
  PixelCanvas.register();
