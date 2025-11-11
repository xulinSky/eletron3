<template>
  <div class="eletron-page">
    <el-card class="toolbar" shadow="never">
      <el-row type="flex" justify="space-between" align="middle">
        <el-col :span="12">
          <h1>Eletron - 图形编辑器</h1>
        </el-col>
        <el-col :span="12" style="text-align: right;">
          <el-input
            v-model="fileName"
            placeholder="输入文件名"
            style="width: 200px; margin-right: 10px;"
            @keyup.enter.native="saveFile"
          ></el-input>
          <el-button type="primary" icon="el-icon-check" @click="saveFile">保存</el-button>
          <el-button type="danger" icon="el-icon-delete" @click="clearGraph">清空</el-button>
        </el-col>
      </el-row>
    </el-card>
    <div class="main-content">
      <!-- 左侧画布 -->
      <div class="canvas-area">
        <div 
          ref="graphContainer" 
          class="graph-container"
          tabindex="0"
          @keydown="handleKeyDown"
        ></div>
      </div>
      
      <!-- 右侧面板 -->
      <div class="sidebar">
        <!-- 上半部分：元件库 -->
        <el-card class="component-library" shadow="hover">
          <div slot="header">
            <h3>元件库</h3>
          </div>
          <el-row :gutter="10" class="component-list">
            <el-col
              v-for="component in componentLibrary"
              :key="component.type"
              :span="8"
            >
              <el-card
                class="component-item"
                shadow="hover"
                :draggable="true"
                @dragstart.native="handleDragStart($event, component)"
                @click.native="addComponentToCanvas(component)"
              >
                <div class="component-content">
                  <div class="component-icon" :style="{ backgroundColor: component.color }">
                    {{ component.icon }}
                  </div>
                  <div class="component-name">{{ component.name }}</div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </el-card>
        
        <!-- 下半部分：元件属性 -->
        <el-card class="property-panel" shadow="hover">
          <div slot="header">
            <h3>元件属性</h3>
          </div>
          <el-form v-if="selectedCell" label-width="120px" size="small">
            <el-divider>可靠性参数</el-divider>
            <el-form-item label="名称">
              <el-input
                v-model="cellProperties.value"
                @input="updateCellProperty('value', $event)"
              ></el-input>
            </el-form-item>
            <el-form-item v-for="prop in selectedComponentProps" :key="prop.key" :label="prop.key">
                <template v-if="prop.type === 'number'">
                  <el-input-number
                    v-model="prop.value"
                    :min="0"
                    :step="0.01"
                    @change="updateComponentProp(prop.key, prop.value)"
                    style="width: 100%;"
                  ></el-input-number>
                </template>
                <template v-else-if="prop.type === 'select'">
                  <el-select
                    v-model="prop.value"
                    placeholder="请选择"
                    @change="updateComponentProp(prop.key, prop.value)"
                    style="width: 100%;"
                  >
                    <el-option
                      v-for="opt in prop.options"
                      :key="opt"
                      :label="opt"
                      :value="opt"
                    ></el-option>
                  </el-select>
                </template>
                <template v-else>
                  <el-input
                    v-model="prop.value"
                    @input="updateComponentProp(prop.key, prop.value)"
                  ></el-input>
                </template>
            </el-form-item>
          </el-form>
          <el-empty v-else description="请选择一个元件来编辑属性" :image-size="80"></el-empty>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
import { Graph, InternalEvent } from '@maxgraph/core';

export default {
  name: 'Eletron',
  data() {
    return {
      graph: null,
      selectedCell: null,
      selectedComponentType: null,
      selectedComponentProps: [],
      cellProperties: {
        value: '',
        width: 120,
        height: 60,
        fillColor: '#E3F2FD',
        strokeColor: '#1976D2',
        strokeWidth: 2,
        arcSize: 10
      },
      // 元件库（来自 eletron.md）
      componentLibrary: [
        { type: 'mains', name: '市电', icon: '⚡', color: '#E3F2FD', defaultStyle: { shape: 'rectangle' }, props: [] },
        { type: 'diesel_gen', name: '柴油发电机', icon: '⛽', color: '#E8F5E9', defaultStyle: { shape: 'rectangle' }, props: [
          
          { key: '故障停运率(次/台年)', type: 'number', default: 0 },
          { key: '故障停电平均持续时间(min/次)', type: 'number', default: 0 },
          { key: '备用启动时间（min/次）', type: 'number', default: 5 },
          { key: '后备供电时间（min）', type: 'number', default: 720 }
        ]},
        { type: 'transformer', name: '变压器', icon: '🔌', color: '#FFF3E0', defaultStyle: { shape: 'rectangle' }, props: [
          
          { key: '故障停运率(次/台年)', type: 'number', default: 0.002 },
          { key: '平均故障修复时间(min/次)', type: 'number', default: 20 },
          { key: '预安排停运率(次/台年)', type: 'number', default: 0 },
          { key: '预安排停运平均持续时间(min/次)', type: 'number', default: 0 },
          { key: '故障定位时间(min/次)', type: 'number', default: 60 }
        ]},
        { type: 'busbar', name: '母线', icon: '═', color: '#F3E5F5', defaultStyle: { shape: 'rectangle' }, props: [
          
          { key: '平衡类型', type: 'select', default: '平衡', options: ['平衡','不平衡'] },
          { key: '故障停运率(次/条年)', type: 'number', default: 0 },
          { key: '故障停电平均持续时间(min/次)', type: 'number', default: 0 },
          { key: '预安排停运率(次/条年)', type: 'number', default: 0 },
          { key: '预安排停运平均持续时间(min/次)', type: 'number', default: 0 },
          { key: '故障定位时间(min/次)', type: 'number', default: 60 }
        ]},
        { type: 'switch', name: '开关', icon: '⏻', color: '#FFEBEE', defaultStyle: { shape: 'rectangle' }, props: [
          
          { key: '故障停运率(次/台年)', type: 'number', default: 0.0012 },
          { key: '平均故障修复时间(min/次)', type: 'number', default: 240 },
          { key: '联络开关', type: 'select', default: '否', options: ['否','是'] },
          { key: '馈线开关', type: 'select', default: '否', options: ['否','是'] },
          { key: '预安排停运率(次/台年)', type: 'number', default: 0 },
          { key: '预安排停运平均持续时间(min/次)', type: 'number', default: 0 },
          { key: '故障定位时间(min/次)', type: 'number', default: 60 },
          { key: '开关故障动作时间(min/次)', type: 'number', default: 20 },
          { key: '开关预安排停电隔离时间(min/次)', type: 'number', default: 20 },
          { key: '自动开关故障重合闸时间(min/次)', type: 'number', default: 30 },
          { key: '自动开关预安排重合闸时间(min/次)', type: 'number', default: 10 },
          { key: '转供线路功率余量(MW)', type: 'number', default: -1 },
          { key: '预安排转供线路功率余量(MW)', type: 'number', default: -1 }
        ]},
        { type: 'line', name: '线路', icon: '—', color: '#E3F2FD', defaultStyle: { shape: 'rectangle' }, props: [
          
          { key: '故障停运率(次/百公里*年)', type: 'number', default: 0.04 },
          { key: '平均故障修复时间(min/次)', type: 'number', default: 240 },
          { key: '预安排停运率(次/百公里*年)', type: 'number', default: 0.06 },
          { key: '预安排停运平均持续时间(min/次)', type: 'number', default: 300 },
          { key: '故障定位时间(min/次)', type: 'number', default: 60 }
        ]},
        { type: 'connector', name: '连接线路', icon: '⟷', color: '#E3F2FD', defaultStyle: { shape: 'rectangle' }, props: [] },
        { type: 'pv', name: '光伏', icon: '☀️', color: '#FFF3E0', defaultStyle: { shape: 'rectangle' }, props: [] },
        { type: 'wind', name: '风机', icon: '🌀', color: '#E8F5E9', defaultStyle: { shape: 'rectangle' }, props: [] },
        { type: 'storage', name: '储能', icon: '🔋', color: '#F3E5F5', defaultStyle: { shape: 'rectangle' }, props: [] },
        { type: 'ups', name: 'UPS', icon: '🔌', color: '#E3F2FD', defaultStyle: { shape: 'rectangle' }, props: [
          
          { key: '故障停运率(次/台年)', type: 'number', default: 0.0876 },
          { key: '平均故障修复时间(min/次)', type: 'number', default: 240 },
          { key: '运行模式', type: 'select', default: '在线双变换模式', options: ['在线双变换模式','ECO模式'] },
          { key: '旁路逆变转换故障动作时间（min/次）', type: 'number', default: 0 },
          { key: 'ECO模式转换故障动作时间（min/次）', type: 'number', default: 0 },
          { key: '故障定位时间(min/次)', type: 'number', default: 30 },
          { key: '后备供电时间（min）', type: 'number', default: 15 }
        ]},
        { type: 'ats', name: 'ATS', icon: '🔀', color: '#FFF3E0', defaultStyle: { shape: 'rectangle' }, props: [
          
          { key: '故障停运率(次/台年)', type: 'number', default: 0.0012 },
          { key: '平均故障修复时间(min/次)', type: 'number', default: 240 },
          { key: 'ATS故障动作时间（min/次）', type: 'number', default: 0 },
          { key: '故障定位时间(min/次)', type: 'number', default: 30 }
        ]},
        { type: 'sts', name: 'STS', icon: '↔️', color: '#FFEBEE', defaultStyle: { shape: 'rectangle' }, props: [
          
          { key: '故障停运率(次/台年)', type: 'number', default: 0.0012 },
          { key: '平均故障修复时间(min/次)', type: 'number', default: 240 },
          { key: 'STS故障动作时间（min/次）', type: 'number', default: 0 },
          { key: '故障定位时间(min/次)', type: 'number', default: 30 }
        ]},
        { type: 'reactor', name: '无功补偿器', icon: '∿', color: '#E3F2FD', defaultStyle: { shape: 'rectangle' }, props: [] },
        { type: 'load', name: '负荷', icon: '🏠', color: '#E8F5E9', defaultStyle: { shape: 'rectangle' }, props: [
          
          { key: '多电源负荷', type: 'select', default: '是', options: ['是','否'] },
          { key: '负荷备自投切时间(min/次)', type: 'number', default: 0 }
        ]},
      ],
      dragOffset: null,
      isDraggingOver: false,
      handleGlobalKeyDownBound: null,
      fileName: '',
      fileId: null
    };
  },
  mounted() {
    this.initGraph();
    // 添加全局键盘事件监听（用于删除功能）
    this.handleGlobalKeyDownBound = this.handleGlobalKeyDown.bind(this);
    document.addEventListener('keydown', this.handleGlobalKeyDownBound);
    
    // 检查是否有文件ID参数（从列表页面打开）
    // 使用 nextTick 确保 graph 已经初始化
    this.$nextTick(() => {
      const fileId = this.$route.params.fileId;
      if (fileId) {
        this.loadFileById(fileId);
      }
    });
  },
  beforeDestroy() {
    // 移除全局键盘事件监听
    if (this.handleGlobalKeyDownBound) {
      document.removeEventListener('keydown', this.handleGlobalKeyDownBound);
    }
    if (this.graph) {
      this.graph.destroy();
    }
  },
  methods: {
    initGraph() {
      const container = this.$refs.graphContainer;
      if (!container) return;

      // 禁用右键菜单
      InternalEvent.disableContextMenu(container);

      // 创建图形实例
      this.graph = new Graph(container);

      // 启用平移功能
      // 注意：maxGraph 默认使用右键或中键进行平移，左键用于拖动节点
      this.graph.setPanning(true);

      // 启用连接
      this.graph.setConnectable(true);

      // 启用节点拖动
      this.graph.setCellsMovable(true);

      // 设置默认顶点样式
      const defaultVertexStyle = this.graph.getStylesheet().getDefaultVertexStyle();
      defaultVertexStyle.shape = 'rectangle';
      defaultVertexStyle.fillColor = '#E3F2FD';
      defaultVertexStyle.strokeColor = '#1976D2';
      defaultVertexStyle.strokeWidth = 2;
      defaultVertexStyle.arcSize = 10;

      // 设置默认边样式
      const defaultEdgeStyle = this.graph.getStylesheet().getDefaultEdgeStyle();
      defaultEdgeStyle.edgeStyle = 'orthogonalEdgeStyle';
      defaultEdgeStyle.rounded = true;
      defaultEdgeStyle.strokeColor = '#333';
      defaultEdgeStyle.strokeWidth = 2;
      defaultEdgeStyle.endArrow = 'classic';
      defaultEdgeStyle.endFill = 1;

      // 监听选择变化
      this.graph.getSelectionModel().addListener('change', () => {
        this.handleSelectionChange();
      });

      // 监听画布拖放
      container.addEventListener('dragover', this.handleDragOver.bind(this));
      container.addEventListener('drop', this.handleDrop.bind(this));
      container.addEventListener('dragenter', this.handleDragEnter.bind(this));
      container.addEventListener('dragleave', this.handleDragLeave.bind(this));
      
      // 确保画布可以获得焦点以接收键盘事件
      container.setAttribute('tabindex', '0');
    },
    handleSelectionChange() {
      const cells = this.graph.getSelectionCells();
      if (cells.length > 0 && cells[0].isVertex()) {
        this.selectedCell = cells[0];
        this.updatePropertyPanel();
      } else {
        this.selectedCell = null;
      }
    },
    updatePropertyPanel() {
      if (!this.selectedCell) return;

      const geometry = this.selectedCell.getGeometry();
      const style = this.selectedCell.getStyle();
      
      this.cellProperties = {
        value: this.selectedCell.getValue() || '',
        width: geometry.width || 120,
        height: geometry.height || 60,
        fillColor: style.fillColor || '#E3F2FD',
        strokeColor: style.strokeColor || '#1976D2',
        strokeWidth: style.strokeWidth || 2,
        arcSize: style.arcSize || 0
      };

      // 读取元件专属属性
      const compType = style.componentType;
      const def = this.getComponentDef(compType);
      if (def) {
        this.selectedComponentType = compType;
        this.selectedComponentProps = def.props.map(p => {
          const skey = this.makePropKey(p.key);
          const v = style[skey];
          return { ...p, value: v !== undefined ? v : p.default };
        });
      } else {
        this.selectedComponentType = null;
        this.selectedComponentProps = [];
      }
    },
    updateCellProperty(property, value) {
      if (!this.selectedCell) return;

      this.graph.batchUpdate(() => {
        if (property === 'value') {
          this.selectedCell.setValue(value);
        } else if (property === 'width' || property === 'height') {
          const geometry = this.selectedCell.getGeometry().clone();
          geometry[property] = value;
          this.graph.getDataModel().setGeometry(this.selectedCell, geometry);
        }
      });
    },
    updateCellStyle(property, value) {
      if (!this.selectedCell) return;

      this.graph.batchUpdate(() => {
        const style = this.selectedCell.getStyle();
        const newStyle = { ...style, [property]: value };
        this.graph.getDataModel().setStyle(this.selectedCell, newStyle);
      });
    },
    handleDragStart(event, component) {
      // 设置拖放数据
      event.dataTransfer.setData('component', JSON.stringify(component));
      event.dataTransfer.effectAllowed = 'copy';
      
      // 创建拖放预览图像
      const dragImage = event.target.cloneNode(true);
      dragImage.style.position = 'absolute';
      dragImage.style.top = '-1000px';
      document.body.appendChild(dragImage);
      event.dataTransfer.setDragImage(dragImage, event.offsetX, event.offsetY);
      setTimeout(() => document.body.removeChild(dragImage), 0);
      
      this.dragOffset = { x: event.offsetX, y: event.offsetY };
    },
    handleDragEnter(event) {
      event.preventDefault();
      this.isDraggingOver = true;
      if (this.$refs.graphContainer) {
        this.$refs.graphContainer.classList.add('drag-over');
      }
    },
    handleDragOver(event) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
    },
    handleDragLeave(event) {
      event.preventDefault();
      // 只有当离开画布容器时才移除样式
      if (!this.$refs.graphContainer.contains(event.relatedTarget)) {
        this.isDraggingOver = false;
        if (this.$refs.graphContainer) {
          this.$refs.graphContainer.classList.remove('drag-over');
        }
      }
    },
    handleDrop(event) {
      event.preventDefault();
      event.stopPropagation();
      
      // 移除拖放视觉反馈
      this.isDraggingOver = false;
      if (this.$refs.graphContainer) {
        this.$refs.graphContainer.classList.remove('drag-over');
      }
      
      const componentData = event.dataTransfer.getData('component');
      if (componentData) {
        try {
          const component = JSON.parse(componentData);
          const rect = this.$refs.graphContainer.getBoundingClientRect();
          
          // 获取画布的滚动位置和缩放
          const view = this.graph.getView();
          const scale = view.getScale();
          const translate = view.getTranslate();
          
          // 计算在画布坐标系中的位置（减去元件尺寸的一半，使元件中心在鼠标位置）
          const x = (event.clientX - rect.left) / scale - translate.x - 60;
          const y = (event.clientY - rect.top) / scale - translate.y - 30;
          
          this.createComponent(component, x, y);
        } catch (e) {
          console.error('Failed to parse component data:', e);
        }
      }
    },
    addComponentToCanvas(component) {
      // 在画布中心添加元件
      const rect = this.$refs.graphContainer.getBoundingClientRect();
      const x = rect.width / 2 - 60;
      const y = rect.height / 2 - 30;
      this.createComponent(component, x, y);
    },
    createComponent(component, x, y) {
      this.graph.batchUpdate(() => {
        // 基础样式
        const style = {
          shape: component.defaultStyle.shape || 'rectangle',
          fillColor: component.defaultStyle.fillColor || component.color,
          strokeColor: component.defaultStyle.strokeColor || '#D8D8D8', // 边框灰
          strokeWidth: component.defaultStyle.strokeWidth || 2,
          arcSize: component.defaultStyle.arcSize || 8,
          fontColor: '#1D2129', // 文本黑
          fontSize: 16,         // 正文常规
          componentType: component.type
        };
        // 写入专属属性到样式（以 prop_ 前缀存储）
        if (component.props && component.props.length) {
          component.props.forEach(p => {
            style[this.makePropKey(p.key)] = p.default;
            // 同步部分设计属性到样式
            if (p.key === '文字颜色') style.fontColor = p.default;
            if (p.key === '背景色') style.fillColor = p.default;
            if (p.key === '边框颜色') style.strokeColor = p.default;
            if (p.key === '名称字体大小(px)') style.fontSize = p.default;
          });
        }

        const vertex = this.graph.insertVertex({
          parent: this.graph.getDefaultParent(),
          value: component.name,
          position: [x, y],
          size: [120, 60],
          style
        });
        
        // 选中新创建的元件
        this.graph.setSelectionCell(vertex);
      });
    },
    // 组件定义工具
    getComponentDef(type) {
      return this.componentLibrary.find(c => c.type === type);
    },
    makePropKey(label) {
      // 将中文参数名映射为安全的样式 key
      return `prop_${label}`;
    },
    // 更新组件专属属性
    updateComponentProp(propKey, value) {
      if (!this.selectedCell) return;
      this.graph.batchUpdate(() => {
        const style = this.selectedCell.getStyle();
        const newStyle = { ...style, [this.makePropKey(propKey)]: value };
        // 同步设计规范属性到实际样式键
        if (propKey === '文字颜色') {
          newStyle.fontColor = value;
        } else if (propKey === '背景色') {
          newStyle.fillColor = value;
        } else if (propKey === '边框颜色') {
          newStyle.strokeColor = value;
        } else if (propKey === '名称字体大小(px)') {
          newStyle.fontSize = Number(value) || 16;
        }
        this.graph.getDataModel().setStyle(this.selectedCell, newStyle);
      });
    },
    clearGraph() {
      if (this.graph) {
        this.graph.batchUpdate(() => {
          const cells = this.graph.getChildCells();
          this.graph.removeCells(cells);
        });
        this.selectedCell = null;
        this.fileName = '';
        this.fileId = null;
      }
    },
    initCanvasAfterSave() {
      // 清空画布
      if (this.graph) {
        this.graph.batchUpdate(() => {
          const cells = this.graph.getChildCells();
          this.graph.removeCells(cells);
        });
      }
      
      // 重置状态
      this.selectedCell = null;
      this.fileName = '';
      this.fileId = null;
      this.nodeCounter = 0;
      
      // 重置属性面板
      this.cellProperties = {
        value: '',
        width: 120,
        height: 60,
        fillColor: '#E3F2FD',
        strokeColor: '#1976D2',
        strokeWidth: 2,
        arcSize: 10
      };
    },
    saveFile() {
      const trimmedName = this.fileName.trim();
      if (!trimmedName) {
        this.$message.warning('请输入文件名');
        return;
      }
      
      if (!this.graph) return;
      
      try {
        const savedFiles = this.getSavedFiles();
        const currentId = this.fileId;
        const duplicate = savedFiles.find(
          file => file.name === trimmedName && file.id !== currentId
        );

        if (duplicate) {
          this.$message.error('文件名重复，请重新输入');
          return;
        }

        // 获取画布数据
        const cells = this.graph.getChildCells();
        
        // 序列化数据
        const cellMap = {};
        const graphData = {
          cells: [],
          edges: []
        };
        
        // 收集所有顶点
        cells.forEach(cell => {
          if (cell.isVertex()) {
            const geometry = cell.getGeometry();
            cellMap[cell.getId()] = cell;
            graphData.cells.push({
              id: cell.getId(),
              value: cell.getValue(),
              style: cell.getStyle(),
              geometry: geometry ? {
                x: geometry.x,
                y: geometry.y,
                width: geometry.width,
                height: geometry.height
              } : null,
              vertex: true
            });
          }
        });
        
        // 收集所有边
        cells.forEach(cell => {
          if (cell.isEdge && cell.isEdge()) {
            try {
              // 使用 getTerminal 方法获取边的源和目标
              // getTerminal(true) 获取源，getTerminal(false) 获取目标
              const source = cell.getTerminal ? cell.getTerminal(true) : null;
              const target = cell.getTerminal ? cell.getTerminal(false) : null;
              graphData.cells.push({
                id: cell.getId ? cell.getId() : null,
                source: source && source.getId ? source.getId() : null,
                target: target && target.getId ? target.getId() : null,
                style: cell.getStyle ? cell.getStyle() : {},
                edge: true
              });
            } catch (error) {
              console.error('保存边时出错:', error, cell);
            }
          }
        });
        
        // 创建文件对象
        const fileId = currentId || Date.now().toString();
        const fileData = {
          id: fileId,
          name: trimmedName,
          saveTime: new Date().toISOString(),
          data: graphData
        };
        
        // 保存到 localStorage
        const existingIndex = savedFiles.findIndex(f => f.id === fileId);
        
        if (existingIndex >= 0) {
          savedFiles[existingIndex] = fileData;
        } else {
          savedFiles.push(fileData);
        }
        
        localStorage.setItem('eletron_files', JSON.stringify(savedFiles));
        this.fileId = fileId;
        
        this.$message.success('保存成功！');
        
        // 保存成功后初始化画布
        this.initCanvasAfterSave();
      } catch (error) {
        console.error('保存失败:', error);
        this.$message.error('保存失败，请重试');
      }
    },
    getSavedFiles() {
      try {
        const files = localStorage.getItem('eletron_files');
        return files ? JSON.parse(files) : [];
      } catch (error) {
        console.error('读取文件列表失败:', error);
        return [];
      }
    },
    loadFileById(fileId) {
      const savedFiles = this.getSavedFiles();
      const fileData = savedFiles.find(f => f.id === fileId);
      if (fileData) {
        this.loadFile(fileData);
      }
    },
    loadFile(fileData) {
      if (!this.graph) return;
      
      try {
        // 清空画布
        this.graph.batchUpdate(() => {
          const cells = this.graph.getChildCells();
          this.graph.removeCells(cells);
        });
        
        // 重建元件映射
        const cellMap = {};
        const graphData = fileData.data;
        
        // 先创建所有顶点
        graphData.cells.forEach(cellData => {
          if (cellData.vertex && cellData.geometry) {
            const vertex = this.graph.insertVertex({
              parent: this.graph.getDefaultParent(),
              id: cellData.id,
              value: cellData.value,
              position: [cellData.geometry.x, cellData.geometry.y],
              size: [cellData.geometry.width, cellData.geometry.height],
              style: cellData.style || {}
            });
            cellMap[cellData.id] = vertex;
          }
        });
        
        // 再创建所有边
        graphData.cells.forEach(cellData => {
          if (cellData.edge && cellData.source && cellData.target) {
            const source = cellMap[cellData.source];
            const target = cellMap[cellData.target];
            if (source && target) {
              this.graph.insertEdge({
                parent: this.graph.getDefaultParent(),
                id: cellData.id,
                source: source,
                target: target,
                style: cellData.style || {}
              });
            }
          }
        });
        
        // 设置文件名和ID
        this.fileName = fileData.name;
        this.fileId = fileData.id;
      } catch (error) {
        console.error('加载文件失败:', error);
        alert('加载文件失败，请重试');
      }
    },
    handleKeyDown(event) {
      // 画布内的键盘事件处理
      this.handleDeleteKey(event);
    },
    handleGlobalKeyDown(event) {
      // 全局键盘事件处理（用于删除功能）
      this.handleDeleteKey(event);
    },
    handleDeleteKey(event) {
      // 检测 Delete 或 Backspace 键
      if (event.key === 'Delete' || event.key === 'Backspace') {
        // 防止在输入框中删除时触发
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
          return;
        }
        
        // 检查是否有选中的元件或连线
        if (!this.graph) return;
        
        const selectedCells = this.graph.getSelectionCells();
        
        if (selectedCells.length > 0) {
          event.preventDefault();
          event.stopPropagation();
          
          // 删除选中的元件或连线
          this.graph.batchUpdate(() => {
            this.graph.removeCells(selectedCells);
          });
          
          // 清除选中状态
          this.selectedCell = null;
        }
      }
    }
  }
};
</script>

<style scoped>
.eletron-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
  padding:0 0 20px 0;
}

.toolbar {
  margin-bottom: 20px;
}

.toolbar h1 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.main-content {
  display: flex;
  gap: 20px;
  flex: 1;
  min-height: 0;
}

.canvas-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.graph-container {
  flex: 1;
  background: #f5f5f5;
  border: 2px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  outline: none;
}

.graph-container:focus {
  border-color: #1976D2;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
}

.graph-container.drag-over {
  border-color: #1976D2;
  border-width: 3px;
  box-shadow: 0 0 20px rgba(25, 118, 210, 0.3);
  background: #f0f7ff;
}

.sidebar {
  width: 420px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 420px;
  min-height: 0;
}

.component-library {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

::v-deep .component-library .el-card__body {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 15px;
  overflow: hidden;
}

.component-library h3 {
  margin: 0;
  color: #333;
  font-size: 1.1rem;
}

.component-list {
  overflow-y: auto;
  flex: 1;
  margin-top: 10px;
  padding-right: 4px;
}

.component-item {
  cursor: pointer;
  margin-bottom: 10px;
  height: 120px;
}


.component-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  height: 100%;
  justify-content: center;
  gap: 6px;
}

.component-icon {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  border-radius: 8px;
  margin-bottom: 8px;
  border: 2px solid rgba(0, 0, 0, 0.1);
}

.component-name {
  font-size: 0.85rem;
  color: #555;
  text-align: center;
  /* 最多一行显示15个字符，超过换行 */
  width: 15ch;
  min-width: 5ch;
  white-space: normal;
  word-break: break-all;
  line-height: 1.2;
}

/* 让 el-card 填满固定高度，保证所有元件大小一致 */
::v-deep .component-item .el-card__body {
  height: 100%;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.property-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

::v-deep .property-panel .el-card__body {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 15px;
  min-height: 0;
}

.property-panel h3 {
  margin: 0;
  color: #333;
  font-size: 1.1rem;
}

.property-panel .el-form {
  overflow-y: auto;
  flex: 1;
  padding-right: 4px;
  min-height: 0;
}
</style>
