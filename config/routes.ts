export default [
	{
		path: '/user',
		layout: false,
		routes: [
			{
				path: '/user/login',
				layout: false,
				name: 'login',
				component: './user/Login',
			},
			{
				path: '/user',
				redirect: '/user/login',
			},
		],
	},

	///////////////////////////////////
	// DEFAULT MENU
	{
		path: '/dashboard',
		name: 'Dashboard',
		component: './TrangChu',
		icon: 'HomeOutlined',
	},
	{
		path: '/gioi-thieu',
		name: 'About',
		component: './TienIch/GioiThieu',
		hideInMenu: true,
	},
	{
		path: '/random-user',
		name: 'RandomUser',
		component: './RandomUser',
		icon: 'ArrowsAltOutlined',
	},
	{
		path: '/lich_hen',
		name: 'LichHen',
		component: './LichHen/LichHen',
		icon: 'ArrowsAltOutlined',
	},
	{
		path: '/lich_hen',
		name: 'Lịch Hẹn',
		component: './LichHen/LichHen',
		icon: 'ArrowsAltOutlined',
	},
	{
		path: '/dich-vu',
		name: 'Dịch vụ',
		icon: 'AppstoreOutlined',
		routes: [
			{	
				path: '/dich-vu/dat-lich',
				name: 'Đặt lịch',
				component: './DichVu/DatLich/index',
			},
			
			{
				path: '/dich-vu/danh-gia',
				name: 'Đánh giá',
			},


			{
				path: '/dich-vu/quan-ly',
				name: 'Quản lý',
				routes: 
				[
					{
						path: '/dich-vu/quan-ly/nhan-vien',
						name: 'Quản lý nhân viên',
						component: './DichVu/QuanLy/NhanVien/Employee',
					},

					{
						path: '/dich-vu/quan-ly/dich-vu',
						name: 'Quản lý dịch vụ',
						component: './DichVu/QuanLy/DichVu/Service',

					},
		
					{
						path: '/dich-vu/quan-ly/lich-hen',
						name: 'Quản lý lịch hẹn',
						component: './DichVu/QuanLy/LichHen/index',
					},
		
					{
						path: '/dich-vu/quan-ly/phan-hoi-danh-gia',
						name: 'Phản hồi đánh giá',
					},
		
					{
						path: '/dich-vu/quan-ly/thong-ke',
						name: 'Thống kê',
					},
				]
			},

	{
		path: '/baocao',
		name: 'Thống kê và Báo cáo',
		component: './baocao/baocao',
		icon: 'ArrowsAltOutlined',
	},
	// {
	// 	path:'/nhan_vien-dich_vu',
	// 	name :'Quản lý Nhân viên và Dịch vụ',
	// 	icon :'ArrowsAltOutlined',
	// 	routes : [
	// 		{
	// 			path:'/nhan_vien',
	// 			name :'Quản lý Nhân viênviên',
	// 			icon :'ArrowsAltOutlined',
	// 			component :'./NhanVienNhanVien',
	// 		},
	// 		{
	// 			path:'/dich_vuvu',
	// 			name :'Quản lý Dịch vụ',
	// 			icon :'ArrowsAltOutlined',
	// 			component :,
	// 		}
	// 	]


	// }
	// DANH MUC HE THONG
	// {
	// 	name: 'DanhMuc',
	// 	path: '/danh-muc',
	// 	icon: 'copy',
	// 	routes: [
	// 		{
	// 			name: 'ChucVu',
	// 			path: 'chuc-vu',
	// 			component: './DanhMuc/ChucVu',
	// 		},
	// 	],
	// },

	{
		path: '/notification',
		routes: [
			{
				path: './subscribe',
				exact: true,
				component: './ThongBao/Subscribe',
			},
			{
				path: './check',
				exact: true,
				component: './ThongBao/Check',
			},
			{
				path: './',
				exact: true,
				component: './ThongBao/NotifOneSignal',
			},
		],
		layout: false,
		hideInMenu: true,
	},
	{
		path: '/',
	},
	{
		path: '/403',
		component: './exception/403/403Page',
		layout: false,
	},
	{
		path: '/hold-on',
		component: './exception/DangCapNhat',
		layout: false,
	},
	{
		component: './exception/404',
	},
];
