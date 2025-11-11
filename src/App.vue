<template>
  <div id="app">
    <el-container>
      <el-header class="header">
        <el-menu
          :default-active="activeIndex"
          mode="horizontal"
          class="nav-menu"
          background-color="rgba(255, 255, 255, 0.1)"
          text-color="#fff"
          active-text-color="#fff"
          router
        >
          <el-menu-item index="/">Eletron</el-menu-item>
          <el-menu-item index="/files">文件列表</el-menu-item>
        </el-menu>
      </el-header>
      <el-main class="main">
        <router-view></router-view>
      </el-main>
    </el-container>
  </div>
</template>

<script>
export default {
  name: 'App',
  computed: {
    activeIndex() {
      return this.$route.path;
    }
  }
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

#app {
  max-width: 1920px;
  margin: 0 auto;
}

.header {
  padding: 0 !important;
  display: flex;
  justify-content: center;
  align-items: center;
}

.nav-menu {
  border: none;
  width: 100%;
  display: flex;
  justify-content: center;
}

.nav-menu .el-menu-item {
  border-bottom: none;
}

.nav-menu .el-menu-item:hover {
  background-color: rgba(255, 255, 255, 0.2) !important;
}

.nav-menu .el-menu-item.is-active {
  background-color: rgba(255, 255, 255, 0.3) !important;
  border-bottom: 2px solid #fff;
}

.main {
  min-height: 400px;
  padding: 20px;
}
</style>


