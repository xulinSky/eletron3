<template>
  <div id="app">
    <el-container class="layout">
      <el-aside class="sidebar" width="240px">
        <div class="brand">
          <div class="brand-logo">⚡</div>
          <div class="brand-text">
            <h1>Eletron</h1>
            <p>Intelligent Grid Studio</p>
          </div>
        </div>
        <el-menu
          :default-active="activeIndex"
          class="nav-menu"
          background-color="transparent"
          text-color="var(--color-text-secondary)"
          active-text-color="var(--color-text-primary)"
          router
        >
          <el-menu-item index="/eletron3">
            <i class="el-icon-s-operation"></i>
            <span>图形编辑</span>
          </el-menu-item>
          <el-menu-item index="/eletron3/files">
            <i class="el-icon-document"></i>
            <span>文件列表</span>
          </el-menu-item>
          <el-menu-item index="/eletron3/reliability">
            <i class="el-icon-odometer"></i>
            <span>可靠性计算</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main class="main">
        <router-view />
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
:root {
  --color-bg: #050816;
  --color-bg-alt: #0b1225;
  --color-surface: rgba(13, 23, 47, 0.72);
  --color-surface-hover: rgba(24, 40, 75, 0.9);
  --color-border: rgba(88, 199, 236, 0.35);
  --color-accent: #38bdf8;
  --color-accent-soft: rgba(56, 189, 248, 0.18);
  --color-text-primary: #e2e8f0;
  --color-text-secondary: #94a3b8;
  --shadow-elevated: 0 12px 40px rgba(8, 47, 73, 0.45);
  --font-family-base: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-family-base);
  background: radial-gradient(circle at 20% -10%, rgba(56, 189, 248, 0.28), transparent 55%),
              radial-gradient(circle at 80% 0%, rgba(56, 248, 198, 0.25), transparent 45%),
              linear-gradient(135deg, var(--color-bg), var(--color-bg-alt));
  min-height: 100vh;
  color: var(--color-text-primary);
  background-attachment: fixed;
}

#app {
  width: 100%;
  height: 100vh;
}

.layout {
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(4, 9, 18, 0.92), rgba(8, 15, 32, 0.95));
  backdrop-filter: blur(20px);
  display: flex;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0px 20px;
  background: linear-gradient(180deg, rgba(6, 13, 31, 0.95), rgba(5, 12, 26, 0.92));
  box-shadow: 12px 0 40px rgba(5, 17, 37, 0.55);
  backdrop-filter: blur(18px);
  min-height: 100vh;
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 10px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(15, 32, 69, 0.85), rgba(12, 26, 52, 0.75));
  box-shadow: 0 12px 28px rgba(8, 47, 73, 0.35);
}

.brand-logo {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  background: rgba(56, 189, 248, 0.18);
  color: var(--color-accent);
  box-shadow: inset 0 0 12px rgba(56, 189, 248, 0.35);
}

.brand-text h1 {
  margin: 0;
  font-size: 1.35rem;
  color: var(--color-text-primary);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.brand-text p {
  margin: 2px 0 0;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.nav-menu {
  border: none;
  background-color: transparent !important;
  flex: 1;
}

.nav-menu .el-menu-item {
  border: none !important;
  border-radius: 10px;
  margin-bottom: 8px;
  height: 46px;
  line-height: 46px;
  transition: background-color 0.3s ease, box-shadow 0.3s ease, color 0.3s ease, transform 0.3s ease;
}

.nav-menu .el-menu-item:hover {
  background-color: rgba(18, 38, 72, 0.8) !important;
  color: var(--color-text-primary) !important;
  box-shadow: 0 10px 26px rgba(56, 189, 248, 0.25);
  transform: translateX(6px);
}

.nav-menu .el-menu-item.is-active {
  background-color: rgba(23, 52, 96, 0.92) !important;
  border-left: 3px solid var(--color-accent);
  color: var(--color-text-primary) !important;
  box-shadow: 0 12px 32px rgba(56, 189, 248, 0.28);
  transform: translateX(8px);
}

.main {
  flex: 1;
  width: auto;
  min-height: 400px;
  padding: 20px;
  background: linear-gradient(180deg, rgba(8, 13, 31, 0.72), rgba(9, 15, 33, 0.6));
  backdrop-filter: blur(16px);
}
</style>


