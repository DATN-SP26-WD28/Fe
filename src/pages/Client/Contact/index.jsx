import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
    const [contact, setContact] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setContact((s) => ({ ...s, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const { name, email, subject, message } = contact;
        if (!name || !email || !subject || !message) {
            alert('Vui lòng điền đầy đủ thông tin.');
            return;
        }
        console.log('Gửi contact:', contact);
        setSubmitted(true);
        setTimeout(() => {
            setContact({ name: '', email: '', subject: '', message: '' });
            setSubmitted(false);
        }, 3000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 py-20 px-4">
            <div className="max-w-[1200px] mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-block mb-4">
                        <span className="text-red-500 text-sm font-semibold uppercase tracking-wider">
                            Liên Hệ Chúng Tôi
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
                        Kết nối với Roosta
                    </h1>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Bạn có câu hỏi hoặc góp ý? Đội ngũ hỗ trợ của chúng tôi luôn sẵn lòng giúp bạn 24/7
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
                    {/* Left: Contact Info */}
                    <div className="space-y-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-red-100 to-transparent rounded-2xl blur-xl opacity-50"></div>

                            {[
                                {
                                    icon: MapPin,
                                    title: 'Địa chỉ',
                                    desc: '123 Đường ABC, Phường X, Quận 1, TP. Hồ Chí Minh',
                                    color: 'from-red-500 to-red-600',
                                },
                                {
                                    icon: Phone,
                                    title: 'Điện thoại',
                                    desc: '(+84) 123 456 789',
                                    color: 'from-red-500 to-red-600',
                                },
                                {
                                    icon: Mail,
                                    title: 'Email',
                                    desc: 'contact@roosta.com',
                                    color: 'from-red-500 to-red-600',
                                },
                            ].map((item, idx) => {
                                const Icon = item.icon;
                                return (
                                    <div
                                        key={item.title}
                                        className="relative group cursor-pointer"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-red-200 to-red-100 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <div className="relative bg-white p-6 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 shadow-lg`}>
                                                <Icon className="w-7 h-7 text-white" />
                                            </div>
                                            <h3 className="text-xl font-bold text-red-600 mb-2">
                                                {item.title}
                                            </h3>
                                            <p className="text-gray-600 leading-relaxed">
                                                {item.desc}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 mt-8">
                            {[
                                { label: '1000+', desc: 'Khách hàng' },
                                { label: '50K+', desc: 'Đơn hàng' },
                                { label: '4.8★', desc: 'Đánh giá' },
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    className="bg-white rounded-xl p-4 text-center shadow-md hover:shadow-lg transition-shadow"
                                >
                                    <div className="text-2xl font-bold text-red-600">
                                        {stat.label}
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1">{stat.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Form */}
                    <div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-red-100 to-red-50 rounded-3xl blur-2xl opacity-40"></div>

                            <form
                                onSubmit={handleSubmit}
                                className="relative bg-white p-8 md:p-10 rounded-3xl shadow-2xl space-y-6"
                            >
                                {submitted && (
                                    <div className="absolute inset-0 bg-white rounded-3xl flex items-center justify-center flex-col gap-4 animate-fade-in">
                                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                                            <svg
                                                className="w-8 h-8 text-green-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                        </div>
                                        <p className="text-xl font-bold text-gray-800">
                                            Gửi thành công!
                                        </p>
                                        <p className="text-gray-600">
                                            Chúng tôi sẽ liên hệ sớm
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Tên của bạn <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        name="name"
                                        value={contact.name}
                                        onChange={handleChange}
                                        placeholder="Nhập tên đầy đủ"
                                        className="w-full px-4 py-3 border-2 border-red-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all duration-300"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            name="email"
                                            type="email"
                                            value={contact.email}
                                            onChange={handleChange}
                                            placeholder="example@email.com"
                                            className="w-full px-4 py-3 border-2 border-red-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all duration-300"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">
                                            Chủ đề <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="subject"
                                            value={contact.subject}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border-2 border-red-200 rounded-xl text-gray-800 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all duration-300"
                                        >
                                            <option value="">Chọn chủ đề...</option>
                                            <option value="Hỏi đáp về sản phẩm">
                                                Hỏi đáp về sản phẩm
                                            </option>
                                            <option value="Khiếu nại dịch vụ">
                                                Khiếu nại dịch vụ
                                            </option>
                                            <option value="Hợp tác kinh doanh">
                                                Hợp tác kinh doanh
                                            </option>
                                            <option value="Khác">Khác</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Tin nhắn của bạn <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="message"
                                        value={contact.message}
                                        onChange={handleChange}
                                        placeholder="Hãy cho chúng tôi biết bạn cần gì..."
                                        className="w-full px-4 py-3 border-2 border-red-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all duration-300 resize-none h-32"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105"
                                >
                                    <Send className="w-5 h-5" />
                                    Gửi tin nhắn
                                </button>

                                <p className="text-center text-xs text-gray-500">
                                    Chúng tôi sẽ phản hồi trong vòng 24 giờ
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
        </div>
    );
};

export default Contact;