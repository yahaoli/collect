<template>
    <div id="app">
        <transition name="router-fade" mode="out-in">

            <router-view/>
        </transition>
    </div>
</template>

<style>
    #app {
        font-family: Avenir, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
    }

    body {
        font-size: 12px;
    }

    .router-fade-enter-active, .router-fade-leave-active {
      transition: opacity .3s ease;
    }
    .router-fade-enter, .router-fade-leave-active {
      opacity: 0;
    }
</style>
