import React, { useState, useEffect, useCallback } from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';
import { db } from '../firebase';
import { useAuth } from '../Context/AuthContext';

function useMessages() {
	const [messages, setMessages] = useState([]);

	useEffect(() => {
		db.ref()
			.child('chats')
			.on('child_added', snapshot => {
				const newMessage = {
					text: snapshot.val().text,
					userId: snapshot.val().userId,
					userName: snapshot.val().userName,
					userPic: snapshot.val().userPic,
					time: snapshot.val().time,
				};
				setMessages(messages => [...messages, newMessage]);
			});
	}, []);

	return messages;
}

export default function Chat() {
	const [text, setText] = useState('');
	const { currentUser } = useAuth();
	const messages = useMessages();

	const Id = currentUser.uid;

	async function sendMessage(e) {
		e.preventDefault();
		await db.ref('chats').push({
			text: text,
			userId: Id,
			userName: currentUser.displayName,
			userPic: currentUser.photoURL,
			time: Date.now(),
		});
		setText('');
	}

	const setRef = useCallback(node => {
		if (node) {
			node.scrollIntoView({ smooth: true });
		}
	}, []);

	return (
		<div className='d-flex flex-column flex-grow-1'>
			<div className='flex-grow-1 overflow-auto'>
				<div className='d-flex flex-column align-items-start justify-content-end px-3'>
					<div className='my-3'></div>
					{messages.map((message, index) => {
						const lastMessage = messages.length - 1 === index;
						return (
							<div
								ref={lastMessage ? setRef : null}
								key={index}
								className={`d-flex flex-column mx-5 ${
									message.userId === Id ? 'align-self-end align-items-end' : 'align-items-start'
								}`}>
								<div className={`d-flex ${message.userId === Id ? '' : 'flex-row-reverse'} `}>
									<div
										className={`rounded px-2 py-1 m-2 ${
											message.userId === Id ? 'bg-primary text-white' : 'border'
										}`}>
										{message.text}
									</div>
									<div>
										<img
											src={message.userPic}
											width='60px'
											height='60px'
											style={{ borderRadius: 100 + '%' }}
										/>
									</div>
								</div>
								<div className={`text-muted small ${message.userId === Id ? 'ml-2' : ''}`}>
									{message.userId === Id ? 'You' : message.userName || message.userId}
								</div>
							</div>
						);
					})}
				</div>
			</div>
			<Form onSubmit={sendMessage}>
				<Form.Group className='mb-5 mt-3'>
					<InputGroup>
						<Form.Control
							as='textarea'
							required
							value={text}
							onChange={e => setText(e.target.value)}
							style={{ height: '75px', resize: 'none' }}
						/>
						<InputGroup.Append>
							<Button type='submit' style={{ height: '75px' }}>
								Send
							</Button>
						</InputGroup.Append>
					</InputGroup>
				</Form.Group>
			</Form>
		</div>
	);
}
