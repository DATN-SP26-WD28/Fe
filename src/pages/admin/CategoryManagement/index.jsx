import React, { useState } from 'react'
import { Card, Table, Tag, Breadcrumb, Button, Input } from 'antd'
import { toast } from 'react-toastify'
import { Edit, Trash2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { fetchCategoryList, updateCategory, deleteCategory } from '@/services/category.service'
import { truncateText } from '@/shared/utils/truncateText'
import { CATEGORY_PLACEHOLDER_IMG } from '@/assets/images'
import ReusableFormModal from '@/components/ReusableFormModal'

const categoryFormSchema = [
  {
    name: 'name',
    label: 'Tên danh mục',
    rules: [{ required: true, message: 'Vui lòng nhập tên danh mục' }],
  },
  {
    name: 'description',
    label: 'Mô tả',
    render: () => <Input.TextArea rows={3} />,
  },
];

const getColumns = (onEdit, onDelete) => [
  {
    title: 'Hình ảnh',
    dataIndex: 'image',
    key: 'image',
    render: (src) => (
      <img
        src={src || CATEGORY_PLACEHOLDER_IMG}
        alt="category"
        style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8 }}
        onError={e => { e.target.onerror = null; e.target.src = CATEGORY_PLACEHOLDER_IMG; }}
      />
    ),
    width: 150,
  },
  {
    title: 'Tên danh mục',
    dataIndex: 'name',
    key: 'name',
    render: (v) => <span className="font-medium">{truncateText(v, 20)}</span>,
  },
  {
    title: 'Mô tả sản phẩm',
    dataIndex: 'description',
    key: 'description',
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
    render: (status) => {
      const map = {
        Active: 'green',
        Inactive: 'red',
      }
      return <Tag color={map[status] || 'default'}>{status}</Tag>
    },
  },
  {
    title: 'Hành động',
    key: 'action',
    render: (_, record) => (
      <span className="flex gap-2">
        <Button type="text" icon={<Edit size={18} />} title="Sửa" className="text-blue-500" onClick={() => onEdit(record)} />
        <Button type="text" icon={<Trash2 size={18} />} title="Xóa" className="text-red-500" onClick={() => onDelete(record)} />
      </span>
    ),
  },
];

const CategoryManagement = () => {
  const { data: categories = [], isLoading, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategoryList,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('update');
  const [modalInitialValues, setModalInitialValues] = useState({});

  const handleEdit = (record) => {
    setModalMode('update');
    setModalInitialValues(record);
    setModalVisible(true);
  };
  const handleDelete = async (record) => {
    await deleteCategory(record.id);
    toast.success('Đã xóa danh mục');
    refetch();
  };

  const handleModalOk = async (values) => {
    if (modalMode === 'update') {
      await updateCategory(modalInitialValues.id, values);
      toast.success('Cập nhật thành công');
      refetch();
    }
    setModalVisible(false);
  };

  return (
    <>
      <div className='flex items-center justify-between'>
        <section className="mb-3">
          <h1 className="font-bold text-3xl mb-2">Quản lý danh mục</h1>
          <Breadcrumb items={[{ title: 'Trang chủ' }, { title: 'Quản lý danh mục' }]} />
        </section>

        <Button type='primary' onClick={() => {
          setModalMode('create');
          setModalInitialValues({});
          setModalVisible(true);
        }}>
          Thêm mới
        </Button>
      </div>
      <Card className="shadow-sm rounded-2xl xl:col-span-2" title="Danh mục sản phẩm">
        <Table
          columns={getColumns(handleEdit, handleDelete)}
          dataSource={categories}
          loading={isLoading}
          pagination={{ pageSize: 5 }}
          className="rounded-xl"
          rowKey="id"
        />
      </Card>
      <ReusableFormModal
        visible={modalVisible}
        mode={modalMode}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        formSchema={categoryFormSchema}
        initialValues={modalInitialValues}
        apiHandler={(values) => updateCategory(modalInitialValues.id, values)}
        title={'Cập nhật danh mục'}
      />
    </>
  );
};

export default CategoryManagement;
