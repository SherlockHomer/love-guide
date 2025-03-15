import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import './App.css';
import mockData, { IfThenItem } from './__mocks__/ifData';

function App() {
  // 类型定义更新
  const [data, setData] = useState<IfThenItem[]>([]);
  // 初始化显示15条数据
  const [visibleItems, setVisibleItems] = useState(15);
  // 选中的项目，用于显示详情
  const [selectedItem, setSelectedItem] = useState<IfThenItem | null>(null);
  // 是否显示添加表单
  const [showAddForm, setShowAddForm] = useState(false);
  // 表单数据
  const [formData, setFormData] = useState<IfThenItem>({
    if: '',
    then: '',
    type: 'love',
  });
  // 列表容器的引用，用于检测滚动
  const listContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  // Filter data based on search term and selected type
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = item.if.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || item.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [data, searchTerm, selectedType]);

  // 当筛选条件变化时重置visible items
  useEffect(() => {
    setVisibleItems(Math.min(15, filteredData.length));
  }, [searchTerm, selectedType, filteredData.length]);

  // 加载更多数据
  const loadMore = useCallback(() => {
    setVisibleItems((prev) => Math.min(prev + 5, filteredData.length));
  }, [filteredData.length]);

  // 从localStorage加载数据或使用mock数据
  useEffect(() => {
    const storedData = localStorage.getItem('if');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        // 确保旧数据兼容新格式，如果没有type则添加默认type
        const updatedData = parsedData.map((item: Partial<IfThenItem>) => {
          if (!item.type) {
            return { ...item, type: 'love' } as IfThenItem;
          }
          return item as IfThenItem;
        });
        setData(updatedData);
        // 更新localStorage以包含type
        localStorage.setItem('if', JSON.stringify(updatedData));
      } catch (e) {
        console.error('解析localStorage数据失败', e);
        setData(mockData);
      }
    } else {
      setData(mockData);
    }
  }, []);

  // 监听滚动事件
  useEffect(() => {
    const handleScroll = () => {
      if (listContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } =
          listContainerRef.current;
        // 当滚动到距离底部100px时加载更多
        if (
          scrollHeight - scrollTop - clientHeight < 100 &&
          visibleItems < filteredData.length
        ) {
          loadMore();
        }
      }
    };

    const listContainer = listContainerRef.current;
    if (listContainer) {
      listContainer.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (listContainer) {
        listContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, [visibleItems, filteredData.length, loadMore]);

  // 处理点击列表项
  const handleItemClick = (item: IfThenItem) => {
    setSelectedItem(item);
  };

  // 关闭弹窗
  const closePopup = () => {
    setSelectedItem(null);
  };

  // 打开添加表单
  const openAddForm = () => {
    setShowAddForm(true);
  };

  // 关闭添加表单
  const closeAddForm = () => {
    setShowAddForm(false);
    setFormData({ if: '', then: '', type: 'love' });
  };

  // 处理表单输入变化
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 保存新数据
  const saveData = () => {
    if (formData.if.trim() && formData.then.trim()) {
      const newData = [...data, formData];
      setData(newData);
      localStorage.setItem('if', JSON.stringify(newData));
      closeAddForm();
    }
  };

  // 从数据中提取所有可用的类型选项
  const typeOptions = useMemo(() => {
    const types = data.map(item => item.type);
    // 去重并排序
    return ['all', ...Array.from(new Set(types))].sort();
  }, [data]);

  return (
    <div className='container'>
      <header className='nes-container with-title'>
        <h1 className='title'>Love Guide</h1>
        <p>Tap to see answer</p>
        
        <div className="filter-container">
          {/* 搜索框暂时隐藏 
          <input 
            type="text" 
            className="nes-input" 
            placeholder="Search..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          */}
          
          <div className="type-filter">
            <select 
              className="nes-select custom-select" 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {typeOptions.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <div className='list-container nes-container' ref={listContainerRef}>
        {filteredData.length > 0 ? (
          <ul className='nes-list is-disc'>
            {filteredData.slice(0, visibleItems).map((item, index) => (
              <li
                key={index}
                className='list-item nes-pointer'
                onClick={() => handleItemClick(item)}
              >
                {item.if}
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-results">No matches found. Try another search.</p>
        )}
      </div>

      {/* 悬浮添加按钮 */}
      <div className='floating-icon' onClick={openAddForm}>
        <i className='nes-icon coin is-large'></i>
      </div>

      {/* 详情弹窗 */}
      {selectedItem && (
        <div className='popup-overlay' onClick={closePopup}>
          <div
            className='popup nes-container is-rounded'
            onClick={(e) => e.stopPropagation()}
          >
            <p className='if-text'>{selectedItem.if}</p>
            <p className='then-text'>{selectedItem.then}</p>
            <button className='nes-btn is-error close-btn' onClick={closePopup}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* 添加表单弹窗 */}
      {showAddForm && (
        <div className='popup-overlay' onClick={closeAddForm}>
          <div
            className='popup nes-container is-rounded form-popup'
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Add New</h3>
            <div className='nes-field'>
              <label htmlFor='if_field'>If</label>
              <input
                type='text'
                id='if_field'
                className='nes-input'
                name='if'
                value={formData.if}
                onChange={handleInputChange}
                placeholder='Enter if...'
              />
            </div>
            <div className='nes-field'>
              <label htmlFor='then_field'>Then</label>
              <textarea
                id='then_field'
                className='nes-textarea'
                name='then'
                value={formData.then}
                onChange={handleInputChange}
                placeholder='Enter then...'
              ></textarea>
            </div>
            <div className='nes-field'>
              <label htmlFor='type_field'>Type</label>
              <select
                id='type_field'
                className='nes-select'
                name='type'
                value={formData.type}
                onChange={handleInputChange}
              >
                <option value='love'>Love</option>
                <option value='disagreement'>Disagreement</option>
                <option value='lifestyle'>Lifestyle</option>
                <option value='sports'>Sports</option>
                <option value='money'>Money</option>
              </select>
            </div>
            <div className='form-buttons'>
              <button className='nes-btn is-primary' onClick={saveData}>
                Save
              </button>
              <button className='nes-btn is-error' onClick={closeAddForm}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
