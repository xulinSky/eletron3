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
          v-for="file in paginatedFiles"
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
    
    <el-pagination
      class="pagination"
      background
      layout="total, prev, pager, next, jumper"
      :current-page="currentPage"
      :page-size="pageSize"
      :total="sortedFiles.length"
      :hide-on-single-page="true"
      @current-change="handlePageChange"
    />

    <!-- <div class="actions">
      <el-button type="primary" @click="$router.push('/eletron')">创建新文件</el-button>
    </div> -->
  </div>
</template>

<script>
export default {
  name: 'FileList',
  data() {
    return {
      files: [],
      currentPage: 1,
      pageSize: 10
    };
  },
  computed: {
    sortedFiles() {
      // 按保存时间倒序排列（最新的在前）
      return [...this.files].sort((a, b) => {
        return new Date(b.saveTime) - new Date(a.saveTime);
      });
    },
    paginatedFiles() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.sortedFiles.slice(start, start + this.pageSize);
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
        this.adjustCurrentPage();
      } catch (error) {
        console.error('加载文件列表失败:', error);
        this.files = [];
        this.currentPage = 1;
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
          this.adjustCurrentPage();
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
    },
    handlePageChange(page) {
      this.currentPage = page;
    },
    adjustCurrentPage() {
      const totalPages = Math.max(1, Math.ceil(this.sortedFiles.length / this.pageSize));
      if (this.currentPage > totalPages) {
        this.currentPage = totalPages;
      }
      if (this.currentPage < 1) {
        this.currentPage = 1;
      }
    }
  }
};
</script>

<style scoped>
.file-list-page {
  width: 100%;
  max-width: 1024px;
  margin: 0;
  padding: 20px 0 20px 20px;
  color: var(--color-text-primary);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.header {
  text-align: left;
  margin-bottom: 0;
  justify-content: space-between !important;
  display: flex;
  align-items: center;
}

.header h1 {
  color: var(--color-text-primary);
  font-size: 2.25rem;
  margin: 0;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-shadow: 0 0 18px rgba(56, 189, 248, 0.4);
}

.subtitle {
  color: var(--color-text-secondary);
  font-size: 1rem;
  opacity: 0.85;
}

.file-list-container {
  min-height: 440px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-elevated);
  backdrop-filter: blur(18px);
}

.file-list {
  --file-item-height: 72px;
  --file-item-gap: 12px;
  display: flex;
  flex-direction: column;
  gap: var(--file-item-gap);
  min-height: calc(var(--file-item-height) * 10 + var(--file-item-gap) * 9);
  align-items: stretch;
}

.file-item {
  position: relative;
  min-height: var(--file-item-height);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  background: linear-gradient(135deg, rgba(16, 29, 55, 0.85), rgba(11, 26, 48, 0.65));
  color: var(--color-text-primary);
}

.file-item:hover {
  transform: translateX(6px) translateY(-1px);
  border-color: var(--color-border);
  box-shadow: 0 16px 30px rgba(15, 118, 189, 0.25);
  background: linear-gradient(135deg, rgba(23, 54, 94, 0.95), rgba(12, 31, 59, 0.8));
}

.file-content {
  display: flex;
  align-items: center;
}

.file-icon {
  font-size: 2rem;
  margin-right: 15px;
  filter: drop-shadow(0 0 12px rgba(56, 189, 248, 0.4));
}

.file-info {
  flex: 1;
}

.file-name {
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 5px;
  letter-spacing: 0.02em;
}

.file-time {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.file-actions {
  display: flex;
  gap: 10px;
}

.actions {
  margin-top: 30px;
}

.pagination {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  padding: 10px;
  border-radius: 12px;
  background: rgba(11, 23, 45, 0.65);
  border: 1px solid rgba(56, 189, 248, 0.18);
  box-shadow: inset 0 0 12px rgba(56, 189, 248, 0.08);
}

::v-deep .file-list-container .el-card__body {
  background: transparent;
}

::v-deep .pagination .el-pagination__total,
::v-deep .pagination .el-pager li,
::v-deep .pagination .el-pagination__jump,
::v-deep .pagination .el-pagination__sizes .el-input__inner,
::v-deep .pagination .el-pagination__editor.el-input .el-input__inner {
  font-size: 16px;
}

::v-deep .pagination .el-pagination__sizes .el-input__inner,
::v-deep .pagination .el-pagination__editor.el-input .el-input__inner {
  background: linear-gradient(135deg, rgba(12, 28, 58, 0.85), rgba(9, 22, 46, 0.85));
  border: 1px solid rgba(56, 189, 248, 0.25);
  color: var(--color-text-primary);
  box-shadow: inset 0 0 12px rgba(56, 189, 248, 0.12);
}

::v-deep .pagination .btn-prev,
::v-deep .pagination .btn-next,
::v-deep .pagination .el-pager li {
  background: linear-gradient(135deg, rgba(16, 32, 64, 0.85), rgba(10, 24, 46, 0.85));
  border: 1px solid rgba(56, 189, 248, 0.25);
  color: var(--color-text-secondary);
  border-radius: 8px;
  transition: all 0.2s ease;
  box-shadow: 0 6px 16px rgba(8, 47, 73, 0.25);
}

::v-deep .pagination .btn-prev:hover,
::v-deep .pagination .btn-next:hover,
::v-deep .pagination .el-pager li:hover {
  color: var(--color-text-primary);
  border-color: rgba(56, 189, 248, 0.45);
  box-shadow: 0 10px 24px rgba(56, 189, 248, 0.28);
  background: linear-gradient(135deg, rgba(22, 54, 98, 0.95), rgba(14, 38, 76, 0.95));
}

::v-deep .pagination .el-pager li.active {
  color: var(--color-text-primary);
  border-color: rgba(56, 189, 248, 0.6);
  box-shadow: 0 12px 28px rgba(56, 189, 248, 0.35);
  background: linear-gradient(135deg, rgba(31, 82, 139, 0.95), rgba(16, 46, 92, 0.95));
}

::v-deep .pagination .el-pagination__total,
::v-deep .pagination .el-pagination__jump {
  color: var(--color-text-secondary);
}

::v-deep .file-item .el-card__body {
  background: transparent;
}

::v-deep .el-empty__description {
  color: var(--color-text-secondary);
}

::v-deep .el-button--primary {
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.9), rgba(59, 130, 246, 0.85));
  border: none;
  box-shadow: 0 10px 24px rgba(56, 189, 248, 0.35);
}

::v-deep .el-button--danger {
  border: none;
  background: linear-gradient(135deg, rgba(248, 113, 113, 0.9), rgba(248, 113, 113, 0.6));
  box-shadow: 0 10px 18px rgba(248, 113, 113, 0.25);
}
</style>

