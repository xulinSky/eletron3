<template>
  <div class="file-list-page">
    <div class="header">
      <h1>文件列表</h1>
    </div>
    
    <el-card class="file-list-container" shadow="hover">
      <el-empty v-if="files.length === 0" description="暂无保存的文件">
        <el-button type="primary" @click="$router.push('/eletron')">创建新文件</el-button>
      </el-empty>
      
      <div v-else class="file-list">
        <el-card
          v-for="file in sortedFiles"
          :key="file.id"
          class="file-item"
          shadow="hover"
          @click.native="openFile(file.id)"
        >
          <div class="file-content">
            <div class="file-icon">📄</div>
            <div class="file-info">
              <div class="file-name">{{ file.name }}</div>
              <div class="file-time">{{ formatTime(file.saveTime) }}</div>
            </div>
            <div class="file-actions">
              <el-button
                type="danger"
                icon="el-icon-delete"
                circle
                size="small"
                @click.stop="deleteFile(file.id)"
              ></el-button>
            </div>
          </div>
        </el-card>
      </div>
    </el-card>
    
    <div class="actions">
      <el-button type="primary" @click="$router.push('/eletron')">创建新文件</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FileList',
  data() {
    return {
      files: []
    };
  },
  computed: {
    sortedFiles() {
      // 按保存时间倒序排列（最新的在前）
      return [...this.files].sort((a, b) => {
        return new Date(b.saveTime) - new Date(a.saveTime);
      });
    }
  },
  mounted() {
    this.loadFiles();
  },
  methods: {
    loadFiles() {
      try {
        const files = localStorage.getItem('eletron_files');
        this.files = files ? JSON.parse(files) : [];
      } catch (error) {
        console.error('加载文件列表失败:', error);
        this.files = [];
      }
    },
    openFile(fileId) {
      // 跳转到编辑页面，并传递文件ID
      this.$router.push({
        name: 'Eletron',
        params: { fileId }
      });
    },
    deleteFile(fileId) {
      this.$confirm('确定要删除这个文件吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        try {
          const files = this.files.filter(f => f.id !== fileId);
          localStorage.setItem('eletron_files', JSON.stringify(files));
          this.loadFiles();
          this.$message.success('删除成功');
        } catch (error) {
          console.error('删除文件失败:', error);
          this.$message.error('删除失败，请重试');
        }
      }).catch(() => {
        // 用户取消删除
      });
    },
    formatTime(timeString) {
      try {
        const date = new Date(timeString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
      } catch (error) {
        return timeString;
      }
    }
  }
};
</script>

<style scoped>
.file-list-page {
  max-width: 900px;
  margin: 0;
  padding: 10px;
}

.header {
  text-align: center;
  margin-bottom: 30px;
  justify-content: left !important;
}

.header h1 {
  color: white;
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.subtitle {
  color: white;
  font-size: 1.1rem;
  opacity: 0.9;
}

.file-list-container {
  min-height: 400px;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.file-item {
  cursor: pointer;
  transition: all 0.3s ease;
}

.file-item:hover {
  transform: translateX(5px);
}

.file-content {
  display: flex;
  align-items: center;
}

.file-icon {
  font-size: 2rem;
  margin-right: 15px;
}

.file-info {
  flex: 1;
}

.file-name {
  font-size: 1.1rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 5px;
}

.file-time {
  font-size: 0.9rem;
  color: #666;
}

.file-actions {
  display: flex;
  gap: 10px;
}

.actions {
  margin-top: 30px;
}
</style>

