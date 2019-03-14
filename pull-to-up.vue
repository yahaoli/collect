<template>
  <div class="self-pull-up">
    <div class="pull-up-content" :class="{ 'is-dropped': topDropped}" :style="{ 'transform': transform }">
      <slot name="top">
        <div class="pull-up-top">
          <span v-show="topStatus !== 'loading'"  :class="{ 'self-rotate': topStatus === 'drop' }">↓</span>
          <span v-if="topStatus === 'loading'"  class="self-spinner-snake"></span>
        </div>
      </slot>
      <slot></slot>
    </div>
  </div>
</template>

<script>
    export default {
      name: 'pull-to-up',
      props: {
        maxDistance: {
          type: Number,
          default: 0
        },
        topDistance: {
          type: Number,
          default: 70
        },
        distanceIndex: {
          type: Number,
          default: 2
        },
        topMethod: {
          type: Function
        }
      },
      computed: {
        transform () {
          return this.translate === 0 ? null : 'translate3d(0, ' + this.translate + 'px, 0)'
        }
      },
      data () {
        return {
          topStatus: '',
          translate: 0,
          topDropped: false,
          scrollEventTarget: null,
          startY: 0,
          startScrollTop: 0,
          currentY: 0
        }
      },
      watch: {
        topStatus (val) {
          this.$emit('top-status-change', val)
        }
      },
      methods: {
        onTopLoaded () {
          this.translate = 0
          setTimeout(() => {
            this.topStatus = 'pull'
          }, 200)
        },
        bindTouchEvents () {
          this.$el.addEventListener('touchstart', this.handleTouchStart)
          this.$el.addEventListener('touchmove', this.handleTouchMove)
          this.$el.addEventListener('touchend', this.handleTouchEnd)
        },
        init () {
          this.topStatus = 'pull'
          this.scrollEventTarget = this.getScrollEventTarget(this.$el)
          if (typeof this.topMethod === 'function') {
            this.bindTouchEvents()
          }
        },
        getScrollEventTarget (element) {
          let currentNode = element
          while (currentNode && currentNode.tagName !== 'HTML' &&
          currentNode.tagName !== 'BODY' && currentNode.nodeType === 1) {
            let overflowY = document.defaultView.getComputedStyle(currentNode).overflowY
            if (overflowY === 'scroll' || overflowY === 'auto') {
              return currentNode
            }
            currentNode = currentNode.parentNode
          }
          return window
        },
        getScrollTop (element) {
          if (element === window) {
            return Math.max(window.pageYOffset || 0, document.documentElement.scrollTop)
          } else {
            return element.scrollTop
          }
        },
        handleTouchStart (event) {
          this.startY = event.touches[0].clientY
          this.startScrollTop = this.getScrollTop(this.scrollEventTarget)
          if (this.topStatus !== 'loading') {
            this.topStatus = 'pull'
            this.topDropped = false
          }
        },

        handleTouchMove (event) {
          if (this.startY < this.$el.getBoundingClientRect().top && this.startY > this.$el.getBoundingClientRect().bottom) {
            return
          }
          this.currentY = event.touches[0].clientY
          let distance = (this.currentY - this.startY) / this.distanceIndex
          if (typeof this.topMethod === 'function' &&
            this.getScrollTop(this.scrollEventTarget) === 0 && this.topStatus !== 'loading') {
            event.preventDefault()
            event.stopPropagation()
            if (this.maxDistance > 0) {
              this.translate = distance <= this.maxDistance ? distance - this.startScrollTop : this.translate
            } else {
              this.translate = distance - this.startScrollTop
            }
            if (this.translate < 0) {
              this.translate = 0
            }
            this.topStatus = this.translate >= this.topDistance ? 'drop' : 'pull'
          }
        },

        handleTouchEnd () {
          if (this.getScrollTop(this.scrollEventTarget) === 0 && this.translate > 0) {
            this.topDropped = true
            if (this.topStatus === 'drop') {
              this.translate = '50'
              this.topStatus = 'loading'
              this.topMethod()
            } else {
              this.translate = '0'
              this.topStatus = 'pull'
            }
          }
        }
      },
      mounted () {
        this.init()
      }
    }
</script>

<style>
.self-pull-up{
  overflow: hidden;
}
.pull-up-content.is-dropped {
  transition: .2s;
}
.self-rotate{
  transform: rotate(180deg);
}
.pull-up-top{
  height: 50px;/*no*/
  margin-top: -50px;/*no*/
  line-height: 50px;/*no*/
  text-align: center;/*no*/
  font-size: 16px;/*no*/
}
.pull-up-top span{
  display: inline-block;
  vertical-align: middle;
}
.self-spinner-snake {
  -webkit-animation: self-spinner-rotate 0.8s infinite linear;
  animation: self-spinner-rotate 0.8s infinite linear;
  border: 4px solid transparent;/*no*/
  border-radius: 50%;
  border-top-color: rgb(204, 204, 204);
  border-left-color: rgb(204, 204, 204);
  border-bottom-color: rgb(204, 204, 204);
  height: 28px;/*no*/
  width: 28px;/*no*/
  box-sizing: border-box;
}
@-webkit-keyframes self-spinner-rotate {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
@keyframes self-spinner-rotate {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
</style>
