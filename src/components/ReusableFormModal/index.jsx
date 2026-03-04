import React from 'react';
import { Modal, Form, Button, Input } from 'antd';

/**
 *
 * Props:
 * @param {'create'|'update'} mode          - Chế độ form
 * @param {boolean}           visible       - Hiển thị / ẩn modal
 * @param {Function}          onOk          - Callback sau khi submit thành công: (values) => void
 * @param {Function}          onCancel      - Callback đóng modal
 * @param {Array}             formSchema    - Mảng mô tả các field:
 *   { name, label, rules?, render?: ({ mode, form }) => ReactNode, inputProps? }
 * @param {object}            initialValues - Giá trị khởi tạo (dùng cho Update)
 * @param {Function}          apiHandler    - Hàm gọi API: (values) => Promise<any>
 * @param {string}            title         - Tiêu đề modal
 * @param {string}            okText        - Text nút xác nhận
 * @param {string}            cancelText    - Text nút huỷ
 * @param {object}            ...rest       - Các props Modal khác của Ant Design
 */

const ReusableFormModal = ({
  mode = 'create',
  visible,
  onOk,
  onCancel,
  formSchema = [],
  initialValues = {},
  apiHandler,
  title,
  okText,
  cancelText,
  ...rest
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (visible) {
      form.resetFields();
      form.setFieldsValue(initialValues);
    }
  }, [visible, initialValues, form]);

  const handleFinish = async (values) => {
    try {
      setLoading(true);
      await apiHandler?.(values);
      onOk?.(values);
      form.resetFields();
    } catch (err) {
      console.error('FormModal error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel?.();
  };

  return (
    <Modal
      open={visible}
      title={title || (mode === 'create' ? 'Tạo mới' : 'Cập nhật')}
      onCancel={handleCancel}
      centered
      footer={null}
      destroyOnClose
      {...rest}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        style={{ marginTop: 16 }}
      >
        {formSchema.map(({ name, label, rules, render, inputProps }) => (
          <Form.Item
            key={name}
            name={name}
            label={label}
            rules={rules}
          >
            {render
              ? render({ mode, form })
              : <Input {...inputProps} />
            }
          </Form.Item>
        ))}

        <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={handleCancel} style={{ minWidth: 88 }}>
              {cancelText || 'Huỷ'}
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ minWidth: 88 }}
            >
              {okText || (mode === 'create' ? 'Tạo mới' : 'Cập nhật')}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ReusableFormModal;
