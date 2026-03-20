import React, { useCallback, useEffect, useState } from 'react';
import { Card, Table, Form, Input, Button, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import request from '@/utils/request';

interface AuditRow {
  id: number;
  operator: string;
  module: string;
  action: string;
  targetType: string;
  targetId: string;
  ipAddress: string;
  gmtCreate: string;
}

const AuditLogPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AuditRow[]>([]);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const values = form.getFieldsValue();
      const response = await request.get('/api/audit-logs', {
        params: {
          pageNum,
          pageSize,
          module: values.module || undefined,
          operator: values.operator || undefined,
          action: values.action || undefined,
        },
      });
      const page = (response as { data?: { data?: { list?: AuditRow[]; total?: number } } }).data?.data;
      setData(Array.isArray(page?.list) ? page.list : []);
      setTotal(page?.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [pageNum, pageSize, form]);

  useEffect(() => {
    load();
  }, [load]);

  const columns: ColumnsType<AuditRow> = [
    { title: '时间', dataIndex: 'gmtCreate', key: 'gmtCreate', width: 180 },
    { title: '操作人', dataIndex: 'operator', key: 'operator', width: 120 },
    { title: '模块', dataIndex: 'module', key: 'module', width: 120 },
    { title: '动作', dataIndex: 'action', key: 'action', width: 100 },
    { title: '目标类型', dataIndex: 'targetType', key: 'targetType', width: 120 },
    { title: '目标', dataIndex: 'targetId', key: 'targetId', ellipsis: true },
    { title: 'IP', dataIndex: 'ipAddress', key: 'ipAddress', width: 140 },
  ];

  return (
    <Card>
      <Form form={form} layout="inline" style={{ marginBottom: 16 }} onFinish={() => { setPageNum(1); load(); }}>
        <Form.Item name="module" label="模块">
          <Input placeholder="如 ORGANIZATION" allowClear style={{ width: 140 }} />
        </Form.Item>
        <Form.Item name="operator" label="操作人">
          <Input allowClear style={{ width: 120 }} />
        </Form.Item>
        <Form.Item name="action" label="动作">
          <Input allowClear style={{ width: 100 }} />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">查询</Button>
            <Button onClick={() => { form.resetFields(); setPageNum(1); load(); }}>重置</Button>
          </Space>
        </Form.Item>
      </Form>
      <Table<AuditRow>
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={data}
        scroll={{ x: 1000 }}
        pagination={{
          current: pageNum,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 条`,
          onChange: (p, ps) => {
            setPageNum(p);
            setPageSize(ps || 20);
          },
        }}
      />
    </Card>
  );
};

export default AuditLogPage;
