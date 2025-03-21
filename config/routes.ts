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
		path: '/toDo',
		name: 'To Do List',
		component: './TodoList',
		icon: 'CheckSquareOutlined',
	},


	{
		path: '/tro-choi-doan-so',
		name: 'Trò chơi đoán số',
		component: './GuessNumberGame/GuessNumberGame',
		icon: 'BulbOutlined',
	},

	{
		path: '/hoc-tap',
		name: 'Quản lý học tập',
		icon: 'EditOutlined',
		routes: [
			{
				path: '/hoc-tap/tien-trinh-hoc-tap',
				name: 'Tiến trình học tập',
				component: './StudyProgress',
			},
			{
				name: 'Quản lý môn học',
				path: '/hoc-tap/mon-hoc',
				component: './StudyTracker/StudyTracker',
			},
		],
	},

	{
		path: '/oan-tu-ti',
		name: 'Oẳn tù tì',
		component: './OanTuTi/index',
		icon: 'QuestionCircleOutlined',
	},

	{
		path: '/ngan-hang-cau-hoi-tl',
		name: 'Ngân hàng câu hỏi tự luận',
		icon: 'FileTextOutlined',
		routes: [
			{
				path: '/ngan-hang-cau-hoi-tl/danh-muc-khoi-kien-thuc',
				name: 'Danh mục khối kiến thức',
				component: './KhoiKienThuc/KnowledgePage'
			},

			{
				path: '/ngan-hang-cau-hoi-tl/danh-muc-mon-hoc',
				name: 'Danh mục môn học',
				component: './MonHoc/Subject'
			},

			{
				path: './ngan-hang-cau-hoi-tl/quan-ly-cau-hoi',
				name: 'Câu hỏi',
				component: './QuestionBank',
				icon: 'FileTextOutlined',
			},

			{
				path: '/ngan-hang-cau-hoi-tl/quan-ly-de-thi',
				name: 'Quản lý đề thi',
				routes: [
					{
						path: '/ngan-hang-cau-hoi-tl/quan-ly-de-thi/cau-truc-de-thi',
						name: 'Cấu trúc đề thi',
						component: '../components/DeThi/ExamStructure',
					},
					{
						path: '/ngan-hang-cau-hoi-tl/quan-ly-de-thi/de-thi',
						name: 'Danh sách đề thi',
						component: '../components/DeThi/ExamList',
					},
				]
			}
		],
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
				component: './DichVu/DanhGia/index',
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
						component: './DichVu/QuanLy/DanhGia/index',
					},
		
					{
						path: '/dich-vu/quan-ly/thong-ke',
						name: 'Thống kê',
						component: './DichVu/QuanLy/ThongKe/index',
					},
				]
			},
	
		]
	},

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
