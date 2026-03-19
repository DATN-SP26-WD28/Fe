import { fetchTables } from '@/configs/table.api';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { message, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';

const SelectTable = () => {
    const navigate = useNavigate();

    const { data: tables, isLoading } = useQuery({
        queryKey: ['tables'],
        queryFn: fetchTables,
    });

    const handleTableClick = (table) => {
        if (table.status !== 'available') {
            message.warning(`Bàn số ${table.table_number} hiện đang có khách!`);
            return;
        }

        sessionStorage.setItem('selectedTable', JSON.stringify(table));

        message.success(`Đã chọn Bàn ${table.table_number}. Mời bạn chọn món!`);

        navigate(`/menu?tableId=${table._id}&tableNum=${table.table_number}`);
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Spin size="large" /></div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white p-6 flex items-center gap-4 shadow-sm">
                <button onClick={() => navigate(-1)}><ArrowLeftOutlined className="text-xl" /></button>
                <h1 className="text-xl font-bold text-gray-800">Chọn vị trí bàn</h1>
            </div>

            <div className="p-6">
                <div className="mb-6 flex gap-4 text-xs font-medium">
                    <div className="flex items-center gap-2"><span className="w-3 h-3 bg-white border rounded"></span> Trống</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 bg-brand rounded"></span> Đang ngồi</div>
                </div>

                {/* Danh sách bàn theo Grid */}
                <div className="grid grid-cols-3 gap-4">
                    {tables?.map((table) => (
                        <div
                            key={table._id}
                            onClick={() => handleTableClick(table)}
                            className={`
                relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all active:scale-95 shadow-sm
                ${table.status === 'available'
                                    ? 'bg-white border-2 border-gray-100 hover:border-brand'
                                    : 'bg-orange-100 border-2 border-brand opacity-60'}
              `}
                        >
                            <span className="text-[10px] text-gray-400 uppercase">Bàn</span>
                            <span className="text-2xl font-black text-gray-800">{table.table_number}</span>
                            <span className="text-[10px] text-gray-500 mt-1">{table.location || 'Khu vực chung'}</span>

                            {table.status !== 'available' && (
                                <div className="absolute top-2 right-2 w-2 h-2 bg-brand rounded-full"></div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-10 p-4 bg-orange-50 rounded-xl border border-orange-100">
                    <p className="text-xs text-orange-700 leading-relaxed">
                        <strong>Mẹo:</strong> Bạn có thể quét mã QR dán tại bàn để hệ thống tự động nhận diện vị trí mà không cần chọn thủ công.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SelectTable;