import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Card,
  Tag,
  DatePicker,
  Select,
  message,
} from 'antd';
import { CalendarOutlined, DownloadOutlined, CheckOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

// 结算数据接口
interface SettlementRecord {
  id: number;
  businessTime: string; // 业务时间，格式：2025-1
  settlementEntity: string; // 结算主体
  settlementAmount: number; // 结算金额
  settlementStatus: string; // 结算状态：'pending' | 'completed'
  statusText: string; // 状态文本
}

const FinancialSettlement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<SettlementRecord[]>([]);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [settlementStatus, setSettlementStatus] = useState<string | undefined>(undefined);

  // 模拟数据加载
  const loadData = async () => {
    setLoading(true);
    try {
      // TODO: 替换为实际 API 调用
      // const res = await getSettlementList({ dateRange, status: settlementStatus });
      
      // 模拟数据
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockData: SettlementRecord[] = [
        {
          id: 1,
          businessTime: '2025-1',
          settlementEntity: '北京前呈无限可击有限公司',
          settlementAmount: 181.65,
          settlementStatus: 'pending',
          statusText: '结算单待确认',
        },
        {
          id: 2,
          businessTime: '2025-1',
          settlementEntity: '北京前呈无限可击有限公司',
          settlementAmount: 181.65,
          settlementStatus: 'completed',
          statusText: '结算已完成',
        },
        {
          id: 3,
          businessTime: '2025-1',
          settlementEntity: '北京前呈无限可击有限公司',
          settlementAmount: 181.65,
          settlementStatus: 'completed',
          statusText: '结算已完成',
        },
        {
          id: 4,
          businessTime: '2025-1',
          settlementEntity: '北京前呈无限可击有限公司',
          settlementAmount: 181.65,
          settlementStatus: 'completed',
          statusText: '结算已完成',
        },
      ];
      
      // 根据筛选条件过滤数据
      let filteredData = mockData;
      if (settlementStatus) {
        filteredData = filteredData.filter(item => item.settlementStatus === settlementStatus);
      }
      
      setDataSource(filteredData);
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dateRange, settlementStatus]);

  // 确认结算单
  const handleConfirm = async (record: SettlementRecord) => {
    try {
      // TODO: 替换为实际 API 调用
      // await confirmSettlement(record.id);
      message.success('结算单确认成功');
      loadData();
    } catch (error) {
      message.error('确认失败');
    }
  };

  // 下载结算单
  const handleDownload = async (record: SettlementRecord) => {
    try {
      // TODO: 替换为实际 API 调用
      // await downloadSettlement(record.id);
      message.success('结算单下载成功');
    } catch (error) {
      message.error('下载失败');
    }
  };

  // 表格列定义
  const columns: ColumnsType<SettlementRecord> = [
    {
      title: '业务时间',
      dataIndex: 'businessTime',
      width: 120,
      align: 'left',
    },
    {
      title: '结算主体',
      dataIndex: 'settlementEntity',
      width: 250,
      ellipsis: true,
    },
    {
      title: '结算金额（元）',
      dataIndex: 'settlementAmount',
      width: 150,
      align: 'right',
      render: (amount: number) => amount.toFixed(2),
    },
    {
      title: '结算状态',
      dataIndex: 'statusText',
      width: 150,
      render: (text: string, record: SettlementRecord) => {
        const isCompleted = record.settlementStatus === 'completed';
        return (
          <Tag color={isCompleted ? '#18BB28' : '#FFB20E'}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record: SettlementRecord) => {
        const isCompleted = record.settlementStatus === 'completed';
        return (
          <Space>
            {isCompleted ? (
              <Button
                type="link"
                size="small"
                icon={<DownloadOutlined />}
                onClick={() => handleDownload(record)}
              >
                下载结算单
              </Button>
            ) : (
              <Button
                type="link"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleConfirm(record)}
                style={{ color: '#3562F6' }}
              >
                确认结算单
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <Card>
      {/* 筛选条件 */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
        <RangePicker
          value={dateRange}
          onChange={(dates) => setDateRange(dates)}
          format="YYYY.M.D"
          placeholder={['开始日期', '结束日期']}
          style={{ width: 240 }}
          suffixIcon={<CalendarOutlined />}
        />
        <Select
          value={settlementStatus}
          onChange={(value) => setSettlementStatus(value)}
          placeholder="结算状态"
          allowClear
          style={{ width: 168 }}
          options={[
            { label: '结算单待确认', value: 'pending' },
            { label: '结算已完成', value: 'completed' },
          ]}
        />
      </div>

      {/* 表格 */}
      <Table
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        scroll={{ x: 1000 }}
      />
    </Card>
  );
};

export default FinancialSettlement;

