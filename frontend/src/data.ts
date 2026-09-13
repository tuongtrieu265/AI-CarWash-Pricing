/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VehicleType, WashService, AddOnService, Review } from './types';

export const VEHICLE_LIST = [
  {
    id: VehicleType.XE_MAY,
    name: 'Xe máy, Mô tô',
    priceMultiplier: 0.5,
    icon: 'Bike',
    description: 'Tất cả các dòng xe máy, tay ga, xe phân khối lớn'
  },
  {
    id: VehicleType.SEDAN,
    name: 'Ô tô 4-5 chỗ (Sedan, Hatchback)',
    priceMultiplier: 1.0,
    icon: 'Car',
    description: 'Các dòng sedan cỡ nhỏ và trung như Vios, Accent, Mazda3...'
  },
  {
    id: VehicleType.SUV,
    name: 'Ô tô SUV, MPV 7 chỗ',
    priceMultiplier: 1.25,
    icon: 'Truck',
    description: 'Các dòng xe gầm cao gia đình như SantaFe, CRV, Innova...'
  },
  {
    id: VehicleType.PICKUP,
    name: 'Xe bán tải, SUV cỡ lớn',
    priceMultiplier: 1.4,
    icon: 'Container',
    description: 'Các dòng xe bán tải, xe 9-16 chỗ cỡ lớn như Ranger, Transit...'
  }
];

export const WASH_SERVICES: WashService[] = [
  {
    id: '1',
    name: 'Gói Tiêu Chuẩn',
    subtitle: 'Rực rỡ nguyên bản',
    basePrice: 100000,
    description: 'Lựa chọn hoàn hảo và tiết kiệm để chăm sóc xe sạch thơm tho hàng tuần.',
    duration: '30 - 45 phút',
    features: [
      'Rửa thân vỏ 3 bước bằng vòi phun nước áp lực cao chuyên dụng',
      'Ủ bọt tuyết siêu mịn công nghệ pH trung tính an toàn tuyệt đối cho sơn xe',
      'Hút sạch bụi sâu toàn bộ thảm, sàn xe và cốp sau',
      'Lau sạch và sấy khô kính lái, kính hông giúp quan sát rõ ràng',
      'Lau bụi táp-lô, táp-li cửa Cabin bằng khăn micro-fiber mềm mịn'
    ]
  },
  {
    id: '2',
    name: 'Gói Chăm Sóc Nâng Cao',
    subtitle: 'Sáng bóng, bảo vệ toàn diện',
    basePrice: 200000,
    description: 'Giải pháp làm sạch bổ sung các khe kẹt, bảo vệ sơn, lốp gầm chuyên sâu.',
    duration: '60 - 75 phút',
    features: [
      'Bao gồm tất cả các hạng mục của GÓI TIÊU CHUẨN',
      'Xịt rửa vệ sinh sâu gầm xe bằng hoá chất tẩy rửa bụi đường chuyên dụng',
      'Tẩy và làm sạch hoàn toàn các vết ố nước bám lazăng bánh xe',
      'Quét sáp dưỡng đen lốp cao su cao cấp chống nứt nẻ và giữ độ sâu màu',
      'Lau vệ sinh khe kẹt cửa sổ, khe chỉ gioăng cao su và nắp bình xăng',
      'Khử mùi dịu nhẹ nội thất xe bằng xịt tinh dầu sả chanh tự nhiên'
    ],
    isPopular: true
  },
  {
    id: '3',
    name: 'Gói Spa Chuyên Sâu',
    subtitle: 'Đẳng cấp xế cưng như mới',
    basePrice: 450000,
    description: 'Quy trình phục hồi cao cấp, tẩy sạch sâu bẩn ngoại-nội thất và khoang máy.',
    duration: '120 - 150 phút',
    features: [
      'Bao gồm tất cả các hạng mục của GÓI CHĂM SÓC NÂNG CAO',
      'Dọn rửa và làm sạch tỉ mỉ khoang máy động cơ bằng hơi nước nóng bảo vệ gioăng',
      'Thoa sáp dưỡng ẩm cao cấp phục hồi độ đàn hồi và màu sắc cho nội thất da/nhựa',
      'Tẩy sạch hoàn toàn các vết nhựa đường, keo bám cố hữu trên sơn xe',
      'Xông hơi diệt khuẩn khử sâu trùng Ozone toàn bộ cabin ngăn rêu mốc ẩm',
      'Phủ sáp bảo vệ bề mặt sơn phủ bóng hiệu ứng lá sen kháng nước sâu'
    ]
  }
];

export const ADD_ON_SERVICES: AddOnService[] = [
  {
    id: 'add_aircon',
    name: 'Nội soi, làm sạch điều hoà lạnh',
    price: 150000,
    description: 'Sát trùng hệ thống lọc gió dàn lạnh, giúp thổi hơi mát dịu sạch khuẩn.'
  },
  {
    id: 'add_glass',
    name: 'Phủ sáp hiệu ứng gương kính lái',
    price: 80000,
    description: 'Bảo vệ kính lái xe, giúp trôi nhanh hạt mưa khi đi tốc độ cao.'
  },
  {
    id: 'add_tar',
    name: 'Tẩy mảng nhựa đường dính hông',
    price: 60000,
    description: 'Sử dụng dung dịch hóa mỡ chuyên dụng hòa tan các vệt hắc ín cứng đầu.'
  },
  {
    id: 'add_ozone',
    name: 'Xông tinh dầu sả thiên nhiên khử mùi',
    price: 50000,
    description: 'Diệt bào tử nấm mốc ẩn trong kẹt nỉ nội thất, mang lại mùi dễ chịu quyến rũ.'
  }
];

export const TIME_SLOTS = [
  { time: '08:00 - 09:00', available: true },
  { time: '09:00 - 10:00', available: true },
  { time: '10:00 - 11:00', available: true },
  { time: '11:00 - 12:00', available: false }, // simulated booked slot
  { time: '13:00 - 14:00', available: true },
  { time: '14:00 - 15:00', available: true },
  { time: '15:00 - 16:00', available: true },
  { time: '16:00 - 17:00', available: false }, // simulated booked slot
  { time: '17:00 - 18:00', available: true }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev_1',
    reviewerName: 'Trần Minh Hoàng',
    rating: 5,
    comment: 'Nhân viên ở đây tận tình lắm. Rửa Gói Nâng Cao mà xe bóng nhẫy như mới phủ ceramic vậy. Phòng chờ điều hoà mát lạnh có trà chanh miễn phí.',
    date: '2026-06-02',
    vehicleType: 'Ô tô 4-5 chỗ (Sedan, Hatchback)'
  },
  {
    id: 'rev_2',
    reviewerName: 'Lê Khánh Linh',
    rating: 5,
    comment: 'Thích nhất là gói Spa Chuyên Sâu, dọn sạch khoang máy bụi đất lâu ngày bám bẩn trôi hết sạch. Sẽ quay lại định kỳ hàng tháng.',
    date: '2026-06-01',
    vehicleType: 'Ô tô SUV, MPV 7 chỗ'
  },
  {
    id: 'rev_3',
    reviewerName: 'Nguyễn Văn Hùng',
    rating: 4,
    comment: 'Giá tốt, rửa kỹ, hút bụi sạch sẽ. Tuy nhiên cuối tuần hơi đông nên tốt nhất các bạn đặt lịch trước trên web cho yên tâm không phải đợi.',
    date: '2026-05-30',
    vehicleType: 'Xe máy, Mô tô'
  }
];
