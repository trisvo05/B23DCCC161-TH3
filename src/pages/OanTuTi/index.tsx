import { useState } from 'react';
import { Button, List, Typography } from 'antd';
import './OanTuTi.css';

const { Title, Text } = Typography;

const luaChon = ['Búa', 'Kéo', 'Bao'];

const randomLuaChon = () => {
	const random = Math.floor(Math.random() * 3);
	return luaChon[random];
};

const getKetQua = (playerluaChon: string, computerluaChon: string): string => {
	if (playerluaChon === computerluaChon) return 'Hòa';
	switch (playerluaChon) {
		case 'Búa':
			return computerluaChon === 'Kéo' ? 'Thắng' : 'Thua';
		case 'Kéo':
			return computerluaChon === 'Bao' ? 'Thắng' : 'Thua';
		case 'Bao':
			return computerluaChon === 'Búa' ? 'Thắng' : 'Thua';
		default:
			return '';
	}
};

const OanTuTi = () => {
	const [history, setHistory] = useState<{ playerluaChon: string; computerluaChon: string; gameResult: string }[]>([]);
	const [result, setResult] = useState<string>('');

	const handleChoice = (playerluaChon: string) => {
		const computerluaChon = randomLuaChon();
		const gameResult = getKetQua(playerluaChon, computerluaChon);

		setResult(`Bạn chọn: ${playerluaChon} - Máy chọn: ${computerluaChon} - Kết quả: ${gameResult}`);
		setHistory([...history, { playerluaChon, computerluaChon, gameResult }]);
	};

	return (
		<div className='container'>
			<Title level={2}>Oẳn Tù Tì</Title>
			<div className='buttons'>
				{luaChon.map((choice) => (
					<Button key={choice} onClick={() => handleChoice(choice)} type='primary'>
						{choice}
					</Button>
				))}
			</div>
			<div className='result'>
				<Text>{result}</Text>
			</div>
			<div className='history'>
				<Title level={3}>Lịch sử</Title>
				<List
					bordered
					dataSource={history}
					renderItem={(item, index) => (
						<List.Item key={index}>
							Bạn chọn {item.playerluaChon}, Máy chọn {item.computerluaChon}: {item.gameResult}
						</List.Item>
					)}
				/>
			</div>
		</div>
	);
};

export default OanTuTi;