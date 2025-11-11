<template>
  <div class="reliability-page">
    <header class="page-header">
      <div class="title-block">
        <h1>可靠性计算</h1>
        <p>Reliability Assessment Workspace</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" icon="el-icon-refresh" @click="reset">重置</el-button>
        <el-button type="success" icon="el-icon-document" @click="exportReport">导出报告</el-button>
      </div>
    </header>

    <section class="calculation-section calculation-section--primary">
      <header class="section-header">
        <h2>计算一</h2>
        <p>系统级指标计算</p>
      </header>
      <div class="section-content">
        <el-row :gutter="20" class="metric-row">
          <el-col :span="8" v-for="metric in primaryMetrics" :key="metric.key">
            <el-card shadow="hover" class="metric-card">
              <div class="metric-card__header">
                <h3>{{ metric.title }}</h3>
                <el-tooltip :content="metric.description" placement="top">
                  <i class="el-icon-info"></i>
                </el-tooltip>
              </div>
              <div class="metric-card__body">
                <div class="metric-card__value">{{ metric.value }}</div>
                <div class="metric-card__unit">{{ metric.unit }}</div>
              </div>
              <div class="metric-card__footer">
                <el-progress :percentage="metric.confidence" :stroke-width="6" status="success"></el-progress>
              </div>
            </el-card>
          </el-col>
        </el-row>
        <el-divider></el-divider>
        <el-form label-position="top" :model="primaryForm" class="calculation-form">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="停电率 (次/年)">
                <el-input v-model.number="primaryForm.outageRate" placeholder="输入停电率"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="平均停电持续时间 (min)">
                <el-input v-model.number="primaryForm.outageDuration" placeholder="输入平均停电持续时间"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="系统冗余系数">
                <el-input-number v-model="primaryForm.redundancy" :min="1" :max="5" :step="0.1"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="关键元件可靠性备注">
                <el-input type="textarea" v-model="primaryForm.notes" :rows="3" placeholder="填写关键元件备注信息"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <div class="form-actions">
            <el-button type="primary" icon="el-icon-cpu" @click="calculatePrimary">计算系统指标</el-button>
            <el-button icon="el-icon-delete" @click="resetPrimary">清空</el-button>
          </div>
        </el-form>
      </div>
    </section>

    <section class="calculation-section calculation-section--secondary">
      <header class="section-header">
        <h2>计算二</h2>
        <p>设备级敏感性分析</p>
      </header>
      <div class="section-content">
        <el-row :gutter="20">
          <el-col :span="10">
            <el-card shadow="hover" class="analysis-card">
              <header>
                <h3>元件列表</h3>
                <el-button type="text" icon="el-icon-plus" @click="addComponent">添加元件</el-button>
              </header>
              <el-table :data="components" height="320" border class="analysis-table">
                <el-table-column prop="name" label="名称" width="140"></el-table-column>
                <el-table-column prop="type" label="类型" width="120"></el-table-column>
                <el-table-column prop="failureRate" label="故障率 (次/年)"></el-table-column>
                <el-table-column label="操作" width="120">
                  <template #default="scope">
                    <el-button type="text" size="mini" @click="editComponent(scope.$index)">编辑</el-button>
                    <el-button type="text" size="mini" @click="removeComponent(scope.$index)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
          <el-col :span="14">
            <el-card shadow="hover" class="analysis-card">
              <header>
                <h3>敏感性结果</h3>
                <el-button type="text" icon="el-icon-download" @click="exportSensitivity">导出数据</el-button>
              </header>
              <div class="analysis-result">
                <el-empty description="暂无计算结果" v-if="!sensitivityResults.length"></el-empty>
                <div v-else class="result-list">
                  <div class="result-item" v-for="result in sensitivityResults" :key="result.key">
                    <div class="result-item__title">{{ result.label }}</div>
                    <div class="result-item__value">{{ result.value }} <span>{{ result.unit }}</span></div>
                    <div class="result-item__bar">
                      <span :style="{ width: result.impact + '%' }"></span>
                    </div>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'ReliabilityCalc',
  data() {
    return {
      primaryMetrics: [
        {
          key: 'saidi',
          title: 'SAIDI',
          description: '平均停电持续时间指数',
          value: '23.4',
          unit: 'min/户·年',
          confidence: 78
        },
        {
          key: 'saifi',
          title: 'SAIFI',
          description: '平均停电频率指数',
          value: '0.42',
          unit: '次/户·年',
          confidence: 82
        },
        {
          key: 'caidi',
          title: 'CAIDI',
          description: '平均故障修复时间',
          value: '55',
          unit: 'min/次',
          confidence: 74
        }
      ],
      primaryForm: {
        outageRate: null,
        outageDuration: null,
        redundancy: 1.2,
        notes: ''
      },
      components: [
        { name: '主变压器', type: 'Transformer', failureRate: 0.0021 },
        { name: '柴油发电机', type: 'Generator', failureRate: 0.0035 },
        { name: '储能系统', type: 'Storage', failureRate: 0.0012 }
      ],
      sensitivityResults: []
    };
  },
  methods: {
    reset() {
      this.resetPrimary();
      this.components = [];
      this.sensitivityResults = [];
    },
    exportReport() {
      this.$message.info('报告导出功能开发中');
    },
    calculatePrimary() {
      this.$message.success('系统指标已重新计算');
      this.primaryMetrics = this.primaryMetrics.map(metric => ({
        ...metric,
        confidence: Math.min(100, metric.confidence + 2)
      }));
    },
    resetPrimary() {
      this.primaryForm = {
        outageRate: null,
        outageDuration: null,
        redundancy: 1.2,
        notes: ''
      };
    },
    addComponent() {
      this.components.push({
        name: '新元件',
        type: 'Custom',
        failureRate: 0.001
      });
    },
    editComponent(index) {
      this.$prompt('修改故障率', '编辑元件', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^\d*(\.\d+)?$/,
        inputErrorMessage: '请输入有效的数字'
      })
        .then(({ value }) => {
          this.$set(this.components, index, {
            ...this.components[index],
            failureRate: Number(value)
          });
          this.$message.success('已更新故障率');
        })
        .catch(() => {
          this.$message.info('已取消编辑');
        });
    },
    removeComponent(index) {
      this.components.splice(index, 1);
    },
    exportSensitivity() {
      this.$message.info('敏感性数据导出功能开发中');
    }
  }
};
</script>

<style scoped>
.reliability-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;
  padding: 10px 20px 30px;
  color: var(--color-text-primary);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, rgba(15, 32, 69, 0.85), rgba(12, 26, 52, 0.75));
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: 16px;
  padding: 18px 24px;
  box-shadow: var(--shadow-elevated);
}

.title-block h1 {
  margin: 0;
  font-size: 1.8rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-primary);
}

.title-block p {
  margin: 6px 0 0;
  color: var(--color-text-secondary);
  letter-spacing: 0.18em;
  font-size: 0.85rem;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.calculation-section {
  background: linear-gradient(180deg, rgba(6, 16, 38, 0.9), rgba(9, 22, 43, 0.82));
  border: 1px solid rgba(56, 189, 248, 0.12);
  border-radius: 18px;
  box-shadow: 0 20px 46px rgba(8, 47, 73, 0.45);
  overflow: hidden;
}

.calculation-section--primary {
  flex: 1 1 auto;
}

.calculation-section--secondary {
  flex: 1 1 auto;
}

.section-header {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(56, 189, 248, 0.15);
  background: linear-gradient(135deg, rgba(12, 29, 62, 0.85), rgba(9, 22, 46, 0.8));
  display: flex;
  align-items: baseline;
  gap: 16px;
}

.section-header h2 {
  margin: 0;
  font-size: 1.4rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-primary);
}

.section-header p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  letter-spacing: 0.14em;
}

.section-content {
  padding: 24px;
}

.metric-row {
  margin-bottom: 20px;
}

.metric-card {
  background: linear-gradient(135deg, rgba(14, 35, 72, 0.92), rgba(10, 26, 55, 0.85));
  border: 1px solid rgba(56, 189, 248, 0.18);
  border-radius: 16px;
  height: 100%;
}

.metric-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  color: var(--color-text-primary);
}

.metric-card__header h3 {
  margin: 0;
  font-size: 1rem;
  letter-spacing: 0.08em;
}

.metric-card__header i {
  color: var(--color-accent);
}

.metric-card__body {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.metric-card__value {
  font-size: 2rem;
  font-weight: 600;
  color: var(--color-text-primary);
  text-shadow: 0 0 14px rgba(56, 189, 248, 0.35);
}

.metric-card__unit {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.metric-card__footer {
  margin-top: 16px;
}

.calculation-form {
  margin-top: 16px;
  background: rgba(10, 24, 48, 0.6);
  padding: 20px;
  border-radius: 16px;
  border: 1px solid rgba(56, 189, 248, 0.12);
  box-shadow: inset 0 0 18px rgba(56, 189, 248, 0.08);
}

.form-actions {
  margin-top: 12px;
  display: flex;
  gap: 12px;
}

.analysis-card {
  background: linear-gradient(135deg, rgba(12, 26, 54, 0.92), rgba(9, 20, 42, 0.82));
  border: 1px solid rgba(56, 189, 248, 0.15);
  border-radius: 18px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.analysis-card header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  color: var(--color-text-primary);
}

.analysis-card header h3 {
  margin: 0;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.analysis-card header .el-button {
  color: var(--color-accent);
}

.analysis-table {
  border-radius: 12px;
  overflow: hidden;
}

.analysis-result {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(8, 18, 36, 0.7);
  border-radius: 12px;
  border: 1px solid rgba(56, 189, 248, 0.1);
  padding: 20px;
}

.result-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-item {
  background: rgba(12, 32, 64, 0.75);
  border-radius: 12px;
  padding: 12px 16px;
  border: 1px solid rgba(56, 189, 248, 0.14);
}

.result-item__title {
  font-size: 0.95rem;
  color: var(--color-text-primary);
  margin-bottom: 6px;
}

.result-item__value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.result-item__value span {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin-left: 6px;
}

.result-item__bar {
  margin-top: 10px;
  height: 6px;
  background: rgba(56, 189, 248, 0.2);
  border-radius: 999px;
  overflow: hidden;
}

.result-item__bar span {
  display: block;
  height: 100%;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.9), rgba(129, 140, 248, 0.9));
  border-radius: 999px;
  box-shadow: 0 8px 16px rgba(56, 189, 248, 0.25);
}

::v-deep .el-button--primary {
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.92), rgba(59, 130, 246, 0.88));
  border: none;
  box-shadow: 0 12px 28px rgba(56, 189, 248, 0.32);
}

::v-deep .el-button--success {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.92), rgba(5, 150, 105, 0.88));
  border: none;
  box-shadow: 0 12px 28px rgba(16, 185, 129, 0.32);
}

::v-deep .el-button--text {
  color: var(--color-accent);
}
</style>
