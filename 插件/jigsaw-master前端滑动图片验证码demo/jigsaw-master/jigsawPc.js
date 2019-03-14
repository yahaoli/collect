(function (window) {
    var l = 42, // 滑块边长
        r = 10, // 滑块半径
        w = 310, // canvas宽度
        h = 155, // canvas高度
        PI = Math.PI
    var L = l + r * 2 // 滑块实际边长
    var oPosition = {}; //触点位置
    function getRandomNumberByRange(start, end) {
        return Math.round(Math.random() * (end - start) + start)
    }

    function createCanvas(width, height) {
        var canvas = createElement('canvas')
        canvas.width = width
        canvas.height = height
        return canvas
    }

    function createImg(onload) {
        var img = createElement('img')
        img.crossOrigin = "Anonymous"
        img.onload = onload
        img.onerror = () => {
            img.src = getRandomImg()
        }
        img.src = getRandomImg()
        return img
    }

    function createElement(tagName) {
        return document.createElement(tagName)
    }

    function addClass(tag, className) {
        tag.classList.add(className)
    }

    function removeClass(tag, className) {
        tag.classList.remove(className)
    }

    function getRandomImg() {
        return 'https://picsum.photos/300/150/?image=' + getRandomNumberByRange(0, 1084)
    }

    function draw(ctx, operation, x, y) {
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x + l / 2, y)
        ctx.arc(x + l / 2, y - r + 2, r, 0, 2 * PI)
        ctx.lineTo(x + l / 2, y)
        ctx.lineTo(x + l, y)
        ctx.lineTo(x + l, y + l / 2)
        ctx.arc(x + l + r - 2, y + l / 2, r, 0, 2 * PI)
        ctx.lineTo(x + l, y + l / 2)
        ctx.lineTo(x + l, y + l)
        ctx.lineTo(x, y + l)
        ctx.lineTo(x, y)
        ctx.fillStyle = '#fff'
        ctx[operation]()
        ctx.beginPath()
        ctx.arc(x, y + l / 2, r, 1.5 * PI, 0.5 * PI)
        ctx.globalCompositeOperation = "xor"
        ctx.fill()
    }

    function sum(x, y) {
        return x + y
    }

    function square(x) {
        return x * x
    }

    class jigsaw {
        constructor({el, onSuccess, onFail, onRefresh}) {
            this.el = el
            this.onSuccess = onSuccess
            this.onFail = onFail
            this.onRefresh = onRefresh
        }

        init() {
            this.initDOM()
            this.initImg()
            this.draw()
            this.bindEvents()
        }

        initDOM() {
            var canvas = createCanvas(w, h) // 画布
            var block = canvas.cloneNode(true) // 滑块
            var sliderContainer = createElement('div')
            var refreshIcon = createElement('div')
            var sliderMask = createElement('div')
            var slider = createElement('div')
            var sliderIcon = createElement('span')
            var text = createElement('span')

            block.className = 'block'
            sliderContainer.className = 'sliderContainer'
            refreshIcon.className = 'refreshIcon'
            sliderMask.className = 'sliderMask'
            slider.className = 'slider'
            sliderIcon.className = 'sliderIcon'
            text.innerHTML = '向右滑动滑块填充拼图'
            text.className = 'sliderText'

            var el = this.el
            var oFragmeng = document.createDocumentFragment?document.createDocumentFragment():createElement('div');//性能优化创建文档碎片
            slider.appendChild(sliderIcon)
            sliderMask.appendChild(slider)
            sliderContainer.appendChild(sliderMask)
            sliderContainer.appendChild(text)
            oFragmeng.appendChild(canvas)
            oFragmeng.appendChild(refreshIcon)
            oFragmeng.appendChild(block)
            oFragmeng.appendChild(sliderContainer)
            el.appendChild(oFragmeng)
            this.canvas=canvas
            this.block=block
            this.sliderContainer=sliderContainer
            this.refreshIcon=refreshIcon
            this.slider=slider
            this.sliderMask=sliderMask
            this.sliderIcon=sliderIcon
            this.text=text
            this.canvasCtx=canvas.getContext('2d')
            this.blockCtx=block.getContext('2d')
        }

        initImg() {
            var img = createImg(() => {
                this.canvasCtx.drawImage(img, 0, 0, w, h)
                this.blockCtx.drawImage(img, 0, 0, w, h)
                var y = this.y - r * 2 + 2
                var ImageData = this.blockCtx.getImageData(this.x, y, L, L)
                this.block.width = L
                this.blockCtx.putImageData(ImageData, 0, y)
            })
            this.img = img
        }

        draw() {
            // 随机创建滑块的位置
            this.x = getRandomNumberByRange(L + 10, w - (L + 10))
            this.y = getRandomNumberByRange(10 + r * 2, h - (L + 10))
            draw(this.canvasCtx, 'fill', this.x, this.y)
            draw(this.blockCtx, 'clip', this.x, this.y)
        }

        clean() {
            this.canvasCtx.clearRect(0, 0, w, h)
            this.blockCtx.clearRect(0, 0, w, h)
            this.block.width = w
        }

        bindEvents() {
            this.el.onselectstart = () => false
            this.refreshIcon.onclick = () => {
                this.reset()
                typeof this.onRefresh === 'function' && this.onRefresh()
            }
            //获取触点位置
            function touchPos(e) {
                oPosition.x = e.clientX||e.pageX;
                oPosition.y = e.clientX||e.pageY;
                return oPosition;
            }

            var  originX, originY, trail = [], isMouseDown = false
            this.slider.addEventListener('mousedown', function (e) {
                touchPos(e);
                originX = oPosition.x, originY = oPosition.y
                isMouseDown = true
            },false)
            //防止拉出div块外
            document.addEventListener('mousemove', (e) => {
                if (!isMouseDown) return false
                touchPos(e);
                var moveX = oPosition.x - originX
                var moveY = oPosition.y - originY
                if (moveX < 0 || moveX + 38 >= w) return false
                this.slider.style.left = moveX + 'px'
                var blockLeft = (w - 40 - 20) / (w - 40) * moveX
                this.block.style.left = blockLeft + 'px'

                addClass(this.sliderContainer, 'sliderContainer_active')
                this.sliderMask.style.width = moveX + 'px'
                trail.push(moveY)
            },false)
            //防止拉出div块外
            document.addEventListener('mouseup', (e) => {
                if (!isMouseDown) return false
                isMouseDown = false
                touchPos(e);
                if (oPosition.x === originX) return false
                removeClass(this.sliderContainer, 'sliderContainer_active')
                this.trail = trail
                var {spliced, TuringTest} = this.verify()
                if (spliced) {
                    if (TuringTest) {
                        addClass(this.sliderContainer, 'sliderContainer_success')
                        typeof this.onSuccess === 'function' && this.onSuccess()
                    } else {
                        addClass(this.sliderContainer, 'sliderContainer_fail')
                        this.text.innerHTML = '再试一次'
                        this.reset()
                    }
                } else {
                    addClass(this.sliderContainer, 'sliderContainer_fail')
                    typeof this.onFail === 'function' && this.onFail()
                    setTimeout(() => {
                        this.reset()
                    }, 1000)
                }
            },false)
        }

        verify() {
            var arr = this.trail // 拖动时y轴的移动距离
            var average = arr.reduce(sum) / arr.length // 平均值
            var deviations = arr.map(x => x - average) // 偏差数组
            var stddev = Math.sqrt(deviations.map(square).reduce(sum) / arr.length) // 标准差
            var left = parseInt(this.block.style.left)
            return {
                spliced: Math.abs(left - this.x) < 10,
                TuringTest: average !== stddev, // 只是简单的验证拖动轨迹，相等时一般为0，表示可能非人为操作
            }
        }

        reset() {
            this.sliderContainer.className = 'sliderContainer'
            this.slider.style.left = 0
            this.block.style.left = 0
            this.sliderMask.style.width = 0
            this.clean()
            this.img.src = getRandomImg()
            this.draw()
        }

    }

    window.jigsaw = {
        init: function (opts) {
            return new jigsaw(opts).init()
        }
    }
}(window))
